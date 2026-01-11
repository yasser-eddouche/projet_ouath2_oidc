# E-commerce Microservices Frontend Configuration Guide

## Quick Start

1. **Install Dependencies**
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

2. **Configure Keycloak Connection**

Edit `lib/keycloak.ts`:
\`\`\`typescript
const keycloakConfig = {
url: 'http://localhost:8080', // Your Keycloak URL
realm: 'ecommerce-realm', // Your realm name
clientId: 'ecommerce-client', // Your client ID
};
\`\`\`

3. **Configure API Gateway**

Edit `lib/api.ts`:
\`\`\`typescript
const API_GATEWAY_URL = 'http://localhost:8888'; // Your Gateway URL
\`\`\`

4. **Run the Application**
   \`\`\`bash
   npm run dev
   \`\`\`

Access at: http://localhost:3000

## Keycloak Setup Checklist

### Realm Configuration

- [ ] Create realm: `ecommerce-realm`
- [ ] Create client: `ecommerce-client`
- [ ] Client Access Type: `public`
- [ ] Valid Redirect URIs: `http://localhost:3000/*`
- [ ] Web Origins: `http://localhost:3000`

### Roles Configuration

- [ ] Create realm role: `ADMIN`
- [ ] Create realm role: `CLIENT`

### Test Users

- [ ] Create admin user with `ADMIN` role
- [ ] Create client user with `CLIENT` role

## Backend Services Configuration

Ensure your backend services are running:

- **Keycloak**: http://localhost:8080
- **API Gateway**: http://localhost:8888
- **Product Service**: (behind Gateway)
- **Order Service**: (behind Gateway)
- **Discovery Service**: (for microservices)
- **Config Service**: (for microservices)

## Environment Variables (Optional)

You can create a `.env.local` file:

\`\`\`env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ecommerce-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=ecommerce-client
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8888
\`\`\`

Then update the configuration files to use these variables.

## Testing the Application

1. **Login as ADMIN**

   - Access: All features
   - Can: Create/Edit/Delete products
   - Can: View all orders

2. **Login as CLIENT**
   - Access: Limited features
   - Can: View products
   - Can: Create orders
   - Can: View own orders only

## Common Issues

### Issue: "Failed to initialize Keycloak"

**Solution**: Check Keycloak is running and realm/client are configured correctly

### Issue: "401 Unauthorized"

**Solution**: Check JWT token validation in Gateway and microservices

### Issue: "403 Forbidden"

**Solution**: Verify user has correct roles assigned

### Issue: CORS errors

**Solution**: Add `http://localhost:3000` to Gateway and Keycloak CORS settings

## API Gateway Routes

Ensure your Gateway has these routes configured:

\`\`\`yaml
spring:
cloud:
gateway:
routes: - id: product-service
uri: lb://PRODUCT-SERVICE
predicates: - Path=/product-service/\*\*
filters: - TokenRelay=

        - id: order-service
          uri: lb://ORDER-SERVICE
          predicates:
            - Path=/order-service/**
          filters:
            - TokenRelay=

\`\`\`
