export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

export abstract class BaseUseCase<TRequest, TResponse>
  implements IUseCase<TRequest, TResponse>
{
  abstract execute(request: TRequest): Promise<TResponse>;
}
