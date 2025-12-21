var builder = WebApplication.CreateBuilder(args);

// ========================================
// 🎯 CONFIGURAÇÃO DO API GATEWAY (YARP)
// ========================================

// 1. Adicionar YARP (Reverse Proxy da Microsoft)
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// 2. Adicionar CORS (importante para aplicações web frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 3. Controllers (se precisar de endpoints customizados no Gateway)
builder.Services.AddControllers();

// 4. OpenAPI/Swagger (opcional, para documentação)
builder.Services.AddOpenApi();

var app = builder.Build();

// ========================================
// 🔧 MIDDLEWARE PIPELINE
// ========================================

// 1. Swagger (apenas em Development)
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// 2. CORS (deve vir ANTES do YARP)
app.UseCors("AllowAll");

// 3. HTTPS Redirect
app.UseHttpsRedirection();

// 4. Autenticação e Autorização (se necessário no futuro)
// app.UseAuthentication();
// app.UseAuthorization();

// 5. Controllers customizados (se houver)
app.MapControllers();

// 6. 🚀 YARP - Proxy Reverso (DEVE SER O ÚLTIMO!)
app.MapReverseProxy();

Console.WriteLine("🌐 API Gateway rodando em: https://localhost:7100");
Console.WriteLine("📡 Roteando para:");
Console.WriteLine("   - Identity API: https://localhost:44349");
Console.WriteLine("   - Catalog API:  https://localhost:7245");
Console.WriteLine("   - Basket API:   https://localhost:44314");
Console.WriteLine("   - Order API:    https://localhost:44320");

app.Run();
