import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  Inject,
} from '@nestjs/common';
import * as mongo from 'mongodb';
import { MemoryDb } from 'minimongo';

@Injectable()
export class DynamicFormRepository implements OnApplicationBootstrap {
  static localDb: any;
  private readonly dynamicForm: mongo.Collection;
  constructor(@Inject('DATABASE_CONNECTION') private db: mongo.Db) {
    this.dynamicForm = this.db.collection('dynamicForm');
  }
  async onApplicationBootstrap() {
    this.intiateForms();
  }
  async intiateForms() {
    DynamicFormRepository.localDb = new MemoryDb();
    const results = await this.dynamicForm.find().toArray();

    DynamicFormRepository.localDb.addCollection('dynamicForm');
    await DynamicFormRepository.localDb['dynamicForm'].upsert(
      results,
    );
  }
  static async getForm(query: any) {
    return await DynamicFormRepository.localDb.dynamicForm.findOne(query);
  }
  public async upsertForm(payload: any) {
    try {
      const { clientId, collection } = payload;

      const query = { clientId, collection };
      const data = {
        schema: {
          ...payload.schema,
        },
      };
      const result: any = await this.dynamicForm.updateOne(
        query,
        {
          $set: {
            ...data,
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      );
      await this.intiateForms();
      return result;
    } catch (error) {
      return await this.errorHandler(error);
    }
  }
  public async findForms(payload: any) {
    const { clientId, collection } = payload;
    let query = {};
    if (clientId && collection) {
      query = { clientId, collection };
    }
    const result = await this.dynamicForm.findOne(query);
    if (!result) {
      throw new HttpException(`Form not found`, HttpStatus.NOT_FOUND);
    }

    const {
      schema: { properties = {}, required = [] },
    } = result;

    return { properties, required };
  }

  private async errorHandler(error: any) {
    if (error instanceof HttpException) {
      throw error;
    }
    if (error instanceof mongo.MongoServerError) {
      Logger.error(
        `Fuel: error at Mongo level  ${error.errmsg} : ${error.errInfo} `,
      );
      throw new HttpException(
        `Unable to complete the database operation!`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    Logger.error(`Ajv pipes: operation failed : ${error?.message}  `);
    throw new HttpException(
      'Unable to update/find  the Schema details! ',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
