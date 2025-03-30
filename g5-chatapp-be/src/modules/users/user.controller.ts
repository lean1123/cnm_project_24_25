import { CreateUserRequestDto } from './dto/requests/create-user.req.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserResponseDto } from './dto';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/helpers/response.helper';
import { Public } from 'src/decorators/customize';

@ApiTags('Users') // Nhóm API theo tag "Users"
@Controller('users')
export class UsersController {
  constructor(private userService: UserService) {}

  @Get()
  // @Roles(Role.ADMIN)
  // @UseGuards(AuthGuard(), RolesGuard)
  async findAll(): Promise<UserResponseDto[]> {
    return await this.userService.findAllUser();
  }

  @ApiOperation({ summary: 'find user by phone or email' }) // Mô tả API
  @ApiResponse({ status: 200, description: 'show info user found' }) // Response thành công
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get('search')
  async findUserByPhoneOrEmail(@Query('condition') condition: string) {
    console.log(`condition: ${condition}`);
    return await this.userService.findUserByCondition(condition);
  }

  @Public()
  @ApiOperation({ summary: 'Create a new user' }) // Mô tả API
  @ApiResponse({ status: 201, description: 'User successfully created' }) // Response thành công
  @ApiResponse({ status: 400, description: 'Bad Request' }) // Response lỗi
  @Post()
  async create(@Body() userRequestDto: CreateUserRequestDto) {
    return new ApiResponseDto(
      true,
      HttpStatus.CREATED,
      'User successfully created',
      await this.userService.createUser(userRequestDto),
    );
  }

  @ApiOperation({ summary: 'find user by id' }) // Mô tả API
  @ApiResponse({ status: 200, description: 'show info user found' }) // Response thành công
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findUserById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() user: CreateUserRequestDto) {
    return await this.userService.updateUserById(id, user);
  }

  @ApiOperation({ summary: 'find user and delete by id' }) // Mô tả API
  @ApiResponse({ status: 200, description: 'show info user found' }) // Response thành công
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.deleteUserById(id);
  }
}
