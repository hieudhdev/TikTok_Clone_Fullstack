import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationContext } from 'graphql';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
import { GraphQLErrorFilter } from './filters/custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS config
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
    // all headers that client are allowed to use
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'apollo-require-preflight',
    ],
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  });

  app.use(graphqlUploadExpress({ maxFileSize: 10000000000, maxFiles: 10 }));

  // Cookie parser
  app.use(cookieParser());

  // Data validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce((accumulator, error) => {
          accumulator[error.property] = Object.values(error.constraints).join(
            ', ',
          );
          return accumulator;
        }, {});
        console.log('formattedErrors123', formattedErrors);
        // return formatted errors being an object with properties mapping to errors
        throw new BadRequestException(formattedErrors);
      },
    }),
  );

  app.useGlobalFilters(new GraphQLErrorFilter());

  await app.listen(3000);
}
bootstrap();
