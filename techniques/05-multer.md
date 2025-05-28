NestJS에서 사진을 업로드하는 방법에 대해서 알아보자.

NestJS에서는 **Multer**라는 라이브러리를 활용해서 사진을 업로드하는 방식을 선호하고 있다.

<br>

## Multer 설치하기
```bash
pnpm i multer @types/multer 
```

그리고 이미지의 사진들을 관리하기 위해서 uuid도 함께 설치하면 좋다.

<br>

```bash
pnpm i uuid @types/uuid 
```

<br>

## Multer 세팅하기


나는 게시물을 생성할 때 사진을 같이 업로드할 수 있도록 프로젝트를 만들었다.

프로젝트에서는 TypeORM을 사용해서 만들었고, 게시물을 만들 때 사진이 있어도 되고, 없어도 된다는 조건을 위해 `?`를 활용하여 설정해 주었다.

`posts.entity.ts`

```tsx
@Entity()
export class PostsModel extends BaseModel {
	...

  @Column({
    nullable: true,
  })
  image?: string;

  ...
}
```

<br>

이미지의 타입이 `string`인 이유?

→ 이미지는 우리가 저장하는 데이터베이스에 넣게 되면 용량이 너무 많이 듬…

→ 그래서 이미지를 로컬에 저장하고 거기에 대한 경로를 제시해주기 때문에 string 값을 넣는다고 보면 됨

<br>

그리고 Multer를 사용하기 위해서 필요로하는 모듈에가서 `import`를 해줘야 한다.

`posts.module.ts`

```tsx
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    ...
    **MulterModule.register({
      limits: {
        fieldSize: 10000000,
      },
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname);

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          return callback(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다.'),
            false,
          );
        }
        return callback(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, res, callback) {
          callback(null, POST_IMAGE_PATH);
        },
        filename: function (req, file, callback) {
          callback(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
  ],**
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
```

`MulterModule.register()` 를 통해서 등록을 해주고 옵션을 통해서 설정을 해줘야함.

- `limits` : 파일 크기를 제한한다.
    - `fieldSize`: 바이트 단위를 사용
- `fileFilter` : 확장자를 지정한다.
- `callback(에러, boolean)` : 콜백은 다음과 같은 매개변수가 들어감
    - 첫 번째: 에러가 있을 경우 에러 정보를 넣어줌
    - 두 번째: 파일을 다운 받을지 말지 boolean 값을 넣어줌
- `storage` : 어디 경로에다가 파일을 저장할지 정함
    - `destination` : 어느 경로에 파일을 저장할지
    - `filename`: 어떤 이름으로 파일을 저장할지

위 파일이름을 저장할 때 uuid를 활용하여 저장을 함.

<br>

## 파일 경로 설정하기

파일 경로를 설정하기 위해서 따로 파일을 하나 만들어서 관리하는 것이 편함

`path.const.ts`

```tsx
import { join } from 'path';
// 현재 폴더 root 파일의 위치 이름
export const PROJECT_ROOT_PATH = process.cwd();

// 외부에서 접근 가능한 파일들을 모아둔 폴더 이름
export const PUBLIC_FOLDER_NAME = 'public';

// 포스트 이미지들을 저장할 폴더 이름
export const POST_FOLDER_NAME = 'posts';

// 실제 공개폴더의 절대 경로
// /{프로젝트의 위치}/public
export const PUBLIC_FOLDER_PATH = join(PROJECT_ROOT_PATH, PUBLIC_FOLDER_NAME);

// 포스트 이미지를 저장할 폴더
export const POST_IMAGE_PATH = join(PUBLIC_FOLDER_PATH, POST_FOLDER_NAME);

// 절대경로x
// /public/posts/xxx.jpg
export const POST_PUBLIC_IMAGE_PATH = join(
  PUBLIC_FOLDER_NAME,
  POST_FOLDER_NAME,
);
```

<br>

## FileInterceptor 적용하기

이제 파일을 Post 하기 위해서는 `@UseInterceptors()` 를 활용해야 한다.

`posts.service.ts`

```tsx
  @Post()
  @UseGuards(AccessTokenGuard)
  **@UseInterceptors(FileInterceptor('image'))**
  postPosts(
    @User('id') userId: number,
    @Body() body: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.postsService.createPost(userId, body, file?.filename);
  }
```

→ body로 파일을 받을 때 image로 받겠다라는 코드

이렇게 하면 파일이 일단 등록이 됨.

<br>

## Static File Serving 옵션 추가하기

Static File Serving을 하는 이유는 업로드된 파일을 다른 사용자나 본인이 다시 볼 수 있도록 하기 위해서 사용한다고 생각면 쉽다.

- **즉, 업로드된 파일에 접근할 때 URL을 만들어주기 위함**

<br>

### Static File Serving 설치하기

```bash
pnpm i @nestjs/serve-static
```

<br>

### Static File Serving 등록하기

`app.module.ts`

```tsx
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ...
    **ServeStaticModule.forRoot({
      // uuid.jpg
      // http://localhost:3000/public/posts/uuid.jpg
      // http://localhost:3000/posts/uuid.jpg
      rootPath: PUBLIC_FOLDER_PATH,
      serveRoot: '/public',
    }),**
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
```

- `rootPath`: 실제 서버 파일 경로
- `serveRoot`: 클라이언트가 접근할 때 사용할 URL Prefix

<br>

## Class Transformer 이용해서 URL에 prefix 추가하기

추가로 TypeORM을 사용하고 있다면 Class Transformer를 사용해서 URL의 prefix를 추가할 수 있다.

`posts.entity.ts`

```tsx
@Entity()
export class PostsModel extends BaseModel {
	...
  **@Column({
    nullable: true,
  })
  @Transform(({ value }) => value && `/${join(POST_PUBLIC_IMAGE_PATH, value)}`)
  image?: string;**
	...
}

```

다음과 같이 `@Transform()`을 사용하여 JSON으로 변환할 때, 해당 필트의 값을 가공해준다.

- 이는 DB에는 ….jpg만 저장되어도, API 응답에는 `image: /images/posts/…jpg`로 자동 변환이 된다.
