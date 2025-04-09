import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Success',
        data,
      })),
      catchError((err) => {
        const error = err as Error;
        const status =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const response =
          error instanceof HttpException ? error.getResponse() : null;

        let message: string | string[] = 'Internal Server Error';

        if (
          response &&
          typeof response === 'object' &&
          'message' in response &&
          (Array.isArray((response as Record<string, string>).message) ||
            typeof (response as Record<string, string>).message === 'string')
        ) {
          message = (response as Record<string, string>).message;
        } else if (error.message) {
          message = error.message;
        }

        return throwError(
          () =>
            new HttpException(
              { success: false, statusCode: status, message },
              status,
            ),
        );
      }),
    );
  }
}
