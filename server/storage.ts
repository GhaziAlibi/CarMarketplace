import { users, type User, type InsertUser, UserRole, cars, type Car, type InsertCar, showrooms, type Showroom, type InsertShowroom, messages, type Message, type InsertMessage, favorites, type Favorite, type InsertFavorite, CarSearchParams } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, or, desc, gte, lte, like, asc } from "drizzle-orm";
import { sql } from "drizzle-orm";

// For SessionStore type
import { Store } from "express-session";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: UserRole): Promise<User[]>;
  
  // Showroom operations
  getShowroom(id: number): Promise<Showroom | undefined>;
  getShowroomByUserId(userId: number): Promise<Showroom | undefined>;
  createShowroom(showroom: InsertShowroom, userId: number): Promise<Showroom>;
  updateShowroom(id: number, showroomData: Partial<Showroom>): Promise<Showroom | undefined>;
  getAllShowrooms(): Promise<Showroom[]>;
  
  // Car operations
  getCar(id: number): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, carData: Partial<Car>): Promise<Car | undefined>;
  deleteCar(id: number): Promise<boolean>;
  getAllCars(): Promise<Car[]>;
  getCarsByShowroom(showroomId: number): Promise<Car[]>;
  getFeaturedCars(limit?: number): Promise<Car[]>;
  searchCars(params: CarSearchParams): Promise<Car[]>;
  getCarCountByShowroomId(showroomId: number): Promise<number>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(id: number, messageData: Partial<Message>): Promise<Message | undefined>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  
  // Favorite operations
  getFavorite(id: number): Promise<Favorite | undefined>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: number): Promise<boolean>;
  getFavoritesByUser(userId: number): Promise<Favorite[]>;
  isFavorite(userId: number, carId: number): Promise<boolean>;
  
  // Subscription operations
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscriptionData: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined>;
  cancelSubscription(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      // Use direct SQL to avoid schema mismatches between code and database
      const result = await db.execute(sql`
        SELECT id, username, password, email, role, created_at 
        FROM users 
        WHERE id = ${id}
      `);
      
      if (result.rows.length === 0) return undefined;
      
      // Map the result to match the expected User type with defaults for missing fields
      const userData = result.rows[0];
      return {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        role: userData.role,
        name: userData.username, // Use username as name since name column doesn't exist
        phone: null,
        avatar: null,
        createdAt: userData.created_at
      } as User;
    } catch (error) {
      console.error('Error in getUser:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      // Use direct SQL to avoid schema mismatches between code and database
      const result = await db.execute(sql`
        SELECT id, username, password, email, role, created_at 
        FROM users 
        WHERE username = ${username}
      `);
      
      if (result.rows.length === 0) return undefined;
      
      // Map the result to match the expected User type with defaults for missing fields
      const userData = result.rows[0];
      return {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        role: userData.role,
        name: userData.username, // Use username as name since name column doesn't exist
        phone: null,
        avatar: null,
        createdAt: userData.created_at
      } as User;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      // Use direct SQL to avoid schema mismatches between code and database
      const result = await db.execute(sql`
        SELECT id, username, password, email, role, created_at 
        FROM users 
        WHERE email = ${email}
      `);
      
      if (result.rows.length === 0) return undefined;
      
      // Map the result to match the expected User type with defaults for missing fields
      const userData = result.rows[0];
      return {
        id: userData.id,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        role: userData.role,
        name: userData.username, // Use username as name since name column doesn't exist
        phone: null,
        avatar: null,
        createdAt: userData.created_at
      } as User;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      // Remove fields that don't exist in the actual database table
      const { name, phone, avatar, ...validUserData } = userData;
      
      // Use direct SQL to ensure only valid fields are inserted
      const result = await db.execute(sql`
        INSERT INTO users (username, password, email, role)
        VALUES (${validUserData.username}, ${validUserData.password}, ${validUserData.email}, ${validUserData.role || 'buyer'})
        RETURNING id, username, password, email, role, created_at
      `);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create user');
      }
      
      // Map the result to match the expected User type with defaults for missing fields
      const createdUser = result.rows[0];
      return {
        id: createdUser.id,
        username: createdUser.username,
        password: createdUser.password,
        email: createdUser.email,
        role: createdUser.role,
        name: createdUser.username, // Use username as name
        phone: null,
        avatar: null,
        createdAt: createdUser.created_at
      } as User;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role));
  }

  // Showroom operations
  async getShowroom(id: number): Promise<Showroom | undefined> {
    const [showroom] = await db
      .select()
      .from(showrooms)
      .where(eq(showrooms.id, id));
    return showroom;
  }

  async getShowroomByUserId(userId: number): Promise<Showroom | undefined> {
    const [showroom] = await db
      .select()
      .from(showrooms)
      .where(eq(showrooms.userId, userId));
    return showroom;
  }

  async createShowroom(showroomData: InsertShowroom, userId: number): Promise<Showroom> {
    const [showroom] = await db
      .insert(showrooms)
      .values({
        ...showroomData,
        userId,
        rating: 0,
        reviewCount: 0
      })
      .returning();
    return showroom;
  }

  async updateShowroom(id: number, showroomData: Partial<Showroom>): Promise<Showroom | undefined> {
    const [showroom] = await db
      .update(showrooms)
      .set(showroomData)
      .where(eq(showrooms.id, id))
      .returning();
    return showroom;
  }

  async getAllShowrooms(): Promise<Showroom[]> {
    return await db.select().from(showrooms);
  }

  // Car operations
  async getCar(id: number): Promise<Car | undefined> {
    try {
      // Get the car ID as a number
      const carId = Number(id);
      
      if (isNaN(carId)) {
        console.error('Invalid car ID:', id);
        return undefined;
      }
      
      // Get direct database connection from pool to execute raw query
      const client = await pool.connect();
      
      try {
        const result = await client.query('SELECT * FROM cars WHERE id = $1', [carId]);
        
        if (result.rows.length === 0) {
          return undefined;
        }
        
        // Map database column names to the camelCase properties expected by the application
        const car = {
          id: result.rows[0].id,
          showroomId: result.rows[0].showroom_id,
          title: result.rows[0].title,
          make: result.rows[0].make,
          model: result.rows[0].model,
          year: result.rows[0].year,
          price: result.rows[0].price,
          mileage: result.rows[0].mileage,
          color: result.rows[0].color,
          vin: result.rows[0].vin,
          transmission: result.rows[0].transmission,
          fuelType: result.rows[0].fuel_type,
          category: result.rows[0].category,
          description: result.rows[0].description,
          features: result.rows[0].features,
          condition: result.rows[0].condition,
          images: result.rows[0].images,
          isFeatured: result.rows[0].is_featured,
          isSold: result.rows[0].is_sold,
          createdAt: result.rows[0].created_at
        };
        
        return car as Car;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error getting car by ID:', error);
      return undefined;
    }
  }

  async createCar(carData: InsertCar): Promise<Car> {
    // Create placeholder images if none provided
    if (!carData.images || !carData.images.length) {
      // Get next ID to use in placeholder images
      const result = await db.select({ maxId: cars.id }).from(cars).orderBy(desc(cars.id)).limit(1);
      const nextId = result.length > 0 ? result[0].maxId + 1 : 1;
      
      carData.images = [
        `https://placehold.co/600x400?text=Car+${nextId}`,
        `https://placehold.co/600x400?text=Interior+${nextId}`
      ];
    }
    
    // Create car with required fields and explicit defaults
    const [car] = await db
      .insert(cars)
      .values({
        ...carData,
        description: carData.description || null,
        isFeatured: false,
        isSold: false,
        color: carData.color || null,
        vin: carData.vin || null,
        condition: carData.condition || null,
        category: carData.category || null
      })
      .returning();
    return car;
  }

  async updateCar(id: number, carData: Partial<Car>): Promise<Car | undefined> {
    const [car] = await db
      .update(cars)
      .set(carData)
      .where(eq(cars.id, id))
      .returning();
    return car;
  }

  async deleteCar(id: number): Promise<boolean> {
    const result = await db
      .delete(cars)
      .where(eq(cars.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllCars(): Promise<Car[]> {
    try {
      // Use direct database connection from pool
      const client = await pool.connect();
      
      try {
        const result = await client.query('SELECT * FROM cars ORDER BY created_at DESC');
        
        // Map database column names to our schema properties
        return result.rows.map(row => ({
          id: row.id,
          showroomId: row.showroom_id,
          title: row.title,
          make: row.make,
          model: row.model,
          year: row.year,
          price: row.price,
          mileage: row.mileage,
          color: row.color,
          vin: row.vin,
          transmission: row.transmission,
          fuelType: row.fuel_type,
          category: row.category,
          description: row.description,
          features: row.features,
          condition: row.condition,
          images: row.images,
          isFeatured: row.is_featured,
          isSold: row.is_sold,
          createdAt: row.created_at
        })) as Car[];
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error getting all cars:', error);
      return [];
    }
  }

  async getCarsByShowroom(showroomId: number): Promise<Car[]> {
    try {
      // Use direct database connection from pool
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          'SELECT * FROM cars WHERE showroom_id = $1 ORDER BY created_at DESC',
          [showroomId]
        );
        
        // Map database column names to our schema properties
        return result.rows.map(row => ({
          id: row.id,
          showroomId: row.showroom_id,
          title: row.title,
          make: row.make,
          model: row.model,
          year: row.year,
          price: row.price,
          mileage: row.mileage,
          color: row.color,
          vin: row.vin,
          transmission: row.transmission,
          fuelType: row.fuel_type,
          category: row.category,
          description: row.description,
          features: row.features,
          condition: row.condition,
          images: row.images,
          isFeatured: row.is_featured,
          isSold: row.is_sold,
          createdAt: row.created_at
        })) as Car[];
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error getting showroom cars:', error);
      return [];
    }
  }

  async getFeaturedCars(limit: number = 6): Promise<Car[]> {
    try {
      // Use direct database connection from pool
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          'SELECT * FROM cars WHERE is_featured = true LIMIT $1',
          [limit]
        );
        
        // Map database column names to our schema properties
        return result.rows.map(row => ({
          id: row.id,
          showroomId: row.showroom_id,
          title: row.title,
          make: row.make,
          model: row.model,
          year: row.year,
          price: row.price,
          mileage: row.mileage,
          color: row.color,
          vin: row.vin,
          transmission: row.transmission,
          fuelType: row.fuel_type,
          category: row.category,
          description: row.description,
          features: row.features,
          condition: row.condition,
          images: row.images,
          isFeatured: row.is_featured,
          isSold: row.is_sold,
          createdAt: row.created_at
        })) as Car[];
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error getting featured cars:', error);
      return [];
    }
  }

  async searchCars(params: CarSearchParams): Promise<Car[]> {
    try {
      let conditions: string[] = [];
      let queryParams: any[] = [];
      let paramCounter = 1;

      if (params.make) {
        conditions.push(`make ILIKE $${paramCounter}`);
        queryParams.push(`%${params.make}%`);
        paramCounter++;
      }

      if (params.model) {
        conditions.push(`model ILIKE $${paramCounter}`);
        queryParams.push(`%${params.model}%`);
        paramCounter++;
      }

      if (params.category) {
        conditions.push(`category = $${paramCounter}`);
        queryParams.push(params.category);
        paramCounter++;
      }

      if (params.year) {
        conditions.push(`year = $${paramCounter}`);
        queryParams.push(params.year);
        paramCounter++;
      }

      if (params.transmission) {
        conditions.push(`transmission = $${paramCounter}`);
        queryParams.push(params.transmission);
        paramCounter++;
      }

      if (params.fuelType) {
        conditions.push(`fuel_type = $${paramCounter}`);
        queryParams.push(params.fuelType);
        paramCounter++;
      }

      if (params.priceRange) {
        const [min, max] = params.priceRange.split('-').map(Number);
        if (min && !max) {
          conditions.push(`price >= $${paramCounter}`);
          queryParams.push(min);
          paramCounter++;
        } else if (!min && max) {
          conditions.push(`price <= $${paramCounter}`);
          queryParams.push(max);
          paramCounter++;
        } else if (min && max) {
          conditions.push(`price >= $${paramCounter} AND price <= $${paramCounter + 1}`);
          queryParams.push(min, max);
          paramCounter += 2;
        }
      }

      // Build the SQL query
      let query = 'SELECT * FROM cars';
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY created_at DESC';

      // Use pool directly for raw query
      const client = await pool.connect();
      let result;
      try {
        result = await client.query(query, queryParams);
      } finally {
        client.release();
      }

      return result.rows as Car[];
    } catch (error) {
      console.error('Error searching cars:', error);
      return [];
    }
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id));
    return message;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    try {
      const [message] = await db
        .insert(messages)
        .values({
          senderId: messageData.senderId,
          receiverId: messageData.receiverId,
          carId: messageData.carId || null,
          content: messageData.content,
          isRead: false
        })
        .returning();
      return message;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async updateMessage(id: number, messageData: Partial<Message>): Promise<Message | undefined> {
    const [message] = await db
      .update(messages)
      .set(messageData)
      .where(eq(messages.id, id))
      .returning();
    return message;
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    try {
      // Use our schema property names (which are properly mapped to DB column names)
      const result = await db
        .select()
        .from(messages)
        .where(
          or(
            eq(messages.senderId, userId),
            eq(messages.receiverId, userId)
          )
        )
        .orderBy(desc(messages.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting messages for user:', error);
      return [];
    }
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    try {
      // Use our schema property names (which are properly mapped to DB column names)
      const result = await db
        .select()
        .from(messages)
        .where(
          or(
            and(
              eq(messages.senderId, user1Id),
              eq(messages.receiverId, user2Id)
            ),
            and(
              eq(messages.senderId, user2Id),
              eq(messages.receiverId, user1Id)
            )
          )
        )
        .orderBy(asc(messages.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return [];
    }
  }

  // Favorite operations
  async getFavorite(id: number): Promise<Favorite | undefined> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(eq(favorites.id, id));
    return favorite;
  }

  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values(favoriteData)
      .returning();
    return favorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    const result = await db
      .delete(favorites)
      .where(eq(favorites.id, id))
      .returning();
    return result.length > 0;
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId));
  }

  async isFavorite(userId: number, carId: number): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.carId, carId)))
      .limit(1);
    return !!favorite;
  }

  // Additional utility methods
  async getCarCountByShowroomId(showroomId: number): Promise<number> {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) FROM cars WHERE showroom_id = ${showroomId}
      `);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error counting cars by showroom:', error);
      return 0;
    }
  }

  // Subscription operations
  async getSubscription(id: number): Promise<Subscription | undefined> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM subscriptions WHERE id = ${id}
      `);
      
      if (result.rows.length === 0) return undefined;
      
      // Map column names to match our schema
      const sub = result.rows[0];
      return {
        id: sub.id,
        userId: sub.user_id,
        tier: sub.tier,
        startDate: sub.start_date,
        endDate: sub.end_date,
        stripeCustomerId: sub.stripe_customer_id,
        stripeSubscriptionId: sub.stripe_subscription_id,
        active: sub.active,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at
      } as Subscription;
    } catch (error) {
      console.error('Error in getSubscription:', error);
      return undefined;
    }
  }
  
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    try {
      const result = await db.execute(sql`
        SELECT * FROM subscriptions 
        WHERE user_id = ${userId} AND active = true
        ORDER BY created_at DESC
        LIMIT 1
      `);
      
      if (result.rows.length === 0) return undefined;
      
      // Map column names to match our schema
      const sub = result.rows[0];
      return {
        id: sub.id,
        userId: sub.user_id,
        tier: sub.tier,
        startDate: sub.start_date,
        endDate: sub.end_date,
        stripeCustomerId: sub.stripe_customer_id,
        stripeSubscriptionId: sub.stripe_subscription_id,
        active: sub.active,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at
      } as Subscription;
    } catch (error) {
      console.error('Error in getSubscriptionByUserId:', error);
      return undefined;
    }
  }
  
  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    try {
      // Set default tier to FREE if not provided
      if (!subscriptionData.tier) {
        subscriptionData.tier = SubscriptionTier.FREE;
      }
      
      const result = await db.execute(sql`
        INSERT INTO subscriptions 
        (user_id, tier, stripe_customer_id, stripe_subscription_id, active)
        VALUES 
        (${subscriptionData.userId}, ${subscriptionData.tier}, 
         ${subscriptionData.stripeCustomerId || null}, 
         ${subscriptionData.stripeSubscriptionId || null}, 
         ${subscriptionData.active !== false})
        RETURNING *
      `);
      
      if (result.rows.length === 0) {
        throw new Error('Failed to create subscription');
      }
      
      // Map column names to match our schema
      const sub = result.rows[0];
      return {
        id: sub.id,
        userId: sub.user_id,
        tier: sub.tier,
        startDate: sub.start_date,
        endDate: sub.end_date,
        stripeCustomerId: sub.stripe_customer_id,
        stripeSubscriptionId: sub.stripe_subscription_id,
        active: sub.active,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at
      } as Subscription;
    } catch (error) {
      console.error('Error in createSubscription:', error);
      throw error;
    }
  }
  
  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    try {
      // Build the SQL SET clause dynamically based on what fields are provided
      const setValues: string[] = [];
      const params: any[] = [];
      let paramCounter = 1;
      
      if (subscriptionData.tier !== undefined) {
        setValues.push(`tier = $${paramCounter++}`);
        params.push(subscriptionData.tier);
      }
      
      if (subscriptionData.endDate !== undefined) {
        setValues.push(`end_date = $${paramCounter++}`);
        params.push(subscriptionData.endDate);
      }
      
      if (subscriptionData.stripeCustomerId !== undefined) {
        setValues.push(`stripe_customer_id = $${paramCounter++}`);
        params.push(subscriptionData.stripeCustomerId);
      }
      
      if (subscriptionData.stripeSubscriptionId !== undefined) {
        setValues.push(`stripe_subscription_id = $${paramCounter++}`);
        params.push(subscriptionData.stripeSubscriptionId);
      }
      
      if (subscriptionData.active !== undefined) {
        setValues.push(`active = $${paramCounter++}`);
        params.push(subscriptionData.active);
      }
      
      // Add updated_at to always update the timestamp
      setValues.push(`updated_at = NOW()`);
      
      if (setValues.length === 0) {
        return await this.getSubscription(id); // Nothing to update, return current
      }
      
      // Add the subscription ID to the params
      params.push(id);
      
      const result = await db.execute(`
        UPDATE subscriptions 
        SET ${setValues.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING *
      `, params);
      
      if (result.rows.length === 0) return undefined;
      
      // Map column names to match our schema
      const sub = result.rows[0];
      return {
        id: sub.id,
        userId: sub.user_id,
        tier: sub.tier,
        startDate: sub.start_date,
        endDate: sub.end_date,
        stripeCustomerId: sub.stripe_customer_id,
        stripeSubscriptionId: sub.stripe_subscription_id,
        active: sub.active,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at
      } as Subscription;
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      return undefined;
    }
  }
  
  async cancelSubscription(id: number): Promise<boolean> {
    try {
      const result = await db.execute(sql`
        UPDATE subscriptions
        SET active = false, end_date = NOW(), updated_at = NOW()
        WHERE id = ${id}
        RETURNING id
      `);
      
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      return false;
    }
  }
}

