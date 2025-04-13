# Guards
 
> **가드는 `@Injectable()` 데코레이터로 주석이 달린 클래스로, `CanActivate` 인터페이스를 구현함**
>

<br>

![img_8.png](image/img_8.png)


**가드는 단일 책임이 있음**

- 런타임에 존재한느 특정 조건에 따라 특정 요청이 라우트 핸들러에 의해 처리될지 여부를 결정함. → **권한 부여**라고도 함
- 권한 부여는 일반적으로 기존 Express 애플리케이션의 미들웨어에서 처리해 왔음.
- 토큰 유효성 검사 및 요청 객체에 속성 첨부 등의 작업은 특정 경로 컨텍스트와 밀접하게 연결되어 있지 않으므로 미들웨어는 인증에 적합한 선택임

**하지만 미들웨어는 본질적으로 멍청함**

**→ `next()` 함수를 호출한 후 어떤 핸들러가 실행될지 모르기 때문**

<br>

**하지만 가드는 `ExecutionContext` 인스턴스에 액세스할 수 있으므로 다음에 실행될 내용을 정확히 알 수 있음**

- 예외 필터, 파이프, 인터셉터와 마찬가지로 요청/응답 주기의 정확한 지점에 처리 로직을 삽입할 수 있도록 설계되어 있으며 선언적으로 처리할 수 있음
- 따라서 코드를 간결하고 선언적으로 유지하는 데 도움이 됨

<br>

> **가드는 미들웨어 이후에 처리되지만, 인터셉터나 파이프보다 먼저 실행됨**
>

<br>

## Authorization guard


**권한 부여는 호출자에게 충분한 권한이 있는 경우에만 특정 경로를 사용할 수 있어야 하므로 가드에 매우 유용한 사례임**

<br>

다음 `AuthGuard`는 인증된 사용자(토큰이 요청 헤더에 첨부)를 가정함

- 토큰을 추출하여 유효성을 검사하고 추출된 정보를 사용하여 요청을 진행할 수 있는지 여부를 결정함

```tsx
import {
    CanActivate,
    ExecutionContext,
    Injectable,
}                   from "@nestjs/common";
import {Observable} from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        return validateRequest(request);
    }
}
```

<br>

`vlidateRequest()` 함수 내부의 로직은 필요에 따라 간단하거나 정교하게 만들 수 있음

- 위 예제의 요점은 가드가 요청/응답 주기에 어떻게 들어맞는지 보여주는 것

<br>

**모든 가드는 `canActivate()` 함수를 구현해야 함. 이 함수는 현재 요청이 허용되는지 여부를 나타내는 boolean을 반환해야 함**

- 응답을 동기식 또는 비동기식으로 반환할 수 있음
- 반환값이 참이면 요청이 처리, 거짓이면 Nest는 요청을 거부함

## Role-based authentication

특정 역할을 가진 사용자에게만 액세스를 허용하는 보다 기능적인 가드를 구축할 수 있음.

```tsx
import {
    CanActivate,
    ExecutionContext,
    Injectable,
}                   from "@nestjs/common";
import {Observable} from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        return true;
    }
}
```

<br>

## Setting roles per handler


`RolesGuard`가 작동하고 있지 않지만 그다지 똑똑하지 않음…

**→ 실행 컨텍스트를 아직 활용하지 못하고 있음.**

→ 아직 역할이나 각 핸들러에 허용되는 역할에 대해 알지 못함

<br>

ex. `CatsContorller`는 경로마다 다른 권한 체계를 가질 수 있음

- 일부는 관리자 사용자
- 다른 일부는 모든 사용자

어떻게 역할을 경로에 일치시킬 수 있을까??

<br>

⭐ 여기서 사용자 정의 메타데이터가 중요한 역하을 함.

- Nest는 `Reflector.createDecorator` 정적 메서드를 통해 생성된 데코레이터 또는 내장된 `@SetMetadata()` 데코레이터를 통해 라우트 핸들러에 사용자 정의 메타데이터를 첨부할 수 있는 기능을 제공함

<br>

ex. 메타데이터를 핸들러에 첨부하는 `Reflector.createDecorator` 메서드를 이용하여 `@Roles()` 데코레이터를 생성해보자

`roles.decorator.ts`

```tsx
import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();
```

→ 여기서 `Roles` 데코레이터는 `string[]` 타입의 단일 인수를 받음

<br>

이제 이 데코레이터를 사용하려면 핸들러에 주석을 달면 됨

`cats.controller.ts`

```tsx
@Post()
**@Roles(['admin'])**
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

<br>

이제 돌아가서 `RolesGuard`와 연결해보자.

- 현재 사용자에게 할당된 역할과 현재 처리 중인 경로에 필요한 실제 역할을 비교하여 반환 값을 조건부로 만들고 싶음
- 경로의 역할에 액세스하기 위해 다음과 같이 Reflector 헬퍼 클래스를 다시 사용함

`roles.guard.ts`

```tsx
import {
    CanActivate,
    ExecutionContext,
    Injectable,
}                   from "@nestjs/common";
import {Observable} from "rxjs";
import {Reflector}  from "@nestjs/core";
import {Roles}      from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
    ) {
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.get(Roles, context.getHandler);
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return this.matchRoles(roles, user.roles);
    }

    private matchRoles(roles: any, roles2: any) {
        return undefined;
    }
}

```

<br>

## Binding guards


가드는 파이프 및 예외 필터와 마찬가지로 컨트롤러 범위, 메서드 범위 또는 전역 범위로 지정할 수 있음.

<br>

밑의 예제에서는 `@UseGuards()` 데코레이터를 사용하여 컨트롤러 범위 가드를 설정함.

- 이 데코레이터는 단일 인수를 받거나 쉼표로 구분된 인수의 목록을 받을 수 있음
- 이를 통해 하나의 선언으로 적절한 가드 집합을 쉽게 적용할 수 있음

```tsx
@Controller('cats')
**@UseGuards(RolesGuard)**
export class CatsController {}
```

→ `RolesGuard` 클래스를 전달하여 인스턴스화에 대한 책임을 프레임워크에 맡기고 의존성 주입을 활성화함.

<br>

파이프 및 예외 필터와 마찬가지로 in-place 인스턴스를 전달할 수도 있음

```tsx
@Controller('cats')
**@UseGuards(new RolesGuard())**
export class CatsController {}
```

<br>

전역으로 가드를 설정하려면 Nest 애플리케이션 인스턴스의 `userGlobalGuards()` 메서드를 이용

```tsx
const app = await NestFactory.create(AppModule);
app.useGlobalGuards(new RolesGuard());
```
