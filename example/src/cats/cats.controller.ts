import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    ParseIntPipe,
    UseInterceptors,
}                            from "@nestjs/common";
import {CreateCatDto}        from "./dto/create-cat.dto";
import {CatsService}         from "./cats.service";
import {Cat}                 from "./interfaces/cat.interface";
import {ValidationPipe}      from "../pipe/validation.pipe";
import {Roles}               from "../guard/roles.decorator";
import {TransformInterceptor} from "../interceptor/transform.interceptor";

@UseInterceptors(TransformInterceptor)
@Controller("cats")
export class CatsController {
    constructor(private catsService: CatsService) {
    }

    @Post()
    @Roles(["admin"])
    async create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
    }

    @Get()
    async findAll(): Promise<Cat[]> {
        return this.catsService.findAll();
        // throw new ForbiddenException();

    }

    @Get(":id")
    async findOne(@Param("id", ParseIntPipe) id: number) {
        return this.catsService.findOne(id);
    }
}
