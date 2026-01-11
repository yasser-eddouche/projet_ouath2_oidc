# Quick Start Guide - Frontend E-commerce

## 🚀 5-Minute Setup

### Prerequisites

- Node.js installed
- Backend services running (Keycloak, Gateway, Microservices)
- Keycloak configured with realm and client

### Step 1: Install Dependencies (1 min)

```bash
cd frontend
npm install
```

### Step 2: Verify Configuration (1 min)

Check `lib/keycloak.ts`:

```typescript
url: 'http://localhost:8080',      // ✅ Keycloak URL
realm: 'ecommerce-realm',           // ✅ Your realm name
clientId: 'ecommerce-client',       // ✅ Your client ID
```

Check `lib/api.ts`:

```typescript
API_GATEWAY_URL = "http://localhost:8888"; // ✅ Gateway URL
```

### Step 3: Run Application (1 min)

```bash
npm run dev
```

### Step 4: Access & Test (2 min)

1. Open http://localhost:3000
2. Click "Login with Keycloak"
3. Login with test credentials
4. Explore the application!

---

## 📋 Keycloak Minimum Configuration

### Create in Keycloak:

1. **Realm**: `ecommerce-realm`
2. **Client**: `ecommerce-client` (public, redirect: `http://localhost:3000/*`)
3. **Roles**: `ADMIN`, `CLIENT`
4. **Users**:
   - Admin user with ADMIN role
   - Client user with CLIENT role

---

## 🎯 Test Credentials (Configure in Keycloak)

### Admin User

- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`

### Client User

- Username: `client`
- Password: `client123`
- Role: `CLIENT`

---

## ✅ Quick Verification

After starting, you should be able to:

- ✅ Access http://localhost:3000
- ✅ See login page
- ✅ Login with Keycloak
- ✅ See your username and role
- ✅ Navigate to Products page
- ✅ Navigate to Orders page

---

## 🆘 Common Issues

### "Failed to initialize Keycloak"

➡️ Check Keycloak is running on port 8080

### "Failed to fetch products"

➡️ Check API Gateway is running on port 8888

### "401 Unauthorized"

➡️ Check JWT configuration in Gateway

### CORS Errors

➡️ Add `http://localhost:3000` to Gateway CORS config

---

## 📚 Full Documentation

- **README.md** - Complete project documentation
- **CONFIGURATION.md** - Detailed configuration guide
- **TESTING.md** - Comprehensive testing guide
- **IMPLEMENTATION_SUMMARY.md** - What's been implemented

---

## 🎨 Features by Role

### 🔴 ADMIN

- View all products
- Create/Edit/Delete products
- View all orders

### 🔵 CLIENT

- View products
- Create orders
- View own orders

---

## 📞 Need Help?

Check the documentation files for detailed information on:

- Configuration
- Testing procedures
- Troubleshooting
- API endpoints
- Architecture details

---

**Ready to go! 🚀**
