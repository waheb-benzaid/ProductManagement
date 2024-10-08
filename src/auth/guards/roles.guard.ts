import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from './../enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('RolesGuard - Required roles:', requiredRoles);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('RolesGuard - User from request:', user);

    if (!requiredRoles) {
      return true;
    }

    if (!user) {
      console.log('RolesGuard - No user found in request');
      throw new ForbiddenException('No user found');
    }

    if (!user.role) {
      console.log('RolesGuard - No role found for user');
      throw new ForbiddenException('User role not found');
    }

    const hasRole = requiredRoles.includes(user.role);
    console.log(
      `RolesGuard - User role: ${user.role}, Has required role: ${hasRole}`,
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `Required roles: ${requiredRoles.join(', ')}, User role: ${user.role}`,
      );
    }

    return true;
  }
}
