using Identity.Application.Commands.RegisterUser; // Registra o MediatR
using Identity.Application.Interfaces;
using Identity.Domain.Interfaces;
using Identity.Infrastructure.Persistence;
using Identity.Infrastructure.Persistence.Context;
using Identity.Infrastructure.Persistence.Repositories;
using Identity.Infrastructure.Services.Token;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using System.Text;

// --- Configuração da Aplicação ---
var builder = WebApplication.CreateBuilder(args);

MongoDbConfig.Configure();

var services = builder.Services;
var configuration = builder.Configuration;


// 1. ⚙️ Configuração do MongoDB
// Chama o mapeamento BSON (que você criou no MongoDbConfig)
MongoDbConfig.Configure();

// Registra o contexto do MongoDB para Injeção de Dependência
services.AddSingleton<IdentityContext>();


// 2. 🔗 Registro das Interfaces (Injeção de Dependência)
// Diz ao .NET: Sempre que alguém pedir IUserRepository, entregue UserRepository.
services.AddScoped<IUserRepository, UserRepository>();
services.AddScoped<ITokenService, JwtTokenService>();

// 3. 🧠 Configuração do MediatR (CQRS)
// Adiciona o MediatR e diz para ele procurar Handlers no assembly da Application
// O typeof() aqui é só para dar um "ponteiro" para onde o MediatR deve procurar.
services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterUserCommand).Assembly));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var jwtSettings = builder.Configuration.GetSection("JwtSettings");
    var secretKey = jwtSettings["Secret"];
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

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"🔥🔥 AUTH FALHOU: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("✅ AUTH SUCESSO: Token validado!");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"🛡️ AUTH CHALLENGE: {context.Error}, {context.ErrorDescription}");
            return Task.CompletedTask;
        }
    };
});


// 4. 🌐 Configuração Padrão da API
services.AddControllers();
services.AddEndpointsApiExplorer();

// Configuração do Swagger com suporte a JWT
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Identity.API", Version = "v1" });

    // Define o esquema de segurança (Botão "Authorize")
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT desta maneira: Bearer {seu_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});



var app = builder.Build();


// 5. 🛠️ Configuração do Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();