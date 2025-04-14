import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
}                   from "@nestjs/common";
import {
    map,
    Observable,
} from "rxjs";

@Injectable()
export class ExcludeNullInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        return next
            .handle()
            .pipe(map(value => value === null ? "" : value));
    }
}
