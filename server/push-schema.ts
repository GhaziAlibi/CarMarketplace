import { sql } from 'drizzle-orm';
import { db } from './db';
import { UserRole } from '@shared/schema';
import { hashPassword } from './auth';

const createTables = async () => {
  try {
    console.log('Starting schema creation...');
    
    // Drop tables if they exist (for clean start)
    await db.execute(sql`
      DROP TABLE IF EXISTS favorites;
      DROP TABLE IF EXISTS messages;
      DROP TABLE IF EXISTS cars;
      DROP TABLE IF EXISTS showrooms;
      DROP TABLE IF EXISTS users;
    `);
    
    // Create users table
    console.log('Creating users table...');
    await db.execute(sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create showrooms table
    console.log('Creating showrooms table...');
    await db.execute(sql`
      CREATE TABLE showrooms (
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
    `);
    
    // Create cars table
    console.log('Creating cars table...');
    await db.execute(sql`
      CREATE TABLE cars (
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        category TEXT
      );
    `);
    
    // Create messages table
    console.log('Creating messages table...');
    await db.execute(sql`
      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        car_id INTEGER,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create favorites table
    console.log('Creating favorites table...');
    await db.execute(sql`
      CREATE TABLE favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        car_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, car_id)
      );
    `);
    
    // Seed users
    console.log('Seeding users...');
    const adminPassword = await hashPassword('admin123');
    const sellerPassword = await hashPassword('seller123');
    const buyerPassword = await hashPassword('buyer123');
    
    await db.execute(sql`
      INSERT INTO users (username, email, password, role, created_at)
      VALUES 
        ('admin', 'admin@automart.com', ${adminPassword}, ${UserRole.ADMIN}, NOW()),
        ('seller', 'seller@automart.com', ${sellerPassword}, ${UserRole.SELLER}, NOW()),
        ('buyer', 'buyer@automart.com', ${buyerPassword}, ${UserRole.BUYER}, NOW())
    `);
    
    // Get user IDs
    const usersResult = await db.execute(sql`
      SELECT id, username FROM users
    `);
    
    const users = usersResult.rows;
    const adminId = users.find((user: any) => user.username === 'admin')?.id;
    const sellerId = users.find((user: any) => user.username === 'seller')?.id;
    
    // Seed showrooms
    console.log('Seeding showrooms...');
    await db.execute(sql`
      INSERT INTO showrooms (
        user_id, name, description, logo, city, country, address, 
        rating, review_count, header_image, email, phone, created_at
      )
      VALUES 
        (
          ${adminId}, 
          'Premium Motors', 
          'We offer the finest selection of luxury vehicles in the region. With over 20 years of experience, our expert team is dedicated to helping you find your dream car.', 
          'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&w=400&fit=max', 
          'New York', 
          'USA', 
          '123 Luxury Lane, New York, NY 10001', 
          4.8, 
          245, 
          'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&w=1200&fit=max',
          'info@premiummotors.com',
          '+1 (212) 555-1234',
          NOW()
        ),
        (
          ${sellerId}, 
          'John Seller''s Showroom', 
          'Quality used vehicles at affordable prices. We focus on customer satisfaction and long-term relationships.', 
          'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&w=400&fit=max', 
          'Boston', 
          'USA', 
          '456 Sales Street, Boston, MA 02108', 
          4.3, 
          78, 
          'https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-4.0.3&w=1200&fit=max',
          'john@sellersshowroom.com',
          '+1 (617) 555-9876',
          NOW()
        )
    `);
    
    // Get showroom IDs
    const showroomsResult = await db.execute(sql`
      SELECT id, name FROM showrooms
    `);
    
    const showrooms = showroomsResult.rows;
    const premiumMotorsId = showrooms.find((showroom: any) => showroom.name === 'Premium Motors')?.id;
    
    // Seed cars
    console.log('Seeding cars...');
    await db.execute(sql`
      INSERT INTO cars (
        showroom_id, title, make, model, year, price, mileage, color, 
        vin, fuel_type, transmission, description, features, condition, 
        images, is_featured, is_sold, created_at
      )
      VALUES 
        (
          ${premiumMotorsId},
          '2023 BMW X5 M-Sport Package',
          'BMW',
          'X5',
          2023,
          82999,
          5621,
          'Alpine White',
          'WBA12345678901234',
          'Gasoline',
          'Automatic',
          'This stunning X5 comes with the M-Sport package, panoramic sunroof, and premium sound system. It has been meticulously maintained and is in excellent condition.',
          'Navigation, leather seats, heated/cooled seats, adaptive cruise control, lane keep assist, blind spot monitoring',
          'Excellent',
          ARRAY['https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&w=800&fit=max', 'https://images.unsplash.com/photo-1549399542-7e8f2e928464?ixlib=rb-4.0.3&w=800&fit=max'],
          TRUE,
          FALSE,
          NOW()
        ),
        (
          ${premiumMotorsId},
          '2022 Mercedes-Benz S-Class S580',
          'Mercedes-Benz',
          'S-Class',
          2022,
          129500,
          12045,
          'Obsidian Black',
          'WDDUG8DB5HA123456',
          'Gasoline',
          'Automatic',
          'The pinnacle of luxury, this S-Class represents the best of automotive engineering. Features the latest MBUX infotainment system and level 3 autonomous driving capabilities.',
          'Burmester 4D surround sound, augmented reality navigation, executive rear seat package, massage seats',
          'Excellent',
          ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&w=800&fit=max', 'https://images.unsplash.com/photo-1618843479428-f40aa50cfc2f?ixlib=rb-4.0.3&w=800&fit=max'],
          TRUE,
          FALSE,
          NOW()
        ),
        (
          ${premiumMotorsId},
          '2021 Porsche 911 Carrera 4S',
          'Porsche',
          '911',
          2021,
          145000,
          8725,
          'GT Silver Metallic',
          'WP0AB2A99BS123456',
          'Gasoline',
          'PDK',
          'Experience the thrill of the legendary 911 with all-wheel drive. This 4S model has the Sport Chrono package and sport exhaust for an exhilarating driving experience.',
          'Sport Chrono Package, sport exhaust, sport seats plus, carbon fiber interior, Bose sound system',
          'Excellent',
          ARRAY['https://images.unsplash.com/photo-1584060622420-0a9a054de455?ixlib=rb-4.0.3&w=800&fit=max', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&w=800&fit=max'],
          TRUE,
          FALSE,
          NOW()
        )
    `);
    
    console.log('Database successfully created and seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating database schema:', error);
    process.exit(1);
  }
};

createTables();