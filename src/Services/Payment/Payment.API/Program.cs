using Common.Logging;
using HealthChecks.UI.Client;
using MassTransit;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Payment.API.Consumers;
using RabbitMQ.Client;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1. Logs
builder.Host.UseSerilog(SerilogExtension.ConfigureLogger);

// 2. MassTransit (RabbitMQ)
builder.Services.AddMassTransit(x =>
{
    // Adiciona o consumidor que criamos
    x.AddConsumer<OrderCreatedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("rabbitmq", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        // Cria a fila automaticamente
        cfg.ReceiveEndpoint("payment-order-created", e =>
        {
            e.ConfigureConsumer<OrderCreatedConsumer>(context);
        });
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 3. Health Checks
builder.Services.AddHealthChecks()
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

app.UseSwagger();
app.UseSwaggerUI();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

app.Run();