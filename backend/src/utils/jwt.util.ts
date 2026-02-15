import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// Parse duration string to seconds
function parseExpiry(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // default 15 minutes

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 900;
  }
}

export const jwtUtil = {
  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, {
      expiresIn: parseExpiry(JWT_ACCESS_EXPIRY),
    });
  },

  generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
  },

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  },

  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  },

  getRefreshTokenExpiry(): Date {
    const days = parseInt(JWT_REFRESH_EXPIRY.replace('d', ''), 10) || 7;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  },
};

export default jwtUtil;
