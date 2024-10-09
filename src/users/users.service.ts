import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { Role } from 'src/auth/enums/roles.enum';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async create(createUserDto): Promise<User> {
    const { password } = createUserDto;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword, // Store the hashed password
    });

    return newUser.save();
  }

  async assignRole(userId: string, role: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate that the incoming role is part of the Role enum
    if (!(role in Role)) {
      throw new BadRequestException(`Invalid role: ${role}`);
    }

    user.role = role as Role;
    return user.save();
  }

  async delete(userId: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(userId);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}
