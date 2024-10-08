import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Call the parent canActivate method
    const result = await super.canActivate(context);
    const request = context.switchToHttp().getRequest();

    // Log the authentication result and user
    console.log('JwtAuthGuard - Auth Result:', result);
    console.log('JwtAuthGuard - User:', request.user);

    return result as boolean;
  }
}
