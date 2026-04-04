import { ValidationOptions, ValidatorConstraintInterface } from 'class-validator';
export declare class NoBase64Constraint implements ValidatorConstraintInterface {
    validate(text: string): boolean;
    defaultMessage(): string;
}
export declare function NoBase64Image(validationOptions?: ValidationOptions): (object: NonNullable<unknown>, propertyName: string) => void;
