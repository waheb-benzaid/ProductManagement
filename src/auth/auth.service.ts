import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Model } from 'mongoose';
import { SignUpDto } from './dtos/signup.dto.ts';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User')
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<{ message: string }> {
    const { name, email, password, role } = signUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Client',
    });
    // const payload = { id: newUser._id, role: newUser.role };
    // const accessToken = this.jwtService.sign(payload);
    // const refreshToken = this.jwtService.sign(payload, { expiresIn: '10d' }); // Long-lived refresh token

    return { message: 'User created successfully. Please login to continue.' };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    console.log(user, 'user');

    if (!user) {
      throw new UnauthorizedException('invalid email or password');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('invalid email or password');
    }

    const payload = {
      id: user._id.toString(),
      email: user.email, // Include email in payload
      role: user.role,
      sub: user._id.toString(), // Include sub for JWT standard
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store the refresh token in the database
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken);

      // Check if the refresh token matches the one stored in the database
      const user = await this.userModel.findById(payload.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate a new access token
      const newAccessToken = this.jwtService.sign({
        id: user._id,
        role: user.role,
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token', error);
    }
  }
}