// For in-memory storage when needed
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private showroomsMap: Map<number, Showroom>;
  private carsMap: Map<number, Car>;
  private messagesMap: Map<number, Message>;
  private favoritesMap: Map<number, Favorite>;
  
  sessionStore: Store;
  currentUserId: number;
  currentShowroomId: number;
  currentCarId: number;
  currentMessageId: number;
  currentFavoriteId: number;

  constructor() {
    this.usersMap = new Map();
    this.showroomsMap = new Map();
    this.carsMap = new Map();
    this.messagesMap = new Map();
    this.favoritesMap = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    this.currentUserId = 1;
    this.currentShowroomId = 1;
    this.currentCarId = 1;
    this.currentMessageId = 1;
    this.currentFavoriteId = 1;

    // Creating admin account
    this.createUser({
      username: "admin",
      password: "admin123", // Will be hashed in routes
      email: "admin@automarket.com",
      role: UserRole.ADMIN,
      name: "Admin User",
      phone: "+123456789",
      avatar: ""
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...userData, id, createdAt: new Date() };
    this.usersMap.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return Array.from(this.usersMap.values()).filter(
      (user) => user.role === role
    );
  }

  // Showroom operations
  async getShowroom(id: number): Promise<Showroom | undefined> {
    return this.showroomsMap.get(id);
  }

  async getShowroomByUserId(userId: number): Promise<Showroom | undefined> {
    return Array.from(this.showroomsMap.values()).find(
      (showroom) => showroom.userId === userId
    );
  }

  async createShowroom(showroomData: InsertShowroom, userId: number): Promise<Showroom> {
    const id = this.currentShowroomId++;
    const showroom: Showroom = { 
      ...showroomData, 
      id, 
      userId,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date() 
    };
    this.showroomsMap.set(id, showroom);
    return showroom;
  }

  async updateShowroom(id: number, showroomData: Partial<Showroom>): Promise<Showroom | undefined> {
    const existingShowroom = await this.getShowroom(id);
    if (!existingShowroom) return undefined;
    
    const updatedShowroom = { ...existingShowroom, ...showroomData };
    this.showroomsMap.set(id, updatedShowroom);
    return updatedShowroom;
  }

  async getAllShowrooms(): Promise<Showroom[]> {
    return Array.from(this.showroomsMap.values());
  }

  // Car operations
  async getCar(id: number): Promise<Car | undefined> {
    return this.carsMap.get(id);
  }

  async createCar(carData: InsertCar): Promise<Car> {
    const id = this.currentCarId++;
    // Create placeholder images if none provided
    if (!carData.images || !carData.images.length) {
      carData.images = [
        `https://placehold.co/600x400?text=Car+${id}`,
        `https://placehold.co/600x400?text=Interior+${id}`
      ];
    }
    
    const car: Car = { 
      ...carData, 
      id, 
      isFeatured: false,
      createdAt: new Date() 
    };
    this.carsMap.set(id, car);
    return car;
  }

  async updateCar(id: number, carData: Partial<Car>): Promise<Car | undefined> {
    const existingCar = await this.getCar(id);
    if (!existingCar) return undefined;
    
    const updatedCar = { ...existingCar, ...carData };
    this.carsMap.set(id, updatedCar);
    return updatedCar;
  }

  async deleteCar(id: number): Promise<boolean> {
    return this.carsMap.delete(id);
  }

  async getAllCars(): Promise<Car[]> {
    return Array.from(this.carsMap.values());
  }

  async getCarsByShowroom(showroomId: number): Promise<Car[]> {
    return Array.from(this.carsMap.values()).filter(
      (car) => car.showroomId === showroomId
    );
  }

  async getFeaturedCars(limit: number = 6): Promise<Car[]> {
    return Array.from(this.carsMap.values())
      .filter(car => car.isFeatured)
      .slice(0, limit);
  }

  async searchCars(params: CarSearchParams): Promise<Car[]> {
    let results = Array.from(this.carsMap.values());
    
    if (params.make) {
      results = results.filter(car => car.make.toLowerCase().includes(params.make!.toLowerCase()));
    }
    
    if (params.model) {
      results = results.filter(car => car.model.toLowerCase().includes(params.model!.toLowerCase()));
    }
    
    if (params.category) {
      results = results.filter(car => car.category.toLowerCase() === params.category!.toLowerCase());
    }
    
    if (params.year) {
      results = results.filter(car => car.year === params.year);
    }
    
    if (params.transmission) {
      results = results.filter(car => car.transmission.toLowerCase() === params.transmission!.toLowerCase());
    }
    
    if (params.fuelType) {
      results = results.filter(car => car.fuelType.toLowerCase() === params.fuelType!.toLowerCase());
    }
    
    if (params.priceRange) {
      const [min, max] = params.priceRange.split('-').map(Number);
      if (min && !max) {
        results = results.filter(car => car.price >= min);
      } else if (!min && max) {
        results = results.filter(car => car.price <= max);
      } else if (min && max) {
        results = results.filter(car => car.price >= min && car.price <= max);
      }
    }
    
    return results;
  }

  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messagesMap.get(id);
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...messageData, 
      id, 
      isRead: false,
      createdAt: new Date() 
    };
    this.messagesMap.set(id, message);
    return message;
  }

  async updateMessage(id: number, messageData: Partial<Message>): Promise<Message | undefined> {
    const existingMessage = await this.getMessage(id);
    if (!existingMessage) return undefined;
    
    const updatedMessage = { ...existingMessage, ...messageData };
    this.messagesMap.set(id, updatedMessage);
    return updatedMessage;
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messagesMap.values()).filter(
      (message) => message.senderId === userId || message.receiverId === userId
    );
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messagesMap.values())
      .filter(
        (message) => 
          (message.senderId === user1Id && message.receiverId === user2Id) ||
          (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Favorite operations
  async getFavorite(id: number): Promise<Favorite | undefined> {
    return this.favoritesMap.get(id);
  }

  async createFavorite(favoriteData: InsertFavorite): Promise<Favorite> {
    const id = this.currentFavoriteId++;
    const favorite: Favorite = { 
      ...favoriteData, 
      id, 
      createdAt: new Date() 
    };
    this.favoritesMap.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(id: number): Promise<boolean> {
    return this.favoritesMap.delete(id);
  }

  async getFavoritesByUser(userId: number): Promise<Favorite[]> {
    return Array.from(this.favoritesMap.values()).filter(
      (favorite) => favorite.userId === userId
    );
  }

  async isFavorite(userId: number, carId: number): Promise<boolean> {
    return Array.from(this.favoritesMap.values()).some(
      (favorite) => favorite.userId === userId && favorite.carId === carId
    );
  }

  // Additional utility methods
  async getCarCountByShowroomId(showroomId: number): Promise<number> {
    return Array.from(this.carsMap.values()).filter(
      (car) => car.showroomId === showroomId
    ).length;
  }
  
  // Subscription operations - for memory storage, just simulating a subscription system
  private subscriptionsMap: Map<number, Subscription> = new Map();
  private currentSubscriptionId: number = 1;
  
  async getSubscription(id: number): Promise<Subscription | undefined> {
    return this.subscriptionsMap.get(id);
  }
  
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptionsMap.values()).find(
      (sub) => sub.userId === userId && sub.active
    );
  }
  
  async createSubscription(subscriptionData: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const subscription: Subscription = {
      ...subscriptionData,
      id,
      tier: subscriptionData.tier || SubscriptionTier.FREE,
      startDate: new Date(),
      endDate: null,
      active: subscriptionData.active !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.subscriptionsMap.set(id, subscription);
    return subscription;
  }
  
  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    const existingSubscription = await this.getSubscription(id);
    if (!existingSubscription) return undefined;
    
    const updatedSubscription = { 
      ...existingSubscription, 
      ...subscriptionData,
      updatedAt: new Date()
    };
    this.subscriptionsMap.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  async cancelSubscription(id: number): Promise<boolean> {
    const existingSubscription = await this.getSubscription(id);
    if (!existingSubscription) return false;
    
    existingSubscription.active = false;
    existingSubscription.endDate = new Date();
    existingSubscription.updatedAt = new Date();
    this.subscriptionsMap.set(id, existingSubscription);
    return true;
  }
}

// Switch from in-memory storage to database storage
export const storage = new DatabaseStorage();
