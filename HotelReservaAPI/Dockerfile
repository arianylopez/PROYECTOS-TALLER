FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["HotelReservaAPI/HotelReservaAPI.csproj", "HotelReservaAPI/"]
RUN dotnet restore "HotelReservaAPI/HotelReservaAPI.csproj"

COPY . .
WORKDIR "/src/HotelReservaAPI"
RUN dotnet publish "HotelReservaAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "HotelReservaAPI.dll"]