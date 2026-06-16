import { User } from '../../profile/user.entities';
import { UserStatus } from '../../profile/dto/user-status';
import { toAvatarUrl } from '../../config/avatar-upload.config';

/** Минимум для списков, поиска, assignee задачи */
export interface PublicUserDto {
  id: number;
  username: string;
  avatar: string | null;
  status?: UserStatus;
  role?: string;
}

/** Участник команды */
export interface TeamMemberDto extends PublicUserDto {
  email: string;
}

/** Полный профиль (свой или по id) */
export interface UserProfileDto extends TeamMemberDto {
  location?: string;
  department?: string;
  aboutme?: string;
  emailVerified: boolean;
  phone?: string;
  teamMemberNames: string[];
}

/** Публичный профиль другого пользователя (без email/phone) */
export interface PublicProfileDto extends PublicUserDto {
  location?: string;
  department?: string;
  aboutme?: string;
  teamMemberNames: string[];
}

export function toPublicProfile(user: User): PublicProfileDto {
  return {
    ...toPublicUser(user),
    location: user.location ?? undefined,
    department: user.department ?? undefined,
    aboutme: user.aboutme ?? undefined,
    teamMemberNames: user.teamMembers?.map((m) => m.username) ?? [],
  };
}

export function toPublicUser(user: User): PublicUserDto {
  return {
    id: user.id,
    username: user.username,
    avatar: toAvatarUrl(user.avatar),
    status: user.status,
    role: user.role ?? undefined,
  };
}

export function toTeamMember(user: User): TeamMemberDto {
  return {
    ...toPublicUser(user),
    email: user.email,
  };
}

export function toUserProfile(user: User): UserProfileDto {
  return {
    ...toTeamMember(user),
    location: user.location ?? undefined,
    department: user.department ?? undefined,
    aboutme: user.aboutme ?? undefined,
    emailVerified: user.emailVerified,
    phone: user.phone ?? undefined,
    teamMemberNames: user.teamMembers?.map((m) => m.username) ?? [],
  };
}

export function toAuthResponse(
  user: UserProfileDto,
  token: string,
  expiresIn: string,
  expiresInSeconds: number,
  rememberMe: boolean,
) {
  return {
    ...user,
    token,
    expiresIn,
    expiresInSeconds,
    rememberMe,
  };
}

export function toRegisterResponse(user: UserProfileDto, token: string) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    token,
  };
}
