first time:
```bash
pnpm install
pnpm db:start
pnpm drizzle:push
pnpm dev
```

other times:
```bash
pnpm db:start
pnpm dev
```

stop:
```bash
pnpm db:stop
```

server update
```bash
docker compose down
docker pull ghcr.io/philip2809/sysm8-spheres
docker compose up -d
```

server db flush: (while down)
```bash
pnpm drizzle-kit generate
ocker volume rm azureuser_pgdata
docker compose up -d --no-deps db
cat 0.sql | docker compose exec -T db psql -U spheres -d spheres
docker compose down
```

Vi har byggt Spheres, en social webbapp byggd med NextJS, använder typescript och react, postgres med drizzle orm för vår databas. Vi valde detta för att minimera på olika system som vi behöver uppehålla då vi endast var två i vår grupp. React och NextJS gör det lätt för oss att lägga till fler fuktioner, implementera tester och feature slices. Går snabbt att prototypa osv. Drizzle ORM ger os migrationer så att vi inte behöver oroa oss för att bli av med data mellan olika versioner. Vi använder docker för att deploya då det gör det lätt att pakcetera och köra allt på ett säkert sätt. Det ändå som vi behöver hålla i åtakne är att hela tiden hålla oss uppdaterade när säkerhetsläckor upptäcks i docker eller NextJS, eftersom det är välanvända packet, så söks det efter mycket. 

Github Actions är väl definierat och vi kunde använda en template för vår CI/CD som bygger enligt dockerfile-filen, den behövdes ställas in korrekt efter vårt projekt och NextJS. 

Om vi ska förbättra systemet så hade ett realtime system för liveuppdateringa, exempelvis Socket.io, användas. Så att när en användare lägger till en ny pin så ska den dyka upp för alla. Feature slicingen just nu görs via olika komonenter, den hade nog också kunnat hanterats bättre, men den funkar så som vi vill den. Feature flags hade dock förbättrat systemet drasitskt. 