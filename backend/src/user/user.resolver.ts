import { Args, Resolver, Context, Mutation, Query } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import { RegisterResponse } from 'src/auth/types';
import { RegisterDto } from 'src/auth/dto';
import { BadRequestException, UseFilters } from '@nestjs/common';
import { Request, Response } from 'express'
import { User } from './user.model';
import { LoginResponse } from 'src/auth/types';
import { LoginDto } from 'src/auth/dto';
import { GraphQLErrorFilter } from '../filters/custom-exception.filter'

@Resolver()
export class UserResolver {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) {}

    @UseFilters(GraphQLErrorFilter)
    @Mutation(() => RegisterResponse)
    async register (
        @Args('registerInput') registerDto: RegisterDto,
        @Context() context: { res: Response }
    ): Promise<RegisterResponse> {
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new BadRequestException({
              confirmPassword: 'Password and confirm password are not the same.',
            });
        }
        
        const { user } = await this.authService.register(
            registerDto,
            context.res,
        );
        console.log('user!', user);
        return { user };
    }

    @Mutation(() => LoginResponse) // Adjust this return type as needed
    async login(
        @Args('loginInput') loginDto: LoginDto,
        @Context() context: { res: Response },
    ) {
        return this.authService.login(loginDto, context.res);
    }

    @Mutation(() => String)
    async logout(@Context() context: { res: Response }) {
        return this.authService.logout(context.res);
    }

    @Mutation(() => String)
    async refreshToken(@Context() context: { req: Request; res: Response }) {
      try {
        return this.authService.genAccessTokenByRefreshToken(context.req, context.res);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    @Query(() => String)
    async hello () {
        return 'hello world'
    }

    @Query(() => [User])
    async getUsers() {
      return this.userService.getUsers();
    }
}
