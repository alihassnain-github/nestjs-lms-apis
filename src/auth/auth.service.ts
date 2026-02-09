import bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const hash = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.userService.createUser({
      ...createUserDto,
      password: hash,
    });

    const payload = { sub: user._id };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.userService.getUser(loginUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCorrectPassword = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isCorrectPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getProfile(userId: string) {
    return await this.userService.getUserById(userId);
  }
}
