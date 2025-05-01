# NestJS Application

A robust, modular, and scalable NestJS application with JWT-based authentication, automatic API docs, and helpful development scripts.

---

## Table of Contents

- [Prerequisites](#prerequisites)  
- [JWT Authentication Setup](#jwt-authentication-setup)  
- [Environment Configuration](#environment-configuration)  
- [Running the Application](#running-the-application)  
- [API Documentation](#api-documentation)  
- [Available NPM Scripts](#available-npm-scripts)  
- [License](#license)  

---

## Prerequisites

- **Node.js** ≥ 14.x  
- **npm** ≥ 6.x  
- **Nest CLI** ≥ 8.x  
- **OpenSSL** (for RSA key generation)  

---

## JWT Authentication Setup

Before running the application, generate your RSA key pair for signing and verifying JWT tokens:

```bash
# Generate a 2048-bit RSA private key
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048

# Extract the RSA public key
openssl rsa -in private.pem -pubout -out public.pem
```

---

## Environment Configuration

you can see full example at .env.example

PORT= This is the port that app will run on recommended to be 8000 changes it requires changes at the docker compose

Database configs
DBCONNECTIONSTRING= The Database must be mariadb/mysql connection string
REDISURL= The Redis connection string

JWT configs
JWTEXPIREDURATION= JWT expiration duration as number determined hours or second by the JWTEXPIREDURATIONTYPE env
JWTEXPIREDURATIONTYPE= h for Hours, s for seconds
ALGORITHM=aes-256-cbc
ENCRYPT_SECRET_KEY=SECRETKEY
ENCRYPT_IV=IV

Email config
EMAILHOST= The email host name
EMAILPORT= Email host port 
EMAILUSER= Email user itself that will send the email 
EMAILPASS= Email user password

Verify and reset pass configs config
CODETTLINMINUTES= Code Time to live on redis
NEXTTRYINSECONDS= Nex retry in seconds 

External Urls  
FRONTEND_DOMAIN= Frontend domain name
FRONTEND_PORT= Frontend Port ( so if it runs on whatever it will work)
FRONTEND_PROTOCOL= Frontend Protocol ( so if it runs on dev environment or no ssl it will work)
FRONTEND_VERIFY_RELATIVE_URL=signUp/verifyEmail # DON'T change
AIBASEURL=http://abdullahabaza.me/api # DON'T change

---

## Running the Application
You can run the app with docker or without 

1- With Docker:
Attach to the image the public and private key
    - ./private.pem:/app/private.pem
    - ./public.pem:/app/public.pem
and run it 
the image name : bridgex/backend:latest

2- without:
Just clone the app from https://github.com/dev-bridgex/backend.git
Then install dependencies and run the JWT Authentication Setup

## API Documentation
This application exposes two sets of documentation:

API Docs (Swagger UI):
Accessible at:
  http://localhost:<PORT>/docs

System/Internal Docs:
Accessible at:  
  http://localhost:<PORT>/app/docs

or at bridgex account postman a full collections for each module

## Available NPM Scripts

Migration:
migrations will be found at src\Infrastructure\Database\Migrations
To generate migration: npm run migration:generate
To run migration: npm run migration:run
To revert migration: npm run migration:revert
Note: in production instead of npm run migration:run RUN npm run migration:runprod instead

Other:
npm run copylogo : this command to copy the default logo to the dist 
it runs auto with npm run build and others ( if changes happened need to restart app )

npm run copytemps : this command to copy the email temps to the dist 
it runs auto with npm run build and others ( if changes happened need to restart app )