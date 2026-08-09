# Touris — turistička mikroservisna aplikacija (ocena 6)

Stack: **.NET 8**, **React**, **MongoDB**, **Ocelot gateway**, **Docker Compose**.

## Mikroservisi

| Servis | Port (lokalno) | Odgovornost |
|--------|----------------|-------------|
| AuthService | 5001 | registracija, login, JWT, profil |
| BlogService | 5002 | blogovi, follow, komentari |
| TourService | 5003 | ture, ključne tačke, publish |
| PurchaseService | 5004 | korpa, checkout, purchase tokeni |
| TourExecutionService | 5005 | position simulator, izvođenje ture |
| GatewayService | 5000 | Ocelot ulazna tačka |
| FE | 3000 | React klijent |

## Pokretanje preko Docker Compose

```bash
docker compose up --build
```

- API gateway: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## Lokalno (bez Dockera)

1. MongoDB na `localhost:27017`
2. Pokrenuti servise (`dotnet run` u svakom projektu) na portovima 5001–5005
3. Gateway na 5000
4. FE: `cd FE/touris-app && npm install && npm start`

Admin seed: `admin` / `admin123`

## Funkcionalnosti (ocena 6)

1, 4, 5, 6 (bez markdown), 9, 10, 11, 14, 16, 17 + Docker + NoSQL + 3+ servisa + gateway.
