# FreeMarket

FreeMarket is a SaaS platform for e-commerce that allows businesses to set up and manage their own online store without building infrastructure from scratch. It provides a customizable storefront, product catalog management, order and delivery tracking, and an admin panel — all configurable per tenant.

## Architecture overview

FreeMarket is built as a microservices system. Each service runs independently and communicates through an API Gateway at `http://localhost:8086`.

| Service | Responsibility |
|---|---|
| `auth-service` | User registration, login, JWT auth, refresh tokens, password reset |
| `product-service` | Product catalog, stock management |
| `reserve-service` | Order creation, cancellation, idempotency |
| `delivery-service` | Delivery assignment, status tracking |
| `locations-service` | User address geocoding via OpenStreetMap (Nominatim) |
| `config-service` | Tenant branding (colors, fonts, logo, favicon) |
| `privileges-service` | Managing rol privileges |
| `eureka-server` | Service discovery and registration |
| `api-gateway` | Single entry point for all services, routing and header forwarding |

The frontend is a single Angular application that consumes all services through the gateway.

---

## Features

### Storefront (user-facing)
- Browse and filter products by price and stock
- Add products to cart and place orders (reservations)
- View order history and delivery status
- Manage profile: username, email, gender, password
- Set delivery address with region/comuna dropdown (all Chilean regions included)
- Fully branded UI: colors, fonts, logo and favicon configurable by the store admin

### Admin panel
- Product management: create, edit, delete products with image upload (drag & drop or URL)
- Order overview
- Delivery management with status updates
- Store configuration: brand name, logo, favicon, primary/secondary color, font

### Delivery panel
- View assigned deliveries
- Update delivery status (`PENDIENTE` → `EN_CAMINO` → `ENTREGADO`)

---

## Getting started

### Prerequisites

- Java 21+
- Node.js 20+
- Docker (recommended for running services)
- Angular CLI: `npm install -g @angular/cli`

### Running the frontend

```bash
git clone <repo-url>
cd freemarket-frontend
npm install
ng serve
```

The app runs at `http://localhost:4200`.

### Running the backend services

Each microservice is a Spring Boot application. Run them individually or use Docker Compose if available:

```bash
# Example for auth-service
cd auth-service
./mvnw spring-boot:run
```

All services are exposed through the API Gateway at port `8086`.

---

## Environment configuration

The API base URL is hardcoded in each Angular service as `http://localhost:8086/api-v1`. To change it for production, update each service file or extract it to an Angular environment file at `src/environments/environment.ts`.

---

## Authentication

FreeMarket uses JWT with refresh tokens.

- On login, the frontend stores `token` and `refreshToken` in `localStorage`.
- Every HTTP request automatically attaches the `Authorization: Bearer <token>` header via an Angular interceptor.
- On 401 responses, the interceptor automatically attempts a token refresh. If the refresh fails, the session is cleared and the user is redirected to `/login`.
- Protected endpoints also require the `X-User-Id` header, which is sent explicitly where needed.

### User roles

| Role | Access |
|---|---|
| `USER` | Storefront, orders, profile |
| `ADMIN` | Admin panel, product and config management |
| `DELIVERY` | Delivery panel |

After login, users are redirected to their role-specific route (`/home`, `/admin`, `/delivery`).

---

## Store configuration (SaaS)

The admin can customize the storefront appearance from **Settings → Visual style**:

- **Primary color**: used for buttons and CTAs
- **Secondary color**: used for hover states
- **Font**: applied globally across the storefront
- **Logo**: shown in the navbar
- **Favicon**: shown in the browser tab
- **Store name**: shown in the navbar and browser title

Changes apply instantly across the entire storefront via CSS variables injected into the document root.

---

## Key API endpoints

### Auth — `/api-v1/auth`
| Method | Path | Description |
|---|---|---|
| POST | `/login` | Login, returns JWT + refresh token |
| POST | `/register` | Register new user |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Invalidate refresh token |
| PATCH | `/update` | Update user profile (requires `X-User-Id` header) |

### Products — `/api-v1/products`
| Method | Path | Description |
|---|---|---|
| GET | `/getall` | Get all products |
| POST | `/create` | Create product |
| PUT | `/update/{id}` | Update product |
| DELETE | `/delete/{id}` | Delete product |

### Reserves — `/api-v1/reserve`
| Method | Path | Description |
|---|---|---|
| POST | `/createReserve` | Create order (requires `X-User-Id` header) |
| PATCH | `/cancel` | Cancel order (requires `X-User-Id` header) |
| GET | `/user/{idUser}` | Get all orders for a user |

### Delivery — `/api-v1/delivery`
| Method | Path | Description |
|---|---|---|
| GET | `/usuario/{idUsuario}` | Get deliveries for a user |
| GET | `/delivery/{idRepartidor}` | Get deliveries for a courier |
| PATCH | `/take` | Assign courier to delivery |
| PATCH | `/reserva/status/{idReserva}` | Update delivery status |

### Location — `/api-v1/location`
| Method | Path | Description |
|---|---|---|
| POST | `/createLocation` | Create user address (requires `X-User-Id` header) |
| PUT | `/updateLocation` | Update user address (requires `X-User-Id` header) |
| GET | `/getLocation/{id}` | Get user address |

### Config — `/api-v1/config`
| Method | Path | Description |
|---|---|---|
| GET | `/public` | Get current store config (public) |
| PATCH | `/update/{id}` | Update store config |

---

## Order lifecycle

```
Cart → createReserve → RESERVADO
                     → PENDIENTE (if auth-service unavailable, resolved async)

RESERVADO → delivery created automatically → PENDIENTE
         → courier takes delivery          → EN_CAMINO
         → courier marks delivered         → ENTREGADO
         → reserve marked                  → COMPLETO

Any state → cancel → CANCELADO (stock restored)
```

---

## Address geocoding

User addresses are geocoded using **Nominatim (OpenStreetMap)**. The system attempts three strategies in order:

1. Structured search (street + number + comuna)
2. Free-text search
3. Street-only search

If all fail, the address is saved with the comuna center coordinates as fallback so the order is not blocked.

---

## Frontend route structure

| Route | Component | Role |
|---|---|---|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/home` | HomePage | USER |
| `/shop` | CatalogPage | USER |
| `/profile` | ProfilePage | USER, ADMIN, DELIVERY |
| `/orders` | OrdersPage | USER |
| `/admin` | AdminDashboard | ADMIN |
| `/admin/productos` | ProductosPage | ADMIN |
| `/admin/configuraciones` | ConfiguracionesPage | ADMIN |
| `/admin/analytics` | AnalyticsPage | ADMIN |
| `/delivery` | DeliveryPage | DELIVERY |
| `/**` | NotFoundPage | Public |

---

## Notes

- Products with `stock = 0` are displayed as **out of stock** and cannot be added to the cart.
- The cart persists in memory during the session and is cleared on logout.
- Idempotency keys are used on order creation to prevent duplicate orders on network retries.
- All currency values are displayed in **CLP (Chilean Peso)** format.
- The region/comuna selector covers all 16 Chilean regions and their respective comunas.