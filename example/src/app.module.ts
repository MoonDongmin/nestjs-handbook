import {Module}         from "@nestjs/common";
import {CatsController} from "./cats/cats.controller";
import {CatsModule}     from "./cats/cats.module";
import {CatsService}    from "./cats/cats.service";
import {ConfigModule}   from "@nestjs/config";

@Module({
    imports: [
        CatsModule,
        ConfigModule.forRoot({
            envFilePath: ".env",
        }),
    ],
    controllers: [
        CatsController,
    ],
    providers: [
        CatsService,
    ],
})
export class AppModule {
}
