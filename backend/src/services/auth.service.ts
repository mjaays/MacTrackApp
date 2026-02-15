import { prisma } from '../utils/prisma';
import { jwtUtil } from '../utils/jwt.util';
import { passwordUtil } from '../utils/password.util';
import { AuthError } from '../errors/AuthError';
import type { RegisterInput, LoginInput } from '../validators/auth.validator';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface UserResponse {
  id: string;
  email: string;
  createdAt: Date;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AuthError('Email already registered');
    }

    // Hash password
    const passwordHash = await passwordUtil.hash(input.password);

    // Create user with profile and default goals
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
          },
        },
        goals: {
          create: {
            goalType: 'MAINTAIN',
          },
        },
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id);

    return { user, tokens };
  }

  async login(input: LoginInput): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    const isValidPassword = await passwordUtil.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AuthError('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AuthError('Invalid or expired refresh token');
    }

    // Delete old refresh token (rotation)
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Generate new tokens
    return this.generateTokens(storedToken.userId);
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { userId, token: refreshToken },
      });
    } else {
      // Logout from all devices
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  private async generateTokens(userId: string): Promise<AuthTokens> {
    const accessToken = jwtUtil.generateAccessToken(userId);
    const refreshToken = jwtUtil.generateRefreshToken();

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: jwtUtil.getRefreshTokenExpiry(),
      },
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
export default authService;
