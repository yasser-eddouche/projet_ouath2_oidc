# Documentation Technique : Projet Microservices OAuth2 & OIDC

Ce document fournit une description technique détaillée du projet, de son architecture, de ses microservices, et de la mise en œuvre de la sécurité avec Keycloak.

## 1. Vue d'ensemble et Architecture

Ce projet est une application basée sur une architecture **Microservices**, utilisant l'écosystème **Spring Boot** et **Spring Cloud**. La sécurité est gérée via **OAuth2** et **OpenID Connect (OIDC)** avec **Keycloak** comme fournisseur d'identité (Identity Provider).

### Architecture Globale
Le système est composé des éléments suivants :
1.  **Config Service** : Centralise la configuration de tous les microservices.
2.  **Discovery Service** : Annuaire des services (Eureka) pour l'enregistrement et la découverte dynamique.
3.  **Gateway Service** : Point d'entrée unique (API Gateway), gère le routage et agit comme un serveur de ressources OAuth2.
4.  **Product Service** : Microservice métier pour la gestion des produits.
5.  **Order Service** : Microservice métier pour la gestion des commandes.
6.  **Frontend** : Application web (Next.js) pour l'interface utilisateur.
7.  **Keycloak** : Serveur d'authentification et de gestion des identités.

---

## 2. Description Détaillée des Microservices

### 2.1. Config Service (`config-service`)
**Rôle :** Serveur de configuration centralisé. Il permet d'externaliser la configuration (fichiers `.properties` ou `.yml`) des microservices.
**Port :** 9999
**Modules Spring Boot :**
-   `spring-cloud-config-server` : Active les fonctionnalités de serveur de configuration.
-   `spring-cloud-starter-netflix-eureka-client` : Permet au service de s'enregistrer dans l'annuaire Eureka.
-   `spring-boot-starter-actuator` : Fournit des endpoints de monitoring (santé, métriques).

**Annotations Clés :**
-   `@EnableConfigServer` : Active le serveur de configuration.

**Fonctionnement :**
Au démarrage, les autres microservices contactent ce service pour récupérer leur configuration. Dans ce projet, la configuration est stockée localement (profil `native`) dans le dossier `config-repo`.

### 2.2. Discovery Service (`discovery-service`)
**Rôle :** Serveur d'enregistrement (Service Registry). Il permet aux microservices de se connaître sans connaître leurs adresses IP/Ports à l'avance.
**Port :** 8761
**Modules Spring Boot :**
-   `spring-cloud-starter-netflix-eureka-server` : Active le serveur Eureka.

**Annotations Clés :**
-   `@EnableEurekaServer` : Active le registre de services Eureka.

**Fonctionnement :**
Chaque microservice s'enregistre auprès du Discovery Service au démarrage (via `@EnableDiscoveryClient` ou la dépendance `eureka-client`). La Gateway utilise ce registre pour router les requêtes.

### 2.3. Gateway Service (`gateway-service`)
**Rôle :** API Gateway. Point d'entrée unique pour le frontend. Il route les requêtes vers les bons microservices (`product-service`, `order-service`).
**Port :** 8888
**Modules Spring Boot :**
-   `spring-cloud-starter-gateway-server-webflux` : Implémentation de la Gateway (réactive, non-bloquante).
-   `spring-boot-starter-oauth2-resource-server` : Permet de valider les tokens JWT.
-   `spring-boot-starter-security` : Sécurise l'application.

**Configuration de Sécurité (`GatewaySecurityConfig.java`) :**
-   Désactivation du CSRF (car utilisation de tokens JWT stateless).
-   Configuration CORS pour autoriser le frontend (`http://localhost:3000`).
-   `oauth2ResourceServer` : Configure la validation des tokens JWT via Keycloak.

**Routage Dynamique :**
Utilise `DiscoveryClientRouteDefinitionLocator` pour créer automatiquement des routes basées sur les noms des services enregistrés dans Eureka (ex: `/product-service/**` -> `product-service`).

### 2.4. Product Service (`product-service`)
**Rôle :** Gestion des produits (CRUD).
**Port :** 8081
**Modules Spring Boot :**
-   `spring-boot-starter-data-jpa` : Accès aux données (ORM avec Hibernate).
-   `spring-boot-starter-web` : Création d'API REST.
-   `spring-boot-starter-oauth2-resource-server` : Sécurisation via OAuth2.
-   `postgresql` : Driver base de données.

**Structure des Packages :**
-   `entities` : Classes persistantes (`Product`). `@Entity` marque la classe pour JPA. `@Id` et `@GeneratedValue` pour la clé primaire.
-   `repository` : Interfaces étendant `JpaRepository`. Permet les opérations DB sans écrire de SQL.
-   `controller` : Expose les API REST (`ProductController`).
-   `config` : Configuration de sécurité (`SecurityConfig`).

