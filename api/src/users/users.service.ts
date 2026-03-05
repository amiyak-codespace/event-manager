import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  /**
   * Service for user CRUD operations.
   */
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Find a user by email address.
   *
   * Args:
   *   email (string): Email to search for.
   *
   * Returns:
   *   Promise<User | null>: The found user or null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Find a user by ID.
   *
   * Args:
   *   id (string): UUID of the user.
   *
   * Returns:
   *   Promise<User | null>: The found user or null.
   */
  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * Create a new user with hashed password.
   *
   * Args:
   *   name (string): Display name.
   *   email (string): Unique email.
   *   password (string): Plain-text password (will be hashed).
   *   role (UserRole): Optional role, defaults to USER.
   *
   * Returns:
   *   Promise<User>: The created user entity.
   */
  async create(
    name: string,
    email: string,
    password: string,
    role?: UserRole,
  ): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      name,
      email,
      password: hashed,
      role: role ?? UserRole.USER,
    });
    return this.usersRepository.save(user);
  }

  /**
   * List all users (excluding password).
   *
   * Returns:
   *   Promise<User[]>: Array of user objects without passwords.
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'role', 'createdAt'],
    });
  }
}
