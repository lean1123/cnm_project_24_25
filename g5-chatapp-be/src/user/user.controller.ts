import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/role.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { UserRequest } from './dto/requests/user.dto';
import { JwtPayload } from 'src/auth/interfaces/jwtPayload.interface';
import { UserDecorator } from 'src/common/decorator/user.decorator';
import { User } from './schema/user.schema';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private UserService: UserService) {}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard(), RolesGuard)
  async findAll(): Promise<User[]> {
    return await this.UserService.findAll();
  }

  @Post()
  async create(@Body() user: User): Promise<User> {
    return await this.UserService.create(user);
  }

  @Get(':id')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  async findById(@Param('id') id: string): Promise<User> {
    return await this.UserService.findById(id);
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @UserDecorator() user: JwtPayload,
    @Body() userDto: UserRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    return await this.UserService.update(user, userDto, file);
  }
}
