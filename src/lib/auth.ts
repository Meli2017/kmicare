import bcrypt from 'bcryptjs';
import { db } from './db';

const SALT_ROUNDS = 10;

// Initialize default admin if not exists
export async function initializeAdmin() {
  const existingAdmin = await db.admin.findFirst();
  
  if (!existingAdmin) {
    const passwordHash = await hashPassword('kmihomecarcarepassword');
    await db.admin.create({
      data: {
        username: 'kmihomecarcareusername',
        passwordHash,
      },
    });
    console.log('Default admin created');
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  const admin = await db.admin.findUnique({
    where: { username },
  });
  
  if (!admin) {
    return false;
  }
  
  return verifyPassword(password, admin.passwordHash);
}
