import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcrypt';
import { Model, Types } from 'mongoose';
import { CrudModelService } from '../crud';
import { AuthUser } from '../entities/auth-user.entity';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  private authUserModelService: CrudModelService<AuthUser>;
  constructor(
    @InjectModel(AuthUser.name)
    authUserModel: Model<AuthUser>,
    private userService: UserService,
    private jwtService: JwtService,
  ) {
    this.authUserModelService = new CrudModelService(authUserModel);
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOne({
      email,
      isActive: true,
    });
    if (!user) {
      return undefined;
    }
    if (!user.isActive) {
      return undefined;
    }

    const authUser = await this.authUserModelService.findOne({
      userId: user._id,
    });

    if (!authUser) {
      return undefined;
    }

    const isPasswordCorrect = await compare(
      password,
      authUser.hashedPassword || '',
    );
    if (!isPasswordCorrect) {
      return undefined;
    }

    return user;
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async createOrUpdateAuthUser(
    userId: Types.ObjectId,
    updateData: Partial<AuthUser>,
  ): Promise<void> {
    const authUserRecord = await this.authUserModelService.findOne({
      userId: userId,
    });
    if (authUserRecord) {
      await this.authUserModelService.updateOne(
        {
          userId: userId,
        },
        {
          $set: updateData,
        },
      );
    } else {
      await this.authUserModelService.create({ ...updateData, userId: userId });
    }
  }

  async saveNewPassword(
    userId: Types.ObjectId,
    password: string,
  ): Promise<void> {
    const hashedPassword = await hash(password, 10);
    await this.createOrUpdateAuthUser(userId, {
      hashedPassword,
    });
  }
}
