import { Args, Resolver, Context, Mutation, Query } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import { RegisterResponse } from 'src/auth/types';
import { RegisterDto } from 'src/auth/dto';
import { BadRequestException, UseFilters, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express'
import { User } from './user.model';
import { LoginResponse } from 'src/auth/types';
import { LoginDto } from 'src/auth/dto';
import { GraphQLErrorFilter } from '../filters/custom-exception.filter'
import * as GraphQLUpload from 'graphql-upload/GraphQLUpload.js';
import { GraphqlAuthGuard } from '../auth/graphql-auth/graphql-auth.guard';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createWriteStream } from 'fs';
// import * as FileUpload from 'graphql-upload/graphqlUploadExpress.js';

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

    @Query(() => [User])
    async getUsers() {
      return this.userService.getUsers();
    }

    @Query(() => User)
    async getUserByUserId(@Args('userId') userId: number) {
      return this.userService.getUserByUserId(userId);
    }

    @UseGuards(GraphqlAuthGuard)
    @Mutation(() => User)
    async updateUserProfile(
      @Context()
      context: { req: Request },
      @Args('fullname', { type: () => String, nullable: true }) fullname?: string,
      @Args('bio', { type: () => String, nullable: true }) bio?: string,
      @Args('image', { type: () => GraphQLUpload, nullable: true })
      image?: GraphQLUpload,
    ) {
      console.log('image!', image, 'fullname!', fullname, 'bio!', bio);
      let imageUrl;
      if (image) {
        imageUrl = await this.storeImageAndGetURL(image);
      }
      return this.userService.updateProfile(context.req.user.sub, {
        fullname,
        bio,
        image: imageUrl,
      });
    }

    private async storeImageAndGetURL(file: GraphQLUpload): Promise<string> {
      const { createReadStream, filename } = await file;
      const fileData = await file;
      console.log('fileData!', fileData);
  
      const uniqueFilename = `${uuidv4()}_${filename}`;
      const imagePath = join(process.cwd(), 'public', uniqueFilename);
      const imageUrl = `${process.env.APP_URL}/${uniqueFilename}`;
      // console.log('aaaa:', imageUrl)
      const readStream = createReadStream();
      readStream.pipe(createWriteStream(imagePath));
  
      return imageUrl; // Return the appropriate URL where the file can be accessed
    }
}
