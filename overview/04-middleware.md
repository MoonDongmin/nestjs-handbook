> **미들웨어는 라우트 핸들러 앞에 호출되는 함수.**
>
- 미들웨어 함수는 애플리케이션의 요청-응답 주기에서 요청 및 응답 객체와 `next()` 미들웨어 함수에 액세스할 수 있음.
- next 미들웨어 함수는 일반적으로 next라는 변수로 표시됩니다.

![img_5.png](image/img_5.png)

<br>

Nest의 미들웨어는 express 미들웨워와 동일함

<aside>
💡

미들웨어 함수가 하는 일

- **코드를 실행**
- **요청 및 응답 객체를 변경**
- **요청-응답 사이클을 종료**
- **스택에서 다음 미들웨어 함수를 호출함**
- **현재 미들웨어 함수가 요청-응답 사이클을 종료하지 않으면 다음 미들웨어 함수로 제어권을 넘기기 위해 `next()`를 호출해야 함. 그렇지 않으면 요청이 중단된 상태로 유지됨.**
</aside>

<br>


**함수 또는 `@Injectable()` 데코레이터를 사용하여 클래스에서 사용자 정의 Nest 미들웨어를 구현할 수 있음**

- 클래스는 `NestMiddleware` 인터페이스를 구현해야 함

<br>


간단한 미들웨어 구현을 해보자

`logger.middleware.ts`

```tsx
import {
    Injectable,
    NestMiddleware,
}                     from "@nestjs/common";
import {NextFunction} from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log("Request...");
        next();
    }
}
```

<br>


## Dependency injection


Nest 미들웨어는 의존성 주입을 완벽하게 지원함.

- 프로바이더 및 컨트롤러와 마찬가지로 동일한 모듈 내에서 사용할 수 있는 종속성을 주입할 수 있음.
- 평소와 마찬가지로 생성자를 통해 수행됨

## Applying middlware


`@Module()` 데코레이터에는 미들웨어를 위한 자리가 없음.

**→ 대신 모듈 클래스의 `configure()` 메서드를 사용하여 설정함.**

→ 미들웨어를 포함하는 모듈은 `NestModule` 인터페이스를 구현해야 합니다.

<br>


`AppModule` 수준에서 `LoggerMiddleware`를 설정해 보겠습니다.

`app.module.ts`

```tsx
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
```

<br>


**또한 미들웨어를 구성할 때 경로 경로와 요청 메서드가 포함된 객체를 `forRoutes()` 메서드에 전달하여 미들웨어를 특정 요청 메서드로 제한할 수도 있음**.

아래 예제에서는 원하는 요청 메서드 유형을 참조하기 위해 `RequestMethod` 열거형을 가져온 것을 볼 수 있음

```tsx
import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      **.forRoutes({ path: 'cats', method: RequestMethod.GET });**
  }
}
```

<br>


## Middleware consumer


`MiddlewareConsumer`는 헬퍼 클래스임. 미들웨어를 관리하기 위한 몇 가지 내장 메서드를 제공함.

- 이 모든 메서드는 유창한 스타일로 간단히 연결할 수 있음
- forRoutes() 메서드는 단일 문자열, 여러 문자열, RouteInfo 객체, 컨트롤러 클래스, 심지어 여러 컨트롤러 클래스를 받을 수 있음.
- 대부분의 경우 쉼표로 구분된 컨트롤러 목록을 전달할 것.

<br>


아래는 단일 컨트롤러를 사용한 예제

```tsx
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { CatsModule } from './cats/cats.module';
import { CatsController } from './cats/cats.controller';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes(CatsController);
  }
}
```

<br>


## Multiple middleware


**순차적으로 실행되는 여러 미들웨어를 바인딩하려면 `apply()` 메서드 안에 쉼표로 구분된 목록을 제공하면 됨**

```tsx
consumer.**apply(cors(), helmet(), logger)**.forRoutes(CatsController);
```

<br>


## Global middleware


**등록된 모든 경로에 미들웨어를 한 번에 바인딩하려면 `INestApplication` 인스턴스에서 제공하는 `use()` 메서드를 사용할 수 있음**

```tsx
import {NestFactory}      from "@nestjs/core";
import {AppModule}        from "./app.module";
import {LoggerMiddleware} from "./middleware/logger.middleware";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(LoggerMiddleware);
    await app.listen(3000);
}

bootstrap();
```
