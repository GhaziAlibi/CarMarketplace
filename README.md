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

## Getting Started

### Prerequisites

- Node.js 20 or higher
- A PostgreSQL database (or use a serverless database like Neon)

### Setup

1. Clone the repository
2. Create a `.env` file from the example:
   ```
   cp .env.example .env
   ```
3. Edit the `.env` file with your configuration, especially the `DATABASE_URL`
4. Install dependencies:
   ```
   npm install
   ```
5. Push the database schema:
   ```
   npm run db:push
   ```
6. Seed the database (optional):
   ```
   npm run db:seed
   ```
7. Start the development server:
   ```
   npm run dev
   ```
8. Access the application at http://localhost:5000

### Debugging with VSCode

For debugging the Node.js server:

1. Create a `.vscode/launch.json` file with the following configuration:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "name": "Debug Node.js",
         "type": "node",
         "request": "launch",
         "skipFiles": ["<node_internals>/**"],
         "program": "${workspaceFolder}/server/index.ts",
         "runtimeArgs": [
           "--experimental-specifier-resolution=node",
           "--import",
           "./pathfix.js",
           "--import",
           "tsx"
         ],
         "env": {
           "NODE_ENV": "development"
         },
         "outFiles": ["${workspaceFolder}/**/*.js"]
       }
     ]
   }
   ```

2. Start the application in debug mode:
   - In VSCode, go to the "Run and Debug" panel (Ctrl+Shift+D)
   - Select "Debug Node.js" from the dropdown menu
   - Click the green play button or press F5 to start debugging

3. Set breakpoints in your code and VSCode will pause execution at those points

4. Use the debug toolbar to step through code, inspect variables, and more

### Environment Variables

These can be set in your `.env` file:

- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `NODE_ENV`: Node.js environment (production, development)
- `HOST`: Host to bind the server to (default: 0.0.0.0)
- `PORT`: Port to run the server on (default: 5000)
- `STRIPE_SECRET_KEY`: Stripe secret key (if using payment features)
- `VITE_STRIPE_PUBLIC_KEY`: Stripe public key for client-side



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