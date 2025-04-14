# Custom decorators
Nest는 데코레이터라는 언어 기능을 중심으로 구축됨.

- 데코레이터는 일반적으로 사용되는 많은 프로그래밍 언어에서 잘 알려진 개념이지만 JS 세계에서는 아직 비교적 생소한 개념

간단한 정의

<aside>


ES2016 데코레이터는 함수를 반환하고 대상, 이름 및 속성 설명자를 인수로 받을 수 있는 표현식. 데코레이터 앞에 `@` 문자를 붙이고 데코레이터를 적용하려는 대상의 맨 위에 배치하면 됨. 데코레이터는 클래스, 메서드 또는 프로퍼티에 대해 정의할 수 있음

</aside>

## Param decorators


Nest는 HTTP 경로 핸들러와 함께 사용할 수 있는 유용한 매개변수 데코레이터 세트를 제공함.

<br>

다음은 제공된 데코레이터와 이들이 나타내는 일반 Express(또는 Fastify) 객체 목록임

| `@Request(), @Req()` | `req` |
| --- | --- |
| `@Response(), @Res()` | `res` |
| `@Next()` | `next` |
| `@Session()` | `req.session` |
| `@Param(param?: string)` | `req.params` / `req.params[param]` |
| `@Body(param?: string)` | `req.body` / `req.body[param]` |
| `@Query(param?: string)` | `req.query` / `req.query[param]` |
| `@Headers(param?: string)` | `req.headers` / `req.headers[param]` |
| `@Ip()` | `req.ip` |
| `@HostParam()` | `req.hosts` |

<br>

**또한 사용자 지정 데코레이터를 만들 수 있음**

Node.js에서는 요청 객체에 속성을 첨부하는 것이 일반적인 관행임.

<br>

그런 다음 다음과 같은 코드를 사용하여 각 경로 핸들러에서 프로퍼티를 수동으로 추출함

```tsx
const user = req.user;
```

<br>

**하지만 Nest에서는 코드를 더 읽기 쉽고 투명하게 만들기 위해 `@User()` 데코레이터를 만들어 모든 컨트롤러에서 재사용할 수 있음**

```tsx
import {
    createParamDecorator,
    ExecutionContext,
} from "@nestjs/common";

export const user = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
```

그런 다음 요구 사항에 맞는 곳에서 간단히 사용할 수 있음

```tsx
@Get()
async findOne(@User() user: UserEntity) {
  console.log(user);
}
```

<br>

## Passing data


데코레이터의 동작이 특정 조건에 따라 달라지는 경우 데이터 매개변수를 사용하여 데코레이터의 팩토리 함수에 인수를 전달할 수 있음. 이에 대한 한가지 사용 사례는 키별로 요청 개체에서 속성을 추출하는 사용자 정의 데코레이터임.

<br>

ex. 인증 계층이 요청의 유효성을 검사하고 사용자 엔티티를 요청 개체제 첨부한다고 가정.

그럼 인증된 요청의 사용자 엔티티는 다음과 같음

```tsx
{
  "id": 101,
  "firstName": "Alan",
  "lastName": "Turing",
  "email": "alan@email.com",
  "roles": ["admin"]
}
```

<br>

**프로퍼티 이름을 키로 사용하고, 프로퍼티가 존재하면 관련 값을 반환하는 데코레이터를 정의**

`user.decorator.ts`

```tsx
import {
    createParamDecorator,
    ExecutionContext,
} from "@nestjs/common";

export const user = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);
```

<br>

컨트롤러의 `@User()` 데코레이터를 통해 특정 프로퍼티에 액세스하는 방법은 다음과 같음

```tsx
@Get()
async findOne(@User('firstName') firstName: string) {
  console.log(`Hello ${firstName}`);
}
```

동일한 데코레이터를 다른 키와 함께 사용하여 다른 프로퍼티에 액세스 할 수 있음.

**→ 사용자가 객체가 깊거나 복잡한 경우 요청 핸들러를 더 쉽고 가독성 있게 구현할 수 있음**
