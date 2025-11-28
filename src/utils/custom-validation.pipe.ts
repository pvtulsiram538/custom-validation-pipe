
import {
  HttpException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import Ajv from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { DynamicFormRepository } from 'src/db/dynamic-form.repository';

const ajv = new Ajv({ strict:true});
addFormats(ajv);

ajv.addFormat(
  'Indian driving license',
  /^([A-Z]{2})(\d{2}|\d{3})[a-zA-Z]{0,1}(\d{4})(\d{7})$/gm,
);

// Refer from https://ajv.js.org/guide/formats.html
@Injectable()
export class CustomValidationPipe implements PipeTransform {
  private collection: string;
  private clientId :string;
  constructor(collection: string) {
    this.collection = collection;
  }
  async transform(data: any) {
    if (Object.keys(data).length < 1) {
      throw new HttpException(
        `Validation Failed, Empty payload received`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const { meta } = data;
    if (meta?.collection) {
      if (!meta?.clientId) {

        if (this.collection && this.collection !== meta.collection) {
          throw new HttpException('Invalid meta info', HttpStatus.BAD_REQUEST);
        }
      }

    }
    
    const dbResults = (await DynamicFormRepository.getForm({
        collection: this.collection,
        clientId: meta?.clientId || this.clientId 
      })) || {};
    const { schema } = dbResults;
      

    if (!schema) {
      throw new HttpException(`Meta info is invalid`, HttpStatus.BAD_REQUEST);
    }

    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      if (validate?.errors?.length) {

        const { 0: error }:any = validate.errors;
        console.log(error);
        const errorMessage :string = error.message;
        console.log(errorMessage);
        throw new HttpException(
          errorMessage,
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(`Validation error`, HttpStatus.BAD_REQUEST);
      }
    } else {
      return data;
    }
  }
}



