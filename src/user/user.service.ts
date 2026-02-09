import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from 'src/auth/dto/login.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new ConflictException('Email already exists');
      }

      throw new error();
    }
  }

  async getUser(loginUserDto: LoginUserDto) {
    return await this.userModel.findOne({ email: loginUserDto.email });
  }

  async getUserById(id: string) {
    return await this.userModel.findById(id);
  }
}
