import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger';

// Decorator para Create
export const ApiCreateOperation = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiCreatedResponse({
      description: 'Resource successfully created',
      type: model,
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
    }),
  );
};

// Decorator para Get One
export const ApiGetOperation = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: 'Resource retrieved successfully',
      type: model,
    }),
    ApiNotFoundResponse({
      description: 'Resource not found',
    }),
  );
};

// Decorator para List
export const ApiListOperation = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: 'Resources retrieved successfully',
      type: model,
    }),
  );
};

// Decorator para Update
export const ApiUpdateOperation = <TModel extends Type<any>>(
  model: TModel,
  summary: string,
) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiOkResponse({
      description: 'Resource updated successfully',
      type: model,
    }),
    ApiNotFoundResponse({
      description: 'Resource not found',
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
    }),
  );
};

// Decorator para Delete
export const ApiDeleteOperation = (summary: string) => {
  return applyDecorators(
    ApiOperation({ summary }),
    ApiNoContentResponse({
      description: 'Resource deleted successfully',
    }),
    ApiNotFoundResponse({
      description: 'Resource not found',
    }),
  );
};
