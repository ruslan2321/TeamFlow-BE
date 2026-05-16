import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UsersController } from './users.controller';

import { JwtStrategy } from './jwt.strategy';
import { UserService } from './users.service';
import { User } from './user.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'fkjwei@ifjf323jiof329020fjfksjkfppDKWKNWJuhu2U1UID12IU1IDB21B',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UsersController],
  providers: [UserService, JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class UsersModule {}
