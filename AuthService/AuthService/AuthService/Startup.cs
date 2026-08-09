using System.Text;
using AuthService.Repository;
using AuthService.Service;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace AuthService
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            services.Configure<MongoDBSettings>(Configuration.GetSection("MongoDB"));
            services.Configure<JwtSettings>(Configuration.GetSection("Jwt"));

            services.AddSingleton<AuthMongoDB>(sp =>
            {
                var connectionString = Configuration.GetSection("MongoDB:ConnectionString").Value
                    ?? throw new InvalidOperationException("MongoDB:ConnectionString nije konfigurisan.");
                var databaseName = Configuration.GetSection("MongoDB:DatabaseName").Value
                    ?? throw new InvalidOperationException("MongoDB:DatabaseName nije konfigurisan.");
                return new AuthMongoDB(connectionString, databaseName);
            });

            services.AddScoped<UserRepository>();
            services.AddSingleton<JwtTokenService>();

            var jwtKey = Configuration.GetSection("Jwt:Key").Value
                ?? throw new InvalidOperationException("Jwt:Key nije konfigurisan.");
            var jwtIssuer = Configuration.GetSection("Jwt:Issuer").Value ?? "AuthService";
            var jwtAudience = Configuration.GetSection("Jwt:Audience").Value ?? "TourisApp";

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtIssuer,
                        ValidAudience = jwtAudience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                    };
                });

            services.AddAuthorization();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "AuthService", Version = "v1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
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
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            using (var scope = app.ApplicationServices.CreateScope())
            {
                var users = scope.ServiceProvider.GetRequiredService<UserRepository>();
                users.EnsureAdminExistsAsync().GetAwaiter().GetResult();
            }

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "AuthService v1"));

            app.UseCors("AllowFrontend");
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
