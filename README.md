# SE Group Project Starter

This workspace is split into two folders:

- `fronedt` (frontend)
- `backed` (backend)

## Structure

```text
fronedt/
  index.html
  main.js
  package.json
  tailwind.config.js
  src/input.css
  dist/output.css

backed/
  pom.xml
  .env
  src/main/java/...
  src/main/resources/application.properties
```

## Prerequisites

- Java 17+
- Maven 3.9+
- Node.js 18+

## Run Frontend

```bash
cd fronedt
npm install
npm run build:css
npm run dev
```

Frontend URL: `http://localhost:3000`

## Run Backend

```bash
cd backed
mvn spring-boot:run
```

Backend URL: `http://localhost:5001`
