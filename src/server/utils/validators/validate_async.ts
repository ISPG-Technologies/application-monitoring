import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'ValidateAsyncConstraint', async: true })
export class ValidateAsyncConstraint implements ValidatorConstraintInterface {
  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    if (!value || !args.constraints[0]) {
      return false;
    }
    const obj = await args.constraints[0](value, args);
    return !!obj;
  }
  defaultMessage() {
    return '$value is invalid';
  }
}

export const ValidateAsync = <T, U>(
  validateAsyncFn: (value: T, args: { object: U }) => Promise<boolean>,
  validationOptions?: ValidationOptions,
) => {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'ValidateAsync',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [validateAsyncFn, object],
      validator: ValidateAsyncConstraint,
    });
  };
};
