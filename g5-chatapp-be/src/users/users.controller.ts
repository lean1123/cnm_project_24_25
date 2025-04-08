import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from './schema/user.schema';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { UserRequest } from './dto/requests/user.req';

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

  @Get(':id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  async findById(@Param('id') id: string): Promise<User> {
    return await this.UsersService.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() user: UserRequest,
  ): Promise<User> {
    return await this.UsersService.update(id, user);
  }
}
