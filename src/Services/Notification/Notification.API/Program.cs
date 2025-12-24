using Common.Logging;
using HealthChecks.UI.Client;
using MassTransit;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Notification.API.Consumers;
using RabbitMQ.Client;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Logs
builder.Host.UseSerilog(SerilogExtension.ConfigureLogger);

// MassTransit (RabbitMQ)
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<PaymentSuceedConsumer>(); // Registrando o Cosumidor
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("rabbitmq", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });
        cfg.ReceiveEndpoint("notification-payment-suceed", e =>
        {
            e.ConfigureConsumer<PaymentSuceedConsumer>(context);
        });
    });
});

// Health Checks 
builder.Services.AddHealthChecks().AddRabbitMQ(
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

app.Run();