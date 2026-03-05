import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  /**
   * Handles user signup, login, and token generation.
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user and return a JWT.
   *
   * Args:
   *   dto (SignupDto): User registration data.
   *
   * Returns:
   *   Promise<{ token: string; user: object }>: Token and sanitized user.
   */
  async signup(dto: SignupDto) {
    const user = await this.usersService.create(dto.name, dto.email, dto.password);
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  /**
   * Authenticate a user by email/password and return a JWT.
   *
   * Args:
   *   email (string): User's email.
   *   password (string): Plain-text password.
   *
   * Returns:
   *   Promise<{ token: string; user: object }>: Token and sanitized user.
   */
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  /**
   * Return the current authenticated user's profile.
   *
   * Args:
   *   userId (string): Authenticated user's ID from JWT.
   *
   * Returns:
   *   Promise<object>: Sanitized user profile.
   */
  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  /**
   * Issue a fresh token for the already-authenticated user.
   *
   * Args:
   *   userId (string): Authenticated user's ID from the current JWT.
   *
   * Returns:
   *   Promise<{ token: string }>: Fresh JWT.
   */
  async refresh(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const token = this.jwtService.sign({
      sub:   user.id,
      email: user.email,
      role:  user.role,
    });
    return { token };
  }
}
