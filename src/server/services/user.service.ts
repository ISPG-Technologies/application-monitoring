import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CrudFindOneOptions, CrudModelService } from '../crud';
import { User } from '../entities';
import { AuthService } from './auth.service';

@Injectable()
export class UserService {
  private userModelService: CrudModelService<User>;
  constructor(
    @InjectModel(User.name)
    userModel: Model<User>,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  ) {
    this.userModelService = new CrudModelService(userModel);
  }

  async findOne(filters: FilterQuery<User>, options?: CrudFindOneOptions) {
    return this.userModelService.findOne(filters, options);
  }

  public async createSuperUser(data: {
    email: string;
    name: string;
    password: string;
  }) {
    const existing = await this.userModelService.findOne({ email: data.email });
    if (existing) {
      return;
    }
    const user = await this.userModelService.create({
      ...data,
      isActive: true,
    });

    await this.authService.saveNewPassword(user._id, data.password);

    return user;
  }
}
