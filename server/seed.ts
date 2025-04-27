import { db } from './db';
import { hashPassword } from './auth';
import * as schema from '@shared/schema';
import { UserRole } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Create schema - the migrator will create tables if they don't exist
    console.log('Creating schema...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS showrooms (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        logo TEXT,
        city TEXT,
        country TEXT,
        address TEXT,
        rating REAL,
        review_count INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        header_image TEXT,
        email TEXT,
        phone TEXT
      );
      
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        showroom_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        price REAL NOT NULL,
        mileage INTEGER,
        color TEXT,
        vin TEXT,
        fuel_type TEXT,
        transmission TEXT,
        description TEXT,
        features TEXT,
        condition TEXT,
        images TEXT[],
        is_featured BOOLEAN DEFAULT FALSE,
        is_sold BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        car_id INTEGER,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        car_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, car_id)
      );
    `);
    
    // Check if users already exist
    const existingUsers = await db.select().from(schema.users);
    
    if (existingUsers.length === 0) {
      console.log('Seeding users...');
      // Hash passwords
      const adminPassword = await hashPassword('admin123');
      const sellerPassword = await hashPassword('seller123');
      const buyerPassword = await hashPassword('buyer123');
      
      // Insert users
      await db.insert(schema.users).values([
        {
          username: 'admin',
          email: 'admin@automart.com',
          password: adminPassword,
          role: UserRole.ADMIN,
          createdAt: new Date()
        },
        {
          username: 'seller',
          email: 'seller@automart.com',
          password: sellerPassword,
          role: UserRole.SELLER,
          createdAt: new Date()
        },
        {
          username: 'buyer',
          email: 'buyer@automart.com',
          password: buyerPassword,
          role: UserRole.BUYER,
          createdAt: new Date()
        }
      ]);
    } else {
      console.log('Users already exist, skipping user seed.');
    }
    
    // Check if showrooms already exist
    const existingShowrooms = await db.select().from(schema.showrooms);
    
    if (existingShowrooms.length === 0) {
      console.log('Seeding showrooms...');
      
      // Get the admin user for premium motors
      const [adminUser] = await db.select().from(schema.users).where(eq(schema.users.username, 'admin'));
      // Get the seller user for John's Showroom
      const [sellerUser] = await db.select().from(schema.users).where(eq(schema.users.username, 'seller'));
      
      if (adminUser && sellerUser) {
        // Insert showrooms
        await db.insert(schema.showrooms).values([
          {
            userId: adminUser.id,
            name: 'Premium Motors',
            description: 'We offer the finest selection of luxury vehicles in the region. With over 20 years of experience, our expert team is dedicated to helping you find your dream car.',
            logo: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&w=400&fit=max',
            city: 'New York',
            country: 'USA',
            address: '123 Luxury Lane, New York, NY 10001',
            rating: 4.8,
            reviewCount: 245,
            headerImage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&w=1200&fit=max',
            email: 'info@premiummotors.com',
            phone: '+1 (212) 555-1234',
            createdAt: new Date()
          },
          {
            userId: sellerUser.id,
            name: "John Seller's Showroom",
            description: 'Quality used vehicles at affordable prices. We focus on customer satisfaction and long-term relationships.',
            logo: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&w=400&fit=max',
            city: 'Boston',
            country: 'USA',
            address: '456 Sales Street, Boston, MA 02108',
            rating: 4.3,
            reviewCount: 78,
            headerImage: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-4.0.3&w=1200&fit=max',
            email: 'john@sellersshowroom.com',
            phone: '+1 (617) 555-9876',
            createdAt: new Date()
          }
        ]);
      }
    } else {
      console.log('Showrooms already exist, skipping showroom seed.');
    }
    
    // Check if cars already exist
    const existingCars = await db.select().from(schema.cars);
    
    if (existingCars.length === 0) {
      console.log('Seeding cars...');
      
      // Get the showrooms
      const [premiumMotors] = await db.select().from(schema.showrooms).where(eq(schema.showrooms.name, 'Premium Motors'));
      
      if (premiumMotors) {
        // Insert cars for Premium Motors
        await db.insert(schema.cars).values([
          {
            showroomId: premiumMotors.id,
            title: '2023 BMW X5 M-Sport Package',
            make: 'BMW',
            model: 'X5',
            year: 2023,
            price: 82999,
            mileage: 5621,
            color: 'Alpine White',
            vin: 'WBA12345678901234',
            fuelType: 'Gasoline',
            transmission: 'Automatic',
            description: 'This stunning X5 comes with the M-Sport package, panoramic sunroof, and premium sound system. It has been meticulously maintained and is in excellent condition.',
            features: 'Navigation, leather seats, heated/cooled seats, adaptive cruise control, lane keep assist, blind spot monitoring',
            condition: 'Excellent',
            images: [
              'https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&w=800&fit=max',
              'https://images.unsplash.com/photo-1549399542-7e8f2e928464?ixlib=rb-4.0.3&w=800&fit=max'
            ],
            isFeatured: true,
            isSold: false,
            createdAt: new Date()
          },
          {
            showroomId: premiumMotors.id,
            title: '2022 Mercedes-Benz S-Class S580',
            make: 'Mercedes-Benz',
            model: 'S-Class',
            year: 2022,
            price: 129500,
            mileage: 12045,
            color: 'Obsidian Black',
            vin: 'WDDUG8DB5HA123456',
            fuelType: 'Gasoline',
            transmission: 'Automatic',
            description: 'The pinnacle of luxury, this S-Class represents the best of automotive engineering. Features the latest MBUX infotainment system and level 3 autonomous driving capabilities.',
            features: 'Burmester 4D surround sound, augmented reality navigation, executive rear seat package, massage seats',
            condition: 'Excellent',
            images: [
              'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&w=800&fit=max',
              'https://images.unsplash.com/photo-1618843479428-f40aa50cfc2f?ixlib=rb-4.0.3&w=800&fit=max'
            ],
            isFeatured: true,
            isSold: false,
            createdAt: new Date()
          },
          {
            showroomId: premiumMotors.id,
            title: '2021 Porsche 911 Carrera 4S',
            make: 'Porsche',
            model: '911',
            year: 2021,
            price: 145000,
            mileage: 8725,
            color: 'GT Silver Metallic',
            vin: 'WP0AB2A99BS123456',
            fuelType: 'Gasoline',
            transmission: 'PDK',
            description: 'Experience the thrill of the legendary 911 with all-wheel drive. This 4S model has the Sport Chrono package and sport exhaust for an exhilarating driving experience.',
            features: 'Sport Chrono Package, sport exhaust, sport seats plus, carbon fiber interior, Bose sound system',
            condition: 'Excellent',
            images: [
              'https://images.unsplash.com/photo-1584060622420-0a9a054de455?ixlib=rb-4.0.3&w=800&fit=max',
              'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&w=800&fit=max'
            ],
            isFeatured: true,
            isSold: false,
            createdAt: new Date()
          }
        ]);
      }
    } else {
      console.log('Cars already exist, skipping car seed.');
    }
    
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('Seed completed. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });