import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsBoolean,
  IsUUID,
} from 'class-validator';
export class Schema {
  @IsString()
  @IsNotEmpty()
  type = 'object';

  @IsNotEmpty()
  properties: object;

  @IsArray()
  @IsNotEmpty()
  required: Array<string>;

  @IsBoolean()
  @IsNotEmpty()
  additionalProperties = false;
}
export class DnForm {
  @IsArray()
  @IsNotEmpty()
  clientId: Array<any>;

  @IsString()
  @IsNotEmpty()
  collection: string;

  @IsNotEmpty()
  schema: Schema;
}

export class ViewDnForm {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  collection: string;
}
