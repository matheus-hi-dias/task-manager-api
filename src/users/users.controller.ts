import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDTO } from './user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() user: UserDTO) {
    return await this.usersService.create(user);
  }
}
