import {
    Controller,
    Get,
    Post,
    Body,
    HttpException,
    HttpStatus,
    UseFilters,
    Param,
    ParseIntPipe,
}                            from "@nestjs/common";
import {CreateCatDto}        from "./dto/create-cat.dto";
import {CatsService}         from "./cats.service";
import {Cat}                 from "./interfaces/cat.interface";
import {ForbiddenException}  from "../exception/forbidden.exception";
import {HttpExceptionFilter} from "../exception/http-exception.filter";
import {ValidationPipe}      from "../pipe/validation.pipe";

@Controller("cats")
export class CatsController {
    constructor(private catsService: CatsService) {
    }

    @Post()
    @UseFilters(new HttpExceptionFilter())
    async create(@Body(new ValidationPipe()) createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
    }

    @Get()
    async findAll(): Promise<Cat[]> {
        throw new ForbiddenException();
    }

    @Get(":id")
    async findOne(@Param("id", ParseIntPipe) id: number) {
        return this.catsService.findOne(id);
    }
}
