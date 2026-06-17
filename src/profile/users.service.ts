import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entities';
import { CreateUser } from './dto/create-user-dto';
import { SearchUsersDto } from './dto/search-user-dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
  avatarStorageFileName,
  AVATARS_DIR,
} from '../config/avatar-upload.config';
import {
  getJwtExpiresIn,
  getJwtExpiresInSeconds,
} from '../config/jwt.config';
import {
  PublicUserDto,
  PublicProfileDto,
  TeamMemberDto,
  UserProfileDto,
  toPublicProfile,
  toPublicUser,
  toTeamMember,
  toUserProfile,
} from '../common/mappers/user.mapper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private sanitizeUser(user: User): UserProfileDto {
    return toUserProfile(user);
  }

  private sanitizeTeamMember(user: User): TeamMemberDto {
    return toTeamMember(user);
  }

  private sanitizePublicUser(user: User): PublicUserDto {
    return toPublicUser(user);
  }

  async createUser(
    dto: CreateUser,
  ): Promise<{ user: UserProfileDto; token: string }> {
    try {
      const login = dto.login.trim();
      const existingLogin = await this.repo.findOne({ where: { login } });
      if (existingLogin) {
        throw new BadRequestException('Этот логин уже занят');
      }

      const username =
        dto.name.trim() ||
        `${dto.firstname.trim()} ${dto.lastname.trim()}`.trim() ||
        login;

      const email =
        dto.email?.trim().toLowerCase() || `${login}@teamflow.local`;

      const existingEmail = await this.repo.findOne({ where: { email } });
      if (existingEmail) {
        throw new BadRequestException('Этот email уже занят');
      }

      const bcryptRounds = process.env.VERCEL ? 8 : 10;
      const hashPass = await bcrypt.hash(dto.password, bcryptRounds);

      const user = this.repo.create({
        username,
        email,
        login,
        password: hashPass,
        role: dto.role.trim(),
        department: dto.post.trim(),
      });

      const savedUser = await this.repo.save(user);

      const payload = {
        sub: savedUser.id,
        login: savedUser.login,
        username: savedUser.username,
        email: savedUser.email,
      };

      const token = this.jwtService.sign(payload);

      return { user: this.sanitizeUser(savedUser), token };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('createUser error:', error);
      throw new InternalServerErrorException(
        'Ошибка при создании пользователя',
      );
    }
  }

  async updateProfile(
    id: number,
    updateDto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const updateData: Partial<User> = {};

    if (updateDto.email !== undefined) {
      updateData.email = updateDto.email.trim().toLowerCase();
    }

    if (updateDto.username !== undefined) {
      updateData.username = updateDto.username.trim();
    }

    if (updateDto.phone !== undefined) {
      updateData.phone = updateDto.phone.trim();
    }

    if (updateDto.location !== undefined) {
      updateData.location = updateDto.location.trim();
    }

    if (updateDto.department !== undefined) {
      updateData.department = updateDto.department.trim();
    }

    if (updateDto.role !== undefined) {
      updateData.role = updateDto.role.trim();
    }

    if (updateDto.aboutMe !== undefined) {
      updateData.aboutme = updateDto.aboutMe.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return this.sanitizeUser(user);
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingEmailUser = await this.repo.findOne({
        where: { email: updateData.email },
      });

      if (existingEmailUser && existingEmailUser.id !== id) {
        throw new BadRequestException('Этот Email уже занят');
      }
    }

    if (updateData.username && updateData.username !== user.username) {
      const existingUsernameUser = await this.repo.findOne({
        where: { username: updateData.username },
      });

      if (existingUsernameUser && existingUsernameUser.id !== id) {
        throw new BadRequestException('Это имя пользователя уже занято');
      }
    }

    try {
      await this.repo.update({ id }, updateData);

      const updatedUser = await this.repo.findOne({ where: { id } });

      if (!updatedUser) {
        throw new NotFoundException('Пользователь не найден после обновления');
      }

      return this.sanitizeUser(updatedUser);
    } catch (error: any) {
      const code = error?.driverError?.code ?? error?.code;
      const constraint =
        error?.driverError?.constraint ?? error?.constraint ?? '';

      if (code === '23505') {
        if (constraint.includes('email')) {
          throw new BadRequestException('Этот Email уже занят');
        }

        if (constraint.includes('username')) {
          throw new BadRequestException('Это имя пользователя уже занято');
        }

        throw new BadRequestException(
          'Некоторые данные уже используются другим пользователем',
        );
      }

      console.error('updateProfile error:', error);
      throw new InternalServerErrorException('Ошибка при обновлении профиля');
    }
  }

  async updateAvatar(
    id: number,
    avatarFileName: string,
  ): Promise<UserProfileDto> {
    const user = await this.repo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    try {
      const oldFileName = avatarStorageFileName(user.avatar);
      if (oldFileName) {
        const oldFilePath = join(AVATARS_DIR, oldFileName);

        try {
          await fs.unlink(oldFilePath);
        } catch (unlinkError: any) {
          if (unlinkError?.code !== 'ENOENT') {
            console.error('old avatar unlink error:', unlinkError);
          }
        }
      }

      await this.repo.update({ id }, { avatar: avatarFileName });

      const updatedUser = await this.repo.findOne({ where: { id } });

      if (!updatedUser) {
        throw new NotFoundException(
          'Пользователь не найден после обновления аватара',
        );
      }

      return this.sanitizeUser(updatedUser);
    } catch (error) {
      console.error('updateAvatar error:', error);
      throw new InternalServerErrorException('Ошибка при обновлении аватара');
    }
  }

  async loginUser(
    login: string,
    password: string,
    rememberMe = false,
  ): Promise<{
    user: UserProfileDto;
    token: string;
    expiresIn: string;
    expiresInSeconds: number;
  } | null> {
    const user = await this.repo.findOne({ where: { login } });

    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    const payload = {
      sub: user.id,
      login: user.login,
      username: user.username,
      email: user.email,
      rememberMe,
    };

    const expiresIn = getJwtExpiresIn(rememberMe);
    const expiresInSeconds = getJwtExpiresInSeconds(rememberMe);
    const token = this.jwtService.sign(payload, { expiresIn: expiresInSeconds });

    return {
      user: this.sanitizeUser(user),
      token,
      expiresIn,
      expiresInSeconds,
    };
  }

  async findAll(): Promise<PublicUserDto[]> {
    const users = await this.repo.find();
    return users.map((user) => this.sanitizePublicUser(user));
  }

  async Profile(id: number): Promise<PublicProfileDto | null> {
    const user = await this.repo.findOne({
      where: { id },
      relations: ['teamMembers'],
    });

    if (!user) return null;

    return toPublicProfile(user);
  }

  async searchUsers(dto: SearchUsersDto) {
    const { q, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;
    const query = this.repo.createQueryBuilder('user');

    if (q?.trim()) {
      const term = `%${q.trim()}%`;
      query
        .where('user.username ILIKE :term', { term })
        .orWhere('user.email ILIKE :term', { term });
    }

    const [users, total] = await query
      .orderBy('user.username', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const safeUsers = users.map((user) => this.sanitizePublicUser(user));

    return {
      data: safeUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async addToTeam(ownerId: number, memberId: number) {
    if (ownerId === memberId) {
      throw new BadRequestException('Нельзя добавить себя в команду');
    }

    const [owner, member] = await Promise.all([
      this.repo.findOne({
        where: { id: ownerId },
        relations: ['teamMembers'],
      }),
      this.repo.findOne({ where: { id: memberId } }),
    ]);

    if (!owner || !member) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (owner.teamMembers?.some((m) => m.id === memberId)) {
      return {
        success: false,
        message: 'Пользователь уже в команде',
        alreadyAdded: true,
      };
    }

    owner.teamMembers = [...(owner.teamMembers || []), member];
    await this.repo.save(owner);

    return {
      success: true,
      message: 'Пользователь добавлен в команду',
      alreadyAdded: false,
      data: this.sanitizeTeamMember(member),
    };
  }

  async getTeam(ownerId: number) {
    const user = await this.repo.findOne({
      where: { id: ownerId },
      relations: ['teamMembers'],
      select: ['id', 'username', 'email', 'login'],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const filteredMembers =
      user.teamMembers?.map((member) => this.sanitizeTeamMember(member)) || [];

    return {
      data: filteredMembers,
      meta: { total: user.teamMembers?.length || 0 },
    };
  }

  async create(user: Partial<User>): Promise<User> {
    return this.repo.save(user);
  }
}
