import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Token, TokenSchema } from './schemas/token.schema';
import { TokenRepository } from './token.repository';
import { UsersModule } from '../users/users.module';
import { AuthCacheRepository } from './auth.cache.repository';
import { AuthController } from './auth.controller'; // <-- 1. Import AuthController

@Module({
  imports: [
    UsersModule, 
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback_secret',
        signOptions: {
          expiresIn: `${configService.get<number>('JWT_ACCESS_EXPIRATION_MINUTES') || 15}m`,
        },
      }),
    }),
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  controllers: [AuthController], // <-- 2. Khai báo controllers ở đây
  providers: [AuthService, JwtStrategy, TokenRepository, AuthCacheRepository],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}