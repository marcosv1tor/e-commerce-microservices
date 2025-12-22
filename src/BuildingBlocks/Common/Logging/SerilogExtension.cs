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
            .MinimumLevel.Debug()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
            .MinimumLevel.Override("Microsoft.Extensions.Http.Resilience", LogEventLevel.Information)
            .MinimumLevel.Override("Polly", LogEventLevel.Debug)
            .Enrich.FromLogContext()
            .Enrich.WithProperty("ApplicationName", env.ApplicationName)
            .Enrich.WithProperty("Environment", env.EnvironmentName)
            .WriteTo.Console()
            .WriteTo.Seq("http://seq:5341");
    };
}