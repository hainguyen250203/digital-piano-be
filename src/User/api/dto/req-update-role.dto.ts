import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ReqUpdateRoleDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role, { message: 'role must be one of the predefined roles' })
  @IsNotEmpty({ message: 'role is required' })
  role: Role;
} 