import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService
    ) {}

    async getUsers() {
        return this.prisma.user.findMany({
          include: {
            posts: true,
          },
        });
      }
    
    async getUserByUserId(userId: number) {
      return this.prisma.user.findUnique({
        where: {id: userId}
      })
    }

    async updateProfile(
      userId: number,
      data: { fullname?: string; bio?: string; image?: string },
    ) {
      return this.prisma.user.update({
        where: { id: userId },
        data: {
          fullname: data.fullname,
          bio: data.bio,
          image: data.image,
        },
      });
    }
}
