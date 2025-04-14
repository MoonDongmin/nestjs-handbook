# Configuration

애플리케이션은 종종 서로 다른 환경에서 실행됨. 환경에 따라 다른 구성 설정을 사용해야 함.

ex. 일반적으로 로컬 환경에서는 로컬 DB 인스턴스, 프로덕션 환경에서는 별도의 DB 자격 증명 집합을 사용함.

<br>

**⭐ 환경 변수가 변경되므로 환경 변수를 환경에 저장하는 것이 좋음**

- 외부에서 정의된 환경 변수는 `process.env` 글로벌을 통해 Node.js 내부에서 볼 수 있음
- 환경 변수를 각 환경에서 개별적으로 설정하여 여러 환경의 문제를 해결할 수 있음
- 하지만 이는 특히 이러한 값을 쉽게 모의하거나 변경해야 하는 개발 및 테스트 환경에서는 매우 번거로움…

<br>

Node.js에서는 각 환경을 나타내기 위해 각 키가 특정 값을 나타내는 `키-값` 쌍을 포함하는 `.env` 파일을 사용하는 것이 일반적임.

- 다른 환경에서 실행하려면 올바른 `.env` 파일로 교체만 해주면 됨

<br>

**Nest에서 이 기술을 사용하는 좋은 방법은 적절한 `.env` 파일을 로드하는 `ConfigService`를 노출하는 `ConfigModule`을 만드는 것**

- 편의를 위해 Nest에서는 `@nestjs/config` 패키지를 기본으로 제공함

<br>

## Installation

```tsx
$ npm i --save @nestjs/config
```

<br>

## Getting started


설치가 완료되면 `ConfigModule`을 import 할 수 있음.

- 일반적으로 루트 `AppModule`로 import함
- `.forRoot()` 정적 메서드를 사용하여 동작을 제어함
- 이 단계에서는 환경 변수 키/값 쌍을 구문 분석하고 확인함.

<br>

```tsx
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [**ConfigModule.forRoot()**],
})
export class AppModule {}
```

**→ 기본 위치(프로젝트 루트)에서 `.env` 파일을 로드 및 구문 분석하고, `.env` 파일의 키/값 쌍을 `process.env`에 할당된 환경 변수와 병합하고, 그 결과를 `ConfigService`를 통해 액세스 할 수 있는 비공개 구조로 저장함**

→ `forRoot()`: 이러한 구문 분석/병합된 구성 변수를 읽기 위한 get() 메서드를 제공하는 ConfigService 공급자를 등록함


<br>

`nestjs/config`는 `dotenv`에 의존하기 때문에 환경 변수 이름의 충돌을 해결하기 위해 해당 패키지의 규칙을 사용함.

- **키가 런타임 환경의 변수(ex. `export DATABASE_USER = test`)와 `.env` 파일에 모두 존재하는 경우, 런타임 환경 변수가 우선**

<br>

## Custom env file path

기본적으로 패키지는 애플리케이션의 루트 디렉터리에서 `.env` 파일을 찾음

- `.env` 파일의 다른 경로를 지정하면 `forRoot()`에 전달하는 옵션 객체의 `envFilePath` 속성을 다음과 같이 설정함

```tsx
ConfigModule.forRoot({
  envFilePath: '.development.env',
});
```


<br>

`.env` 파일이 두 개 이상 있으면 다음과 같이 함

```tsx
ConfigModule.forRoot({
  envFilePath: ['.env.development.local', '.env.development'],
});
```


<br>

## Use module globally


다른 모듈에서 `ConfigModule`을 사용하려면 모든 Nest 모듈의 표준과 마찬가지로 이를 impor해야함.

<br>

**또는 아래와 같이 옵션 객체의 `isGlobal` 속성을 true로 설정하면 전역 모듈로 선언할 수 있음**

→ 이 경우 루트 모듈에 로드된 후에는 다른 모듈에서 `ConfigModule`을 임포트할 필요가 없음

```tsx
ConfigModule.forRoot({
  isGlobal: true,
});
```

<br>

## Using the ConfigService


`ConfigService`에서 구성 값에 액세스하려면 먼저 `ConfigService`를 주입해야함.

1. 해당 프로바이더를 포함하는 모듈인 `ConfigModule`을 이를 사용할 모듈로 임포트해야 함

```tsx
@Module({
  imports: [ConfigModule],
  // ...
})
```

<br>

2. 생성자 주입을 사용하여 주입할 수 있음

```tsx
constructor(private configService: ConfigService) {}
```

<br>

3. class에 사용

```tsx
const dbUser = this.configService.get<string>('DATABASE_USER');

const dbHost = this.configService.get<string>('database.host');
```

→ `configService.get()` 메서드를 사용하여 변수 이름을 전달하여 간단한 환경 변수를 가져옴
