/**
 * Validation of Joi schemas
 * @see https://docs.nestjs.com/pipes
 * @see https://www.npmjs.com/package/joi
 * @see https://github.com/hapijs/joi/blob/master/API.md#anyvalidatevalue-options
 */
import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Schema, ValidationOptions } from 'joi';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: Schema,
    private readonly options?: ValidationOptions,
  ) {}

  transform(rawValue: any, metadata: ArgumentMetadata) {
    const { value, error } = this.schema.validate(rawValue, this.options);
    if (error) {
      throw new BadRequestException(error);
    }
    return value;
  }
}
