import {Module}         from "@nestjs/common";
import {CatsController} from "./cats/cats.controller";
import {CatsModule}     from "./cats/cats.module";
import {CatsService}    from "./cats/cats.service";

@Module({
    imports: [CatsModule],
    controllers: [CatsController],
    providers: [CatsService],
})
export class AppModule {
}
