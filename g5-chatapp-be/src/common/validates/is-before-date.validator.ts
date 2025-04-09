import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsBeforeToday(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBeforeToday',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0); // reset giờ
          const inputDate = new Date(value);
          return inputDate < today;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be before today`;
        },
      },
    });
  };
}
