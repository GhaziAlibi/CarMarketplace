import { users, type User, type InsertUser, UserRole, cars, type Car, type InsertCar, showrooms, type Showroom, type InsertShowroom, messages, type Message, type InsertMessage, favorites, type Favorite, type InsertFavorite, CarSearchParams } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, or, desc, gte, lte, like, asc, sql } from "drizzle-orm";

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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
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
    const [car] = await db
      .select()
      .from(cars)
      .where(eq(cars.id, id));
    return car;
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
        status: carData.status || "available",
        description: carData.description || null,
        isFeatured: false
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
    return await db.select().from(cars);
  }

  async getCarsByShowroom(showroomId: number): Promise<Car[]> {
    return await db
      .select()
      .from(cars)
      .where(eq(cars.showroomId, showroomId));
  }

  async getFeaturedCars(limit: number = 6): Promise<Car[]> {
    try {
      // Use direct SQL since there's a schema mismatch between camelCase in code and snake_case in DB
      const result = await db.execute(sql`
        SELECT * FROM cars 
        WHERE is_featured = true 
        LIMIT ${limit}
      `);
      
      return result.rows as Car[];
    } catch (error) {
      console.error('Error getting featured cars:', error);
      return [];
    }
  }

  async searchCars(params: CarSearchParams): Promise<Car[]> {
    // Start with a base query
    let baseQuery = db.select().from(cars);
    let conditions = [];
    
    if (params.make) {
      conditions.push(like(cars.make, `%${params.make}%`));
    }
    
    if (params.model) {
      conditions.push(like(cars.model, `%${params.model}%`));
    }
    
    if (params.category) {
      conditions.push(eq(cars.category, params.category));
    }
    
    if (params.year) {
      conditions.push(eq(cars.year, params.year));
    }
    
    if (params.transmission) {
      conditions.push(eq(cars.transmission, params.transmission));
    }
    
    if (params.fuelType) {
      conditions.push(eq(cars.fuelType, params.fuelType));
    }
    
    if (params.priceRange) {
      const [min, max] = params.priceRange.split('-').map(Number);
      if (min && !max) {
        conditions.push(gte(cars.price, min));
      } else if (!min && max) {
        conditions.push(lte(cars.price, max));
      } else if (min && max) {
        conditions.push(and(gte(cars.price, min), lte(cars.price, max)));
      }
    }
    
    // Apply all conditions if there are any
    if (conditions.length > 0) {
      return await baseQuery.where(and(...conditions));
    }
    
    return await baseQuery;
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
    const [message] = await db
      .insert(messages)
      .values({
        ...messageData,
        isRead: false
      })
      .returning();
    return message;
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
    return await db
      .select()
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
          and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
        )
      )
      .orderBy(asc(messages.createdAt));
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
}

// Switch from in-memory storage to database storage
export const storage = new DatabaseStorage();
