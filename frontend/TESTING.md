# Frontend Testing Guide

## Prerequisites

Before testing, ensure all services are running:

1. **Keycloak** - http://localhost:8080
2. **Config Service** - Manages configuration
3. **Discovery Service** - Service registry
4. **API Gateway** - http://localhost:8888
5. **Product Service** - Behind Gateway
6. **Order Service** - Behind Gateway

## Step 1: Configure Keycloak

### Create Realm

1. Open Keycloak Admin Console: http://localhost:8080
2. Login with admin credentials
3. Create new realm: `ecommerce-realm`

### Create Client

1. Go to Clients → Create
2. Client ID: `ecommerce-client`
3. Client Protocol: `openid-connect`
4. Save

### Configure Client Settings

1. Access Type: `public`
2. Standard Flow Enabled: `ON`
3. Direct Access Grants Enabled: `ON`
4. Valid Redirect URIs: `http://localhost:3000/*`
5. Web Origins: `http://localhost:3000`
6. Save

### Create Roles

1. Go to Roles → Add Role
2. Create role: `ADMIN`
3. Create role: `CLIENT`

### Create Test Users

#### Admin User

1. Go to Users → Add User
2. Username: `admin`
3. Email: `admin@example.com`
4. First Name: `Admin`
5. Last Name: `User`
6. Save
7. Go to Credentials tab
8. Set password: `admin123` (disable temporary)
9. Go to Role Mappings tab
10. Assign role: `ADMIN`

#### Client User

1. Go to Users → Add User
2. Username: `client`
3. Email: `client@example.com`
4. First Name: `Client`
5. Last Name: `User`
6. Save
7. Go to Credentials tab
8. Set password: `client123` (disable temporary)
9. Go to Role Mappings tab
10. Assign role: `CLIENT`

## Step 2: Start Backend Services

Make sure all Spring Boot services are running:

```bash
# Start Config Service (port 8888 or configured)
cd config-service
./mvnw spring-boot:run

# Start Discovery Service (port 8761)
cd discovery-service
./mvnw spring-boot:run

# Start Product Service
cd product-service
./mvnw spring-boot:run

# Start Order Service
cd order-service
./mvnw spring-boot:run

# Start Gateway Service (port 8888)
cd gateway-service
./mvnw spring-boot:run
```

## Step 3: Configure Frontend

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies (if not done):

```bash
npm install
```

3. Verify configuration in `lib/keycloak.ts`:

```typescript
const keycloakConfig = {
  url: "http://localhost:8080",
  realm: "ecommerce-realm",
  clientId: "ecommerce-client",
};
```

4. Verify API Gateway URL in `lib/api.ts`:

```typescript
const API_GATEWAY_URL = "http://localhost:8888";
```

## Step 4: Run Frontend

```bash
npm run dev
```

Access the application at: http://localhost:3000

## Testing Scenarios

### Test 1: Login as Admin

1. Go to http://localhost:3000
2. Click "Login with Keycloak"
3. Enter credentials:
   - Username: `admin`
   - Password: `admin123`
4. You should see:
   - Welcome message with admin name
   - ADMIN badge
   - Access to all features

### Test 2: Product Management (ADMIN only)

1. Login as admin
2. Navigate to "Products" page
3. **Test Create Product**:

   - Click "Add New Product"
   - Fill in:
     - Name: `Laptop Dell XPS`
     - Description: `High performance laptop`
     - Price: `1299.99`
     - Stock: `10`
   - Click "Create Product"
   - Verify product appears in list

4. **Test Edit Product**:

   - Click "Edit" on a product
   - Modify details
   - Click "Update Product"
   - Verify changes are saved

5. **Test Delete Product**:
   - Click "Delete" on a product
   - Confirm deletion
   - Verify product is removed

### Test 3: Login as Client

1. Logout from admin
2. Click "Login with Keycloak"
3. Enter credentials:
   - Username: `client`
   - Password: `client123`
4. You should see:
   - CLIENT badge
   - No "Add Product" button
   - No Edit/Delete buttons on products
   - Access to create orders

### Test 4: Order Creation (CLIENT only)

1. Login as client
2. Navigate to "Products" page
3. Verify you can see products but not edit them
4. Click "New Order" or navigate to "/orders/new"
5. **Test Create Order**:

   - Click "Add to Order" on products
   - Adjust quantities
   - Verify total calculation
   - Click "Place Order"
   - Verify order is created

