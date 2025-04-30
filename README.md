# AutoMart - Car Marketplace

A comprehensive multi-vendor car marketplace platform connecting buyers with sellers through an innovative, secure online environment with advanced payment and subscription management.

## Features

- Multi-vendor marketplace with seller showrooms
- Role-based authentication (Admin, Seller, Buyer)
- VIP and Premium subscription tiers
- Secure payment processing with Stripe
- Advanced car search and filtering
- Responsive design for all devices
- Multi-language support with RTL compatibility

## Technologies

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with sessions
- **Payments**: Stripe integration
- **i18n**: i18next for internationalization

## Running with Docker

The application can be run using Docker Compose for a complete environment including the PostgreSQL database.

### Prerequisites

- Docker and Docker Compose installed on your system

### Production Setup

1. Clone the repository
2. Create a `.env` file from the example:
   ```
   cp .env.example .env
   ```
3. Edit the `.env` file with your configuration
4. Update the build script in package.json to include seeding:
   ```json
   "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && esbuild server/seed.ts --platform=node --packages=external --bundle --format=esm --outdir=dist"
   ```
5. Build and start the containers:
   ```
   docker-compose build
   docker-compose up -d
   ```
6. Access the application at http://localhost:5000
7. View logs with:
   ```
   docker-compose logs -f
   ```

### Development Setup with Hot Reloading

For local development with hot reloading:

1. Build and start the development containers:
   ```
   docker-compose -f docker-compose.dev.yml up
   ```
   
2. Any changes you make to the source code will be automatically detected and the application will reload.

3. To rebuild the development containers (after package.json changes):
   ```
   docker-compose -f docker-compose.dev.yml build
   ```

4. To stop the development environment:
   ```
   docker-compose -f docker-compose.dev.yml down
   ```

### Docker Commands

- Build the containers: `docker-compose build`
- Start the application: `docker-compose up -d`
- Stop the application: `docker-compose down`
- View logs: `docker-compose logs -f`
- Access PostgreSQL: `docker-compose exec postgres psql -U postgres -d automart`
- Run database migrations: `docker-compose exec app npm run db:push`
- Run database seeding: `docker-compose exec app npm run seed`

### Environment Variables

These can be set in your `.env` file:

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `NODE_ENV`: Node.js environment (production, development)
- `HOST`: Host to bind the server to (default: 0.0.0.0)
- `PORT`: Port to run the server on (default: 5000)
- `STRIPE_SECRET_KEY`: Stripe secret key (if using payment features)
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key for client-side

## Development Setup

To run the application without Docker for development:

1. Install dependencies:
   ```
   npm install
   ```
2. Set up environment variables (see `.env.example`)
3. Start the development server:
   ```
   npm run dev
   ```

## Database Schema

The application uses Drizzle ORM with the following main entities:

- Users (Admin, Seller, Buyer roles)
- Showrooms (Car dealerships owned by sellers)
- Cars (Vehicles listed by showrooms)
- Subscriptions (Free, Premium, VIP tiers)
- Messages (Communication between users)
- Favorites (Saved cars for buyers)

## License

MIT