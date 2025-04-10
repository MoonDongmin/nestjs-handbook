import {
    Controller,
    Get,
    Post,
    Body,
    HttpException,
    HttpStatus,
    UseFilters,
}                            from "@nestjs/common";
import {CreateCatDto}        from "./dto/create-cat.dto";
import {CatsService}         from "./cats.service";
import {Cat}                 from "./interfaces/cat.interface";
import {ForbiddenException}  from "../exception/forbidden.exception";
import {HttpExceptionFilter} from "../exception/http-exception.filter";

@Controller("cats")
export class CatsController {
    constructor(private catsService: CatsService) {
    }

    @Post()
    @UseFilters(new HttpExceptionFilter())
    async create(@Body() createCatDto: CreateCatDto) {
        throw new ForbiddenException();
    }

    @Get()
    async findAll(): Promise<Cat[]> {
        throw new ForbiddenException();
    }
}
