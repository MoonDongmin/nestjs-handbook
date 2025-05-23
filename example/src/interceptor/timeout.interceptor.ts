import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    RequestTimeoutException,
} from "@nestjs/common";
import {
    catchError,
    Observable,
    throwError,
    timeout,
} from "rxjs";

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        return next
            .handle()
            .pipe(
                timeout(5000),
                catchError(err => {
                    if (err instanceof TimeoutInterceptor) {
                        return throwError(() => new RequestTimeoutException());
                    }
                    return throwError(() => err);
                }),
            );
    }
}
