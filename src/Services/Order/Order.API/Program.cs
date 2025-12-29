using Common.Logging;
using HealthChecks.UI.Client;
using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using Order.API.Consumers;
using Order.Application.Commands.CheckoutOrder;
using Order.Domain.Interfaces;
using Order.Infrastructure.Persistence;
using Order.Infrastructure.Persistence.Repositories;
using RabbitMQ.Client;
using Serilog;
using SharpCompress.Compressors.Xz;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog(SerilogExtension.ConfigureLogger);
// 1. Configurar Banco (Order Context apenas!)
MongoDbConfig.Configure();
builder.Services.AddSingleton<OrderContext>();

// 2. Injeção de Dependência (Apenas repositórios de Order)
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
// REMOVIDO: IBasketRepository (O Order não deve mexer no carrinho diretamente)

// 3. MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(CheckoutOrderCommand).Assembly));

// 4. Controllers e Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 5. Configurar Auth (JWT) 
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!)),
        ClockSkew = TimeSpan.Zero
    };
});

// Configuração do Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Order.API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT: {seu_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// 6. Configuração do MassTransit (RabbitMQ) - MODO PUBLICADOR APENAS
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<OrderPaymentSucceededConsumer>();
    var rabbitHost = builder.Configuration["RabbitMQ:Host"] ?? "rabbitmq";
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(rabbitHost, "/", h => // Atenção: "rabbitmq" ou "localhost" dependendo se roda no docker ou fora
        {
            h.Username("guest");
            h.Password("guest");
        });

        cfg.ReceiveEndpoint("order-payment-succeeded", e =>
        {
            e.ConfigureConsumer<OrderPaymentSucceededConsumer>(context);

        });
    });
});

var mongoCnn = builder.Configuration.GetConnectionString("MongoDbConnection");
builder.Services.AddHealthChecks()
    .AddMongoDb(
        sp => new MongoClient(mongoCnn),
        name: "mongodb",
        timeout: TimeSpan.FromSeconds(3))
    .AddRabbitMQ(
        sp => {
            var factory = new ConnectionFactory
            {
                Uri = new Uri("amqp://guest:guest@rabbitmq:5672")
            };
            return factory.CreateConnectionAsync();
        },
        name: "rabbitmq",
        timeout: TimeSpan.FromSeconds(3));


var app = builder.Build();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.UseAuthentication();
app.UseAuthorization();
app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();