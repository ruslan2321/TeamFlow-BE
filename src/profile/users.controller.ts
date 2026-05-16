import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { UserService } from './users.service';
import { CreateUser } from './dto/create-user-dto';
import { login } from './dto/login-user-dto';
import { SearchUsersDto } from './dto/search-user-dto';
import { AddToTeamDto } from './dto/add-to-team.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('')
export class UsersController {
  constructor(private readonly service: UserService) {}

  @Get('search')
  async search(@Query() dto: SearchUsersDto) {
    return this.service.searchUsers(dto);
  }

  @Get('profile/:id')
  async getProfile(@Param('id', ParseIntPipe) id: number) {
    return this.service.Profile(id);
  }

  @Post('add_user')
  async register(@Body() dto: CreateUser) {
    const res = await this.service.createUser(dto);

    return {
      username: res.user.username,
      email: res.user.email,
      token: res.token,
    };
  }

  @Post('login')
  async login(@Body() dto: login) {
    const user = await this.service.loginUser(dto.login, dto.password);

    if (!user) {
      throw new UnauthorizedException('Логин или пароль неверный');
    }

    return {
      ...user.user,
      token: user.token,
    };
  }

  @Post(':ownerId/team')
  async addToTeam(
    @Param('ownerId', ParseIntPipe) ownerId: number,
    @Body() dto: AddToTeamDto,
  ) {
    return this.service.addToTeam(ownerId, dto.memberId);
  }

  @Get(':ownerId/team')
  async getTeam(@Param('ownerId', ParseIntPipe) ownerId: number) {
    return this.service.getTeam(ownerId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update_profile')
  async updateProfile(@Req() req: any, @Body() dto: UpdateUserDto) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    const updatedUser = await this.service.updateProfile(userId, dto);

    return {
      message: 'Профиль успешно обновлен',
      user: updatedUser,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update_avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Разрешены только JPG, PNG и WEBP'),
            false,
          );
        }

        cb(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  async updateAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    const updatedUser = await this.service.updateAvatar(userId, file.filename);

    return {
      message: 'Аватар успешно обновлен',
      user: updatedUser,
    };
  }
}
