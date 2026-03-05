import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsPost } from './entities/cms-post.entity';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CmsPost])],
  providers: [CmsService],
  controllers: [CmsController],
})
export class CmsModule {}
