import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin) // Only admin can view all users
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles(Role.Admin) // Only admin can create a user (might not be necessary, but for admin-created users)
  async createUser(@Body() createUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id/roles')
  @Roles(Role.Admin) // Only admin can assign roles
  async assignRole(@Param('id') userId: string, @Body('role') role: Role) {
    return this.usersService.assignRole(userId, role);
  }

  @Delete(':id')
  @Roles(Role.Admin) // Only admin can delete users
  async deleteUser(@Param('id') userId: string) {
    return this.usersService.delete(userId);
  }
}
