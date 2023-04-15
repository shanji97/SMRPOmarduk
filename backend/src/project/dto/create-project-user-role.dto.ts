import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

import { UserRole } from '../project-user-role.entity';

export class CreateProjectUserRoleDto {
  @ApiProperty({
    example: 1,
    description: 'This is a sample user id in the database.',
    minimum: 1,
    default: 1
  })
  userId: number;

  @ApiProperty({
    example: 0,
    description: 'Developer (0), Scrum master (1), Product owner (2).',
    minimum: 0,
    maximum: 2,
    default: 1
  })
  role: (UserRole | number)[];
}

export const CreateProjectUserRoleSchema = Joi.object().keys({
    userId: Joi.number().min(1).required(),
    role: Joi.array().items(Joi.number().min(0).max(2).required().default(0))
});

export function hasNewProjectUsersWithRole(userRoles: CreateProjectUserRoleDto[], role: UserRole | number, exactCount: number = 0): boolean {
  let count = 0;
  for (const userRole of userRoles) {
    if (userRole.role.includes(role)) {
      count++;
      if (exactCount < 0 && count >= Math.abs(exactCount)) // Negative count = at least that many
        return true;
    }
  }
  return count === exactCount;
}

export function getFirstNewProjectUserWithRole(userRoles: CreateProjectUserRoleDto[], role: UserRole | number): number | null {
  for (const userRole of userRoles)
    if (userRole.role.includes(role))
      return userRole.userId;
  return null;
}

export function hasNewProjectUserRole(userRoles: CreateProjectUserRoleDto[], userId: number, role: UserRole | number, otherThan: boolean = false): boolean {
  if (!userId)
    return false;
  if (!otherThan) {
    return userRoles.filter(ur => ur.userId === userId && ur.role.includes(role)).length > 0;
  } else {
    return userRoles.filter(ur => ur.userId === userId && ur.role.filter(i => i != role).length > 0).length > 0;
  }
}

export function hasNewProjectProjectOwner(userRoles: CreateProjectUserRoleDto[]): boolean {
  const userId = getFirstNewProjectUserWithRole(userRoles, UserRole.ProjectOwner);
  if (userId === null || hasNewProjectUserRole(userRoles, userId, UserRole.ProjectOwner, true))
    return false;
  return hasNewProjectUsersWithRole(userRoles, UserRole.ProjectOwner, 1);
}

export function hasNewProjectScrumMaster(userRoles: CreateProjectUserRoleDto[]): boolean {
  const userId = getFirstNewProjectUserWithRole(userRoles, UserRole.ScrumMaster);
  if (userId === null || hasNewProjectUserRole(userRoles, userId, UserRole.ProjectOwner))
    return false;
  return hasNewProjectUsersWithRole(userRoles, UserRole.ScrumMaster, 1);
}

export function hasNewProjectDevelopers(userRoles: CreateProjectUserRoleDto[]): boolean {
  return hasNewProjectUsersWithRole(userRoles, UserRole.Developer, -1);
}
