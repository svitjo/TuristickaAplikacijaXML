FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build
WORKDIR /src
COPY AuthService/AuthService/AuthService ./AuthService
COPY BlogService/BlogService/BlogService ./BlogService
COPY TourService/TourService/TourService ./TourService
COPY PurchaseService/PurchaseService/PurchaseService ./PurchaseService
COPY TourExecutionService/TourExecutionService/TourExecutionService ./TourExecutionService
COPY GatewayService/GatewayService/GatewayService ./GatewayService
RUN dotnet publish AuthService/AuthService.csproj -c Release -o /out/auth \
 && dotnet publish BlogService/BlogService.csproj -c Release -o /out/blog \
 && dotnet publish TourService/TourService.csproj -c Release -o /out/tour \
 && dotnet publish PurchaseService/PurchaseService.csproj -c Release -o /out/purchase \
 && dotnet publish TourExecutionService/TourExecutionService.csproj -c Release -o /out/execution \
 && dotnet publish GatewayService/GatewayService.csproj -c Release -o /out/gateway

FROM node:20-alpine AS fe-build
WORKDIR /fe
COPY FE/touris-app/package.json ./
RUN npm install
COPY FE/touris-app/ ./
# Same-origin API via nginx proxy
ENV REACT_APP_API_URL=
RUN npm run build

FROM mcr.microsoft.com/dotnet/aspnet:8.0
RUN apt-get update && apt-get install -y --no-install-recommends nginx supervisor curl \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=dotnet-build /out/auth /app/auth
COPY --from=dotnet-build /out/blog /app/blog
COPY --from=dotnet-build /out/tour /app/tour
COPY --from=dotnet-build /out/purchase /app/purchase
COPY --from=dotnet-build /out/execution /app/execution
COPY --from=dotnet-build /out/gateway /app/gateway
COPY --from=fe-build /fe/build /var/www/html
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf
COPY deploy/nginx/default.conf /etc/nginx/conf.d/app.conf
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY deploy/gateway.ocelot.docker.json /app/gateway/ocelot.Docker.json
ENV ASPNETCORE_ENVIRONMENT=Docker
ENV ASPNETCORE_URLS=http://+:8080
ENV MongoDB__ConnectionString=mongodb://localhost:27017
EXPOSE 80
COPY deploy/start.sh /start.sh
COPY deploy/run-service.sh /run-service.sh
RUN chmod +x /start.sh /run-service.sh
CMD ["/start.sh"]
