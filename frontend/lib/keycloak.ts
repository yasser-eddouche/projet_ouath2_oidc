import Keycloak from "keycloak-js";

const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8090",
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "microservices-realm",
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "microservices-app",
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