**Sécurité (`SecurityConfig.java`) :**
-   Convertisseur JWT personnalisé pour extraire les rôles de Keycloak (`realm_access` et `resource_access`).
-   Les rôles sont préfixés par `SCOPE_` (ex: `SCOPE_ADMIN`).
-   `@PreAuthorize("hasAuthority('SCOPE_ADMIN')")` : Protège les méthodes (ex: seul un ADMIN peut créer/supprimer un produit).

### 2.5. Order Service (`order-service`)
**Rôle :** Gestion des commandes.
**Port :** 8082
**Modules Spécifiques :**
-   `spring-cloud-starter-openfeign` : Client HTTP déclaratif pour appeler d'autres microservices (ici `product-service`).

**Communication Inter-service :**
-   Utilise `ProductClient` (interface annotée avec `@FeignClient`) pour récupérer les détails d'un produit depuis `product-service` lors de la création d'une commande.

**Sécurité :**
Similaire à `product-service`. Utilise les tokens JWT pour identifier l'utilisateur (`jwt.getSubject()`) et ses rôles.

---

## 3. Frontend (Next.js)

Application React/Next.js située dans le dossier `frontend`.
**Technologies :** Next.js 16, React 19, TailwindCSS, Keycloak-js, Axios.

**Intégration Keycloak :**
-   `lib/keycloak.ts` : Initialise le client Keycloak avec l'URL, le Realm et le Client ID.
-   `contexts/AuthContext.tsx` : Gère l'état global d'authentification (utilisateur connecté, rôles, token).
-   `lib/api.ts` : Client Axios configuré avec un intercepteur qui ajoute automatiquement le header `Authorization: Bearer <token>` à chaque requête vers la Gateway. Gère aussi le rafraîchissement automatique du token (Refresh Token) en cas d'erreur 401.

---

## 4. Sécurité avec Keycloak

**Concept :**
L'authentification est déléguée à Keycloak. Les microservices ne gèrent pas les mots de passe. Ils font confiance aux tokens signés par Keycloak.

**Flux (Flow) :**
1.  L'utilisateur clique sur "Login" dans le Frontend.
2.  Il est redirigé vers la page de login de Keycloak.
3.  Après authentification, Keycloak redirige vers le Frontend avec un **Code**.
4.  Le Frontend échange ce code contre un **Access Token** (JWT) et un **Refresh Token**.
5.  Le Frontend envoie l'Access Token dans le header `Authorization` des requêtes API.
6.  La Gateway et les Microservices valident la signature du JWT grâce à la clé publique de Keycloak (téléchargée au démarrage via l'URL de l'émetteur).

**Configuration Keycloak (Docker) :**
-   Realm : `microservices-realm`
-   Client : `microservices-app`
-   Rôles : `ADMIN`, `CLIENT` (définis dans le Realm ou le Client).

---

## 5. Annotations et Concepts Techniques

### Annotations Spring Boot
-   `@SpringBootApplication` : Point d'entrée de l'application.
-   `@Configuration` : Classe de configuration Spring (définit des Beans).
-   `@Bean` : Méthode qui instancie un objet géré par Spring (IoC Container).
-   `@RestController` : Contrôleur Web (répond en JSON).
-   `@RequestMapping` : Définit l'URL de base du contrôleur.
-   `@GetMapping`, `@PostMapping`, etc. : Mappe les méthodes HTTP.
-   `@PathVariable`, `@RequestBody` : Mappe les arguments de la requête.
-   `@PreAuthorize` : Vérifie les droits avant d'exécuter une méthode.
-   `@Entity`, `@Id` : JPA (Mapping Objet-Relationnel).
-   `@FeignClient` : Déclare un client REST pour appeler un autre service.

### Concepts
-   **Inversion de Contrôle (IoC) / Injection de Dépendances (DI)** : Spring gère la création et les liens entre les objets (`@Autowired` ou constructeur).
-   **Service Discovery** : Les services se trouvent par leur nom, pas par IP.
-   **API Gateway** : Masque la complexité interne et centralise les préoccupations transverses (sécurité, routage).
-   **JWT (JSON Web Token)** : Token contenant les infos utilisateur (claims) et une signature cryptographique.

## 6. Lancement du Projet

1.  **Infrastructure** :
    ```bash
    docker-compose up -d  # Lance Keycloak et Postgres
    ```
2.  **Config & Discovery** :
    -   Lancer `ConfigServiceApplication`
    -   Lancer `DiscoveryServiceApplication`
3.  **Services** :
    -   Lancer `ProductServiceApplication`
    -   Lancer `OrderServiceApplication`
    -   Lancer `GatewayApplication`
4.  **Frontend** :
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
