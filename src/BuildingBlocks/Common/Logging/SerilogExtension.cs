using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;

namespace Common.Logging;

public static class SerilogExtension
{
    public static Action<HostBuilderContext, LoggerConfiguration> ConfigureLogger =>
        (context, configuration) =>
        {
            var env = context.HostingEnvironment;

            configuration
                .MinimumLevel.Information()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning) // Ignora logs verbosos do ASP.NET
                .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("ApplicationName", env.ApplicationName) // Nome do Microserviço
                .Enrich.WithProperty("Environment", env.EnvironmentName)
                .WriteTo.Console() // Escreve no terminal preto
                .WriteTo.Seq("http://seq:5341"); // Escreve no Seq (nome do container)
        };
}