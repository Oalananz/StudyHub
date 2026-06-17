using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using StudyHub.Api.Data;
using StudyHub.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ----- Hosting port -----
// Render (and most PaaS) inject a PORT env var the app must listen on.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ----- Database -----
// Accept either an Npgsql key/value string (local) or a postgres:// URL (Render / Supabase / Heroku-style).
var rawConnection = builder.Configuration.GetConnectionString("Default")
                    ?? Environment.GetEnvironmentVariable("DATABASE_URL");
var connectionString = NormalizePostgresConnectionString(rawConnection);
builder.Services.AddDbContext<AppDbContext>(opt => opt.UseNpgsql(connectionString));

// ----- Auth -----
var jwt = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!))
        };
    });
builder.Services.AddAuthorization();

// ----- App services -----
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<GamificationService>();

// ----- CORS -----
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:3000" };
builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>
    p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Study Hub API", Version = "v1" });
    var scheme = new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
    };
    c.AddSecurityDefinition("Bearer", scheme);
    c.AddSecurityRequirement(new() { [scheme] = Array.Empty<string>() });
});

var app = builder.Build();

// ----- Create / migrate database with retry (Postgres may still be starting). -----
await EnsureDatabaseAsync(app);

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/", () => Results.Ok(new { service = "Study Hub API", status = "ok", docs = "/swagger" }));
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.Run();

// Converts a postgres:// or postgresql:// URL into the Npgsql key/value format.
// Passes through strings that are already in key/value form (local dev / Docker).
static string NormalizePostgresConnectionString(string? raw)
{
    if (string.IsNullOrWhiteSpace(raw))
        throw new InvalidOperationException(
            "No database connection string. Set ConnectionStrings__Default or DATABASE_URL.");

    if (!raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) &&
        !raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        return raw;

    var uri = new Uri(raw);
    var userInfo = uri.UserInfo.Split(':', 2);
    var database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));

    var sb = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Database = string.IsNullOrEmpty(database) ? "postgres" : database,
        Username = Uri.UnescapeDataString(userInfo[0]),
        Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
        // Prefer = use SSL when the server offers/requires it (Supabase, Render external),
        // fall back to plaintext for internal connections that don't. Npgsql 8 does not
        // validate the server certificate in Prefer/Require mode, which suits managed PaaS DBs.
        SslMode = SslMode.Prefer
    };
    return sb.ConnectionString;
}

static async Task EnsureDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    for (var attempt = 1; attempt <= 10; attempt++)
    {
        try
        {
            await db.Database.EnsureCreatedAsync();
            logger.LogInformation("Database ready.");
            return;
        }
        catch (Exception ex)
        {
            logger.LogWarning("Database not ready (attempt {Attempt}/10): {Message}", attempt, ex.Message);
            await Task.Delay(TimeSpan.FromSeconds(3));
        }
    }
    throw new Exception("Could not connect to the database after 10 attempts.");
}
