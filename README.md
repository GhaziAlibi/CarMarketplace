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

### Setup

1. Clone the repository
2. Create a `.env` file from the example:
   ```
   cp .env.example .env
   ```
3. Edit the `.env` file with your configuration
4. Build and start the containers:
   ```
   docker-compose up -d
   ```
5. Access the application at http://localhost:5000

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