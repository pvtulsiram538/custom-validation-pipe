import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DatabaseProviders } from 'src/providers/mongo.connection';
import { DynamicFormRepository } from 'src/db/dynamic-form.repository';

@Module({
  controllers: [UserController],
  providers: [UserService,...DatabaseProviders,DynamicFormRepository],
  exports:[...DatabaseProviders,DynamicFormRepository]
})
export class UserModule {}
