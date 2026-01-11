# E-commerce Frontend - React with Keycloak

This is the frontend application for the microservices-based e-commerce platform with Keycloak authentication.

## Architecture

- **Framework**: Next.js 15 (React)
- **Authentication**: Keycloak (OAuth2/OpenID Connect)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API

## Features

### Authentication & Authorization

- OAuth2/OpenID Connect via Keycloak
- JWT token management with automatic refresh
- Role-based access control (ADMIN, CLIENT)
- Protected routes
- Session management

### Products Management (ADMIN)

- View all products
- Add new products
- Edit existing products
- Delete products
- Stock management

### Products Catalog (CLIENT & ADMIN)

- Browse product catalog
- View product details
- Check stock availability

### Orders Management

- **CLIENT**: Create orders, view own orders
- **ADMIN**: View all orders
- Automatic total calculation
- Stock verification before order creation

### Security Features

- All requests go through API Gateway
- JWT token attached to all API calls
- Token refresh on expiration
- Error handling for 401 (Unauthorized) and 403 (Forbidden)

## Configuration

### 1. Keycloak Configuration

Before running the application, ensure Keycloak is configured with:

**Realm**: `ecommerce-realm`
**Client**: `ecommerce-client`
**Roles**: `ADMIN`, `CLIENT`

Update the Keycloak configuration in `lib/keycloak.ts` if needed:

```typescript
const keycloakConfig = {
  url: "http://localhost:8080", // Keycloak server URL
  realm: "ecommerce-realm", // Your realm name
  clientId: "ecommerce-client", // Your client ID
};
```

### 2. API Gateway Configuration

Update the API Gateway URL in `lib/api.ts` if needed:

```typescript
const API_GATEWAY_URL = "http://localhost:8888"; // Your Gateway URL
```

### 3. Keycloak Client Settings

In Keycloak Admin Console, configure your client:

1. **Access Type**: public
2. **Valid Redirect URIs**: `http://localhost:3000/*`
3. **Web Origins**: `http://localhost:3000`
4. **Standard Flow Enabled**: ON
5. **Direct Access Grants Enabled**: ON

## Installation

```bash
cd frontend
npm install
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx                 # Root layout with AuthProvider
│   ├── page.tsx                   # Home/Login page
│   ├── products/
│   │   ├── page.tsx              # Products list
│   │   ├── new/
│   │   │   └── page.tsx          # Add product (ADMIN)
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx      # Edit product (ADMIN)
│   └── orders/
│       ├── page.tsx              # Orders list
│       └── new/
│           └── page.tsx          # Create order (CLIENT)
├── components/
│   ├── Navbar.tsx                # Navigation component
│   └── ProtectedRoute.tsx        # Route protection HOC
├── contexts/
│   └── AuthContext.tsx           # Authentication context
├── lib/
│   ├── keycloak.ts               # Keycloak configuration
│   └── api.ts                    # API client with interceptors
├── types/
│   └── index.ts                  # TypeScript interfaces
└── public/
    └── silent-check-sso.html     # SSO silent check
```

## API Endpoints

All requests go through the API Gateway at `http://localhost:8888`

### Products Service

- `GET /product-service/api/products` - List all products
- `GET /product-service/api/products/{id}` - Get product by ID
- `POST /product-service/api/products` - Create product (ADMIN)
- `PUT /product-service/api/products/{id}` - Update product (ADMIN)
- `DELETE /product-service/api/products/{id}` - Delete product (ADMIN)

### Orders Service

- `GET /order-service/api/orders` - List all orders (ADMIN)
- `GET /order-service/api/orders/my-orders` - Get user's orders (CLIENT)
- `GET /order-service/api/orders/{id}` - Get order by ID
- `POST /order-service/api/orders` - Create order (CLIENT)

## User Roles & Permissions

### ADMIN Role

- View all products
- Add/Edit/Delete products
- View all orders from all users

### CLIENT Role

- View product catalog
- Create orders
- View only their own orders

## Error Handling

The application handles common HTTP errors:

- **401 Unauthorized**: Attempts token refresh, redirects to login if failed
- **403 Forbidden**: Displays access denied message
- **400 Bad Request**: Shows validation errors
- **500 Server Error**: Shows generic error message

## Security Features

1. **Token Management**

   - JWT tokens automatically attached to requests
   - Automatic token refresh before expiration
   - Secure token storage

2. **Route Protection**

   - Protected routes require authentication
   - Role-based route access
   - Automatic redirection for unauthorized access

3. **API Security**
   - All requests via API Gateway only
   - Token validation on each request
   - CORS configured properly

## Testing Users

Create test users in Keycloak with appropriate roles:

### Admin User

- Username: `admin`
- Role: `ADMIN`

### Client User

- Username: `client`
- Role: `CLIENT`

## Troubleshooting

### Keycloak Connection Issues

- Verify Keycloak is running on `http://localhost:8080`
- Check realm and client configuration
- Verify redirect URIs are correct

### API Gateway Issues

- Ensure Gateway is running on `http://localhost:8888`
- Check Gateway routing configuration
- Verify JWT validation is configured

### CORS Errors

- Add frontend URL to Gateway CORS configuration
- Check Keycloak Web Origins setting

## Development Notes

- The application uses React Server Components and Client Components appropriately
- All pages with authentication are marked with `'use client'` directive
- TypeScript is used for type safety
- Tailwind CSS for styling with responsive design

---

For detailed configuration instructions, see [CONFIGURATION.md](CONFIGURATION.md)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