6. Navigate to "Orders" page
7. Verify you can see your order

### Test 5: View All Orders (ADMIN only)

1. Logout and login as admin
2. Navigate to "Orders" page
3. Verify you can see ALL orders from all users

### Test 6: Authorization Testing

**Test Forbidden Access**:

1. Login as CLIENT
2. Try to access admin features:
   - Should not see "Add Product" button
   - Should not see Edit/Delete buttons
3. Try to manually navigate to `/products/new`
   - Should be redirected or see access denied

**Test Token Expiration**:

1. Login to the application
2. Wait for token to expire (or manually invalidate in browser)
3. Try to make an API call
4. Should automatically refresh token or redirect to login

### Test 7: Error Handling

**Test 401 - Unauthorized**:

1. Remove/corrupt the token in browser storage
2. Try to access protected pages
3. Should redirect to login

**Test 403 - Forbidden**:

1. Login as CLIENT
2. Try to access admin endpoints via browser console
3. Should show "Access forbidden" message

**Test Product Out of Stock**:

1. Create a product with 0 stock
2. Try to create an order with that product
3. Should show appropriate error message

## Verification Checklist

### Authentication

- [ ] Can login with admin user
- [ ] Can login with client user
- [ ] User info displays correctly
- [ ] Roles display correctly
- [ ] Can logout successfully

### Products (ADMIN)

- [ ] Can view all products
- [ ] Can create new product
- [ ] Can edit product
- [ ] Can delete product
- [ ] Form validation works

### Products (CLIENT)

- [ ] Can view all products
- [ ] Cannot see Add Product button
- [ ] Cannot see Edit/Delete buttons
- [ ] Cannot access /products/new

### Orders (CLIENT)

- [ ] Can view own orders
- [ ] Can create new order
- [ ] Can add products to order
- [ ] Can adjust quantities
- [ ] Total calculates correctly
- [ ] Cannot see other users' orders

### Orders (ADMIN)

- [ ] Can view all orders
- [ ] Can see orders from all users
- [ ] Order details display correctly

### Security

- [ ] Protected routes require authentication
- [ ] Role-based access control works
- [ ] Token refresh works
- [ ] 401 errors handled correctly
- [ ] 403 errors handled correctly
- [ ] All requests go through Gateway

### UI/UX

- [ ] Responsive design works
- [ ] Navigation is clear
- [ ] Error messages are displayed
- [ ] Loading states are shown
- [ ] Forms are user-friendly

## Troubleshooting

### Issue: "Failed to initialize Keycloak"

**Check:**

- Keycloak is running on port 8080
- Realm name is correct
- Client ID is correct

### Issue: "Failed to fetch products"

**Check:**

- API Gateway is running on port 8888
- Product Service is registered in Discovery Service
- Gateway routes are configured correctly

### Issue: "401 Unauthorized"

**Check:**

- JWT token is being sent in request headers
- Gateway is validating tokens correctly
- Token hasn't expired

### Issue: "403 Forbidden"

**Check:**

- User has correct role assigned in Keycloak
- Role names match exactly (case-sensitive)
- Role mapping is configured in services

### Issue: CORS Errors

**Check:**

- Gateway has CORS configuration
- Keycloak Web Origins includes frontend URL
- Allowed origins are correct

## Advanced Testing

### Test Inter-Service Communication

1. Create an order as CLIENT
2. Verify Order Service calls Product Service to:
   - Check product availability
   - Get product prices
   - Update stock quantities

### Test Token Propagation

1. Use browser dev tools (Network tab)
2. Create an order
3. Verify JWT token is sent in:
   - Frontend → Gateway
   - Gateway → Order Service
   - Order Service → Product Service

### Performance Testing

1. Create multiple products
2. Create multiple orders
3. Verify response times are acceptable
4. Check for any memory leaks

## Success Criteria

✅ All authentication flows work correctly
✅ Role-based access control is enforced
✅ All CRUD operations function properly
✅ Error handling is comprehensive
✅ UI is responsive and user-friendly
✅ Security requirements are met
✅ All requests go through Gateway only
✅ Token management works seamlessly

## Next Steps

After successful testing:

1. Deploy to staging environment
2. Conduct security audit
3. Perform load testing
4. Add automated tests
5. Document API endpoints
6. Create user documentation
