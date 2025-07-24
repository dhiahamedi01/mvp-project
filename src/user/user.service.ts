import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    const existingUser = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      fcmToken: createUserDto.fcmToken,
    });

    const savedUser = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = savedUser;

    const payload = {
      email: userWithoutPassword.email || '',
      sub: userWithoutPassword.id,
      phone: userWithoutPassword.phone,
      isAdmin: userWithoutPassword.isAdmin,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
    });

    if (existingUser) {
      throw new ConflictException('User with this phone already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      isAdmin: true,
      fcmToken: createUserDto.fcmToken,
    });

    return this.userRepository.save(user);
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const user = await this.userRepository.findOne({
      where: { phone: loginUserDto.phone },
    });

    if (
      !user ||
      !(await bcrypt.compare(loginUserDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update fcmToken if provided
    if (loginUserDto.fcmToken) {
      user.fcmToken = loginUserDto.fcmToken;
      await this.userRepository.save(user);
    }

    const payload = {
      email: user.email,
      sub: user.id,
      phone: user.phone,
      isAdmin: user.isAdmin,
    };
    const { password, ...userWithoutPassword } = user;

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['requests', 'complaints'],
      select: [
        'id',
        'fullName',
        'phone',
        'email',
        'isAdmin',
        'createdAt',
        'updatedAt',
      ],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['requests', 'complaints'],
      select: [
        'id',
        'fullName',
        'phone',
        'email',
        'isAdmin',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    isAdmin?: boolean,
  ): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.isAdmin) {
      if (!isAdmin) {
        throw new UnauthorizedException('Admin access required');
      }
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['requests', 'complaints', 'posts'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete related entities first to avoid foreign key constraints
    if (user.requests && user.requests.length > 0) {
      await this.userRepository.manager.remove(user.requests);
    }

    if (user.complaints && user.complaints.length > 0) {
      await this.userRepository.manager.remove(user.complaints);
    }

    if (user.posts && user.posts.length > 0) {
      await this.userRepository.manager.remove(user.posts);
    }

    // Finally delete the user
    await this.userRepository.remove(user);
  }

  async validateUser(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}
