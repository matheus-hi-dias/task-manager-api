import { ConflictException, Injectable } from '@nestjs/common';
import { UserDTO } from './user.dto';
import { hashSync as bcryptHashSync } from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/db/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(newUser: UserDTO) {
    const userAlreadyExists = await this.findByUsername(newUser.username);

    if (userAlreadyExists) {
      throw new ConflictException(`User ${newUser.username} already exists`);
    }

    const dbUser = new UserEntity();
    dbUser.username = newUser.username;
    dbUser.password = bcryptHashSync(newUser.password, 10);

    const { id, username } = await this.usersRepository.save(dbUser);

    return {
      id,
      username,
    };
  }

  async findByUsername(username: string): Promise<UserDTO | null> {
    const userFound = await this.usersRepository.findOne({
      where: { username },
    });

    if (!userFound) {
      return null;
    }

    return {
      id: userFound.id,
      username: userFound.username,
      password: userFound.password,
    };
  }
}
