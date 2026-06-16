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

import { UserService } from './users.service';
import { CreateUser } from './dto/create-user-dto';
import { login } from './dto/login-user-dto';
import { SearchUsersDto } from './dto/search-user-dto';
import { AddToTeamDto } from './dto/add-to-team.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { avatarUploadOptions } from '../config/avatar-upload.config';
import { toAuthResponse, toRegisterResponse } from '../common/mappers/user.mapper';

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
    return toRegisterResponse(res.user, res.token);
  }

  @Post('login')
  async login(@Body() dto: login) {
    const result = await this.service.loginUser(
      dto.login,
      dto.password,
      dto.rememberMe ?? false,
    );

    if (!result) {
      throw new UnauthorizedException('Логин или пароль неверный');
    }

    return toAuthResponse(
      result.user,
      result.token,
      result.expiresIn,
      result.expiresInSeconds,
      dto.rememberMe ?? false,
    );
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
  @Post('update_avatar')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadOptions))
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.handleAvatarUpload(req, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('update_avatar')
  @UseInterceptors(FileInterceptor('avatar', avatarUploadOptions))
  async patchAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.handleAvatarUpload(req, file);
  }

  private async handleAvatarUpload(
    req: { user?: { sub?: number } },
    file: Express.Multer.File,
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
      avatar: updatedUser.avatar,
    };
  }
}
