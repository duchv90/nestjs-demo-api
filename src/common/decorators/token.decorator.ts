import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return null; // or throw an exception
    }

    return authHeader.split(' ')[1]; // Return the token
  },
);
