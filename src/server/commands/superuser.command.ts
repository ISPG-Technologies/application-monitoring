import { Command, Option } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';

@Injectable()
export class CreateSuperUserCommand {
  constructor(private readonly userService: UserService) {}

  @Command({
    command: 'create:superuser',
    describe: 'create a user',
  })
  async create(
    @Option({
      name: 'email',
      describe: 'email',
      type: 'string',
      required: true,
    })
    email: string,
    @Option({
      name: 'name',
      describe: 'user name',
      type: 'string',
      required: true,
    })
    name: string,
    @Option({
      name: 'password',
      describe: 'user password',
      type: 'string',
      required: true,
    })
    password: string,
  ) {
    console.log('Creating super user');
    await this.userService.createSuperUser({
      email,
      name,
      password,
    });
    console.log('Done');
    process.exit(0);
  }
}
