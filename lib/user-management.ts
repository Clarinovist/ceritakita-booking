import { getDb } from './db';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
  is_active: number;
  created_at: string;
  updated_at: string;
  password_hash?: string; // Optional for internal use
}

export interface CreateUserInput {
  username: string;
  password: string;
  role?: 'admin' | 'staff';
}

export interface UpdateUserInput {
  username?: string;
  password?: string;
  is_active?: number;
}

/**
 * Get all users (excluding sensitive data)
 */
export function getAllUsers(): User[] {
  const db = getDb();
  return db.prepare(`
    SELECT id, username, role, is_active, created_at, updated_at 
    FROM users 
    ORDER BY created_at DESC
  `).all() as User[];
}

/**
 * Get user by ID
 */
export function getUserById(id: string): User | null {
  const db = getDb();
  return db.prepare(`
    SELECT id, username, role, is_active, created_at, updated_at 
    FROM users 
    WHERE id = ?
  `).get(id) as User | null;
}

/**
 * Get user by username
 */
export function getUserByUsername(username: string): User | null {
  const db = getDb();
  return db.prepare(`
    SELECT id, username, password_hash, role, is_active, created_at, updated_at 
    FROM users 
    WHERE username = ?
  `).get(username) as any;
}

/**
 * Create a new user
 */
export function createUser(input: CreateUserInput): User {
  const db = getDb();
  
  // Check if username already exists
  const existing = getUserByUsername(input.username);
  if (existing) {
    throw new Error('Username already exists');
  }

  // Hash password
  const saltRounds = 12;
  const passwordHash = bcrypt.hashSync(input.password, saltRounds);
  
  const id = randomUUID();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO users (id, username, password_hash, role, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    input.username,
    passwordHash,
    input.role || 'staff',
    1,
    now,
    now
  );

  return getUserById(id)!;
}

/**
 * Update user
 */
export function updateUser(id: string, input: UpdateUserInput): User {
  const db = getDb();
  
  const existing = getUserById(id);
  if (!existing) {
    throw new Error('User not found');
  }

  // Check username uniqueness if changing
  if (input.username && input.username !== existing.username) {
    const duplicate = getUserByUsername(input.username);
    if (duplicate) {
      throw new Error('Username already exists');
    }
  }

  const updates: string[] = [];
  const values: any[] = [];
  
  if (input.username) {
    updates.push('username = ?');
    values.push(input.username);
  }
  
  if (input.password) {
    const passwordHash = bcrypt.hashSync(input.password, 12);
    updates.push('password_hash = ?');
    values.push(passwordHash);
  }
  
  if (input.is_active !== undefined) {
    updates.push('is_active = ?');
    values.push(input.is_active);
  }
  
  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(id);

  if (updates.length === 1) {
    // Only updated_at changed, nothing to update
    return existing;
  }

  db.prepare(`
    UPDATE users 
    SET ${updates.join(', ')} 
    WHERE id = ?
  `).run(...values);

  return getUserById(id)!;
}

/**
 * Delete user
 */
export function deleteUser(id: string): void {
  const db = getDb();
  
  const existing = getUserById(id);
  if (!existing) {
    throw new Error('User not found');
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

/**
 * Verify user credentials
 */
export function verifyUserCredentials(username: string, password: string): User | null {
  const user = getUserByUsername(username);
  if (!user || !user.password_hash) {
    return null;
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  // Return user without password hash
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

/**
 * Seed default admin user if none exists
 */
export function seedDefaultAdmin(): void {
  const db = getDb();
  
  const existing = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (existing.count === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    createUser({
      username,
      password,
      role: 'admin'
    });
    
    console.log('✅ Default admin user created:', username);
  }
}
