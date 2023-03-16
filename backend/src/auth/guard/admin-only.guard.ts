import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminOnly = this.reflector.get<boolean | null | undefined>('adminOnly', context.getHandler());
    if (!isAdminOnly)
      return true;
    
    const req = context.switchToHttp().getRequest();
    return (!req.user.isAdmin) ? false : true;
  }
}
