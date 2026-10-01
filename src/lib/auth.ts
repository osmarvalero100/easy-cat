import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getPool, initDatabase } from './db';
import mysql from 'mysql2/promise';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface UserRecord extends AuthUser {
  password_hash: string;
}

/**
 * Hashes a plain-text password using scrypt with a unique random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Securely verifies a password against a salt:hash string
 */
export function verifyPassword(password: string, combined: string): boolean {
  try {
    const [salt, key] = combined.split(':');
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const keyBuf = Buffer.from(key, 'hex');
    const hashBuf = Buffer.from(hash, 'hex');
    if (keyBuf.length !== hashBuf.length) return false;
    return crypto.timingSafeEqual(keyBuf, hashBuf);
  } catch {
    return false;
  }
}

/**
 * Finds user by email
 */
export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  await initDatabase();
  const pool = getPool();
  const normalizedEmail = email.trim().toLowerCase();

  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT id, email, name, password_hash FROM users WHERE email = ? LIMIT 1',
    [normalizedEmail]
  );

  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: Number(r.id),
    email: r.email,
    name: r.name || '',
    password_hash: r.password_hash,
  };
}

/**
 * Creates a new user in the database
 */
export async function createUser(email: string, password: string, name?: string): Promise<AuthUser> {
  await initDatabase();
  const pool = getPool();
  const normalizedEmail = email.trim().toLowerCase();
  const pwdHash = hashPassword(password);

  const [result] = await pool.query<mysql.ResultSetHeader>(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
    [normalizedEmail, pwdHash, name?.trim() || '']
  );

  return {
    id: result.insertId,
    email: normalizedEmail,
    name: name?.trim() || '',
  };
}

/**
 * Creates a new session token in the database (expires in 30 days)
 */
export async function createSession(userId: number): Promise<string> {
  await initDatabase();
  const pool = getPool();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await pool.query(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    [token, userId, expiresAt]
  );

  return token;
}

/**
 * Retrieves the user associated with a session token if it is valid and unexpired
 */
export async function getSessionUser(token: string): Promise<AuthUser | null> {
  if (!token) return null;
  await initDatabase();
  const pool = getPool();

  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `
    SELECT u.id, u.email, u.name
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > NOW()
    LIMIT 1
    `,
    [token]
  );

  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    id: Number(r.id),
    email: r.email,
    name: r.name || '',
  };
}

/**
 * Deletes a session token on logout
 */
export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  await initDatabase();
  const pool = getPool();
  await pool.query('DELETE FROM sessions WHERE id = ?', [token]);
}

/**
 * Helper to obtain the authenticated user in Server Components, API Route Handlers, or Server Actions
 */
export async function getAuthenticatedUser(request?: Request): Promise<AuthUser | null> {
  let token: string | undefined;

  // 1. From Authorization Header or Cookie header in request
  if (request) {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/auth_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  // 2. Fallback to Next.js cookies()
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get('auth_token')?.value;
    } catch {
      // cookies() might not be available in certain contexts
    }
  }

  if (!token) return null;

  return await getSessionUser(token);
}
