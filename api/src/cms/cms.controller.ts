import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreateCmsPostDto, UpdateCmsPostDto } from './dto/cms-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('posts')
  findAll() {
    return this.cmsService.findAll();
  }

  @Get('posts/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cmsService.findOne(id);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() dto: CreateCmsPostDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.cmsService.create(dto, req.user.id);
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCmsPostDto,
  ) {
    return this.cmsService.update(id, dto);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cmsService.remove(id);
  }
}
