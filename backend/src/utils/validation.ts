import { validate as validateUUID } from 'uuid';
import Errors from '../errors';

export type ParamType = 'string' | 'number' | 'uuid' | 'date' | 'boolean' | 'string[]' | 'number[]' | 'uuid[]' | 'enum' | 'object'| 'array';

export interface QueryValidationRule {
    required?: boolean;
    type: ParamType;
    min?: number;
    max?: number;
    minDate?: Date;
    separator?: string;
    values?: any[];
    default?: any;
}

export type QueryValidationRules = Record<string, QueryValidationRule>;

export const validateQueryParams = (query: Record<string, any>, rules: QueryValidationRules): void => {
  for (const key in rules) {
    const rule = rules[key];
    const value = query[key];

    if (rule.required && (value === undefined || value === null || value === '')) {
        throw new Errors.BadRequestError(`Missing required parameter: ${key}`);
    }

    if ((value === undefined || value === null || value === '' || value === ' ' || value === '  ') && rule.default !== undefined) {
        query[key] = rule.default;
    }

    const normalizedValue = query[key];

    if (normalizedValue !== undefined && normalizedValue !== null && normalizedValue !== '' && normalizedValue !== ' ' && normalizedValue !== '  ') {
      switch (rule.type) {
        case 'number': {
          const num = Number(normalizedValue);
          if (isNaN(num)) {
            throw new Errors.BadRequestError(`${key} must be a number`);
          }
          if (rule.min !== undefined && num < rule.min) {
            throw new Errors.BadRequestError(`${key} must be >= ${rule.min}`);
          }
          if (rule.max !== undefined && num > rule.max) {
            throw new Errors.BadRequestError(`${key} must be <= ${rule.max}`);
          }
          query[key] = num;
          break;
        }

        case 'string': {
          const stringValue = typeof normalizedValue === 'string' ? normalizedValue.trim() : normalizedValue.toString();
          if (rule.min !== undefined && stringValue.length < rule.min) {
            throw new Errors.BadRequestError(`${key} must be at least ${rule.min} characters long`);
          }
          if (rule.max !== undefined && stringValue.length > rule.max) {
            throw new Errors.BadRequestError(`${key} must be at most ${rule.max} characters long`);
          }
          query[key] = stringValue;
          break;
        }

        case 'uuid':
          if (typeof normalizedValue !== 'string' || !validateUUID(normalizedValue)) {
            throw new Errors.BadRequestError(`${key} must be a valid UUID`);
          }
          break;

        case 'boolean':
            if (typeof normalizedValue === 'boolean') {
              query[key] = normalizedValue;
            } else if (typeof normalizedValue === 'string') {
              if (normalizedValue.toLowerCase() === 'true') {
                query[key] = true;
              } else if (normalizedValue.toLowerCase() === 'false') {
                query[key] = false;
              } else {
                throw new Errors.BadRequestError(`${key} must be a boolean (true or false)`);
              }
            } else {
              throw new Errors.BadRequestError(`${key} must be a boolean (true or false)`);
            }
            break;

          case 'date': {
              const date = new Date(normalizedValue);
              if (isNaN(date.getTime())) {
                  throw new Errors.BadRequestError(`${key} must be a valid date`);
              }
              if (rule.minDate && date < rule.minDate) {
                  throw new Errors.BadRequestError(`${key} must be >= ${rule.minDate.toISOString()}`);
              }
              query[key] = date;
              break;
          }

          case 'string[]': {
            const separator = rule.separator || ',';
            let stringArray: string[];

            if (Array.isArray(normalizedValue)) {
              stringArray = normalizedValue;
            } else if (typeof normalizedValue === 'string') {
              stringArray = normalizedValue.split(separator).map(item => item.trim()).filter(item => item !== '');
            } else {
              throw new Errors.BadRequestError(`${key} must be a string array`);
            }

            for (const item of stringArray) {
              if (typeof item !== 'string') {
                throw new Errors.BadRequestError(`All items in ${key} must be strings`);
              }
              if (rule.min !== undefined && item.length < rule.min) {
                throw new Errors.BadRequestError(`All items in ${key} must be at least ${rule.min} characters long`);
              }
              if (rule.max !== undefined && item.length > rule.max) {
                throw new Errors.BadRequestError(`All items in ${key} must be at most ${rule.max} characters long`);
              }
            }

            query[key] = stringArray;
            break;
          }

          case 'number[]': {
            const numSeparator = rule.separator || ',';
            let numberArray: number[];

            if (Array.isArray(normalizedValue)) {
              numberArray = normalizedValue.map(item => {
                const num = Number(item);
                if (isNaN(num)) {
                  throw new Errors.BadRequestError(`All items in ${key} must be valid numbers`);
                }
                return num;
              });
            } else if (typeof normalizedValue === 'string') {
              const items = normalizedValue.split(numSeparator).map(item => item.trim()).filter(item => item !== '');
              numberArray = items.map(item => {
                const num = Number(item);
                if (isNaN(num)) {
                  throw new Errors.BadRequestError(`All items in ${key} must be valid numbers`);
                }
                return num;
              });
            } else {
              throw new Errors.BadRequestError(`${key} must be a number array`);
            }

            for (const num of numberArray) {
              if (rule.min !== undefined && num < rule.min) {
                throw new Errors.BadRequestError(`All items in ${key} must be >= ${rule.min}`);
              }
              if (rule.max !== undefined && num > rule.max) {
                throw new Errors.BadRequestError(`All items in ${key} must be <= ${rule.max}`);
              }
            }

            query[key] = numberArray;
            break;
          }

          case 'uuid[]': {
            const uuidSeparator = rule.separator || ',';
            let uuidArray: string[];

            if (Array.isArray(normalizedValue)) {
              uuidArray = normalizedValue;
            } else if (typeof normalizedValue === 'string') {
              uuidArray = normalizedValue.split(uuidSeparator).map(item => item.trim()).filter(item => item !== '');
            } else {
              throw new Errors.BadRequestError(`${key} must be a UUID array`);
            }

            for (const uuid of uuidArray) {
              if (typeof uuid !== 'string' || !validateUUID(uuid)) {
                throw new Errors.BadRequestError(`All items in ${key} must be valid UUIDs`);
              }
            }

            query[key] = uuidArray;
            break;
          }
          case 'enum':
          if (!rule.values || !Array.isArray(rule.values)) {
            throw new Error(`Validation rule for ${key} of type enum must specify a values array`);
          }
          if (!rule.values.includes(normalizedValue)) {
            throw new Errors.BadRequestError(
              `${key} must be one of: ${rule.values.join(', ')}`
            );
          }
          break;
          case 'array':
          if (!Array.isArray(normalizedValue)) {
            throw new Errors.BadRequestError(`${key} must be a valid array`);
          }
          break;
          case 'object':
          if (typeof normalizedValue !== 'object' || normalizedValue === null || Array.isArray(normalizedValue)) {
            throw new Errors.BadRequestError(`${key} must be a valid object`);
          }
          break;
        default:
          throw new Error(`Unknown validation type for parameter ${key}`);
      }
    }
  }
};

export const lengthsOfFields = {
  email: 80,
  name: 80,
  password: 80,
  poNumber: 45,
  firstName: 80,
  lastName: 80,
  productName: 45,
  description: 1000,
  cityName: 45,
  state: 45,
  streetAddress: 128,
  id: 45,
  title: 80,
  emailAddress: 80,
  minDay: 5,
  anyOtherNumber: 45,
  phoneNumber: 45,
  generic: 45
}
