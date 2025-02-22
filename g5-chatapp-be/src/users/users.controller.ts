import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from './schema/user.schema';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/role.guards';

@Controller('users')
export class UsersController {
  constructor(private UsersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  async findAll(): Promise<User[]> {
    return await this.UsersService.findAll();
  }

  @Post()
  async create(@Body() user: User): Promise<User> {
    return await this.UsersService.create(user);
  }
}
