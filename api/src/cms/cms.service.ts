import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsPost } from './entities/cms-post.entity';
import { CreateCmsPostDto, UpdateCmsPostDto } from './dto/cms-post.dto';

@Injectable()
export class CmsService {
  /**
   * Service for CMS post CRUD operations.
   */
  constructor(
    @InjectRepository(CmsPost)
    private readonly repo: Repository<CmsPost>,
  ) {}

  /**
   * List all CMS posts ordered by creation date descending.
   *
   * Returns:
   *   Promise<CmsPost[]>: Array of posts with author relation.
   */
  async findAll(): Promise<CmsPost[]> {
    return this.repo.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a single CMS post by ID.
   *
   * Args:
   *   id (string): UUID of the post.
   *
   * Returns:
   *   Promise<CmsPost>: The found post.
   */
  async findOne(id: string): Promise<CmsPost> {
    const post = await this.repo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('CMS post not found');
    return post;
  }

  /**
   * Create a new CMS post.
   *
   * Args:
   *   dto (CreateCmsPostDto): Post data.
   *   authorId (string): ID of the creating user.
   *
   * Returns:
   *   Promise<CmsPost>: The created post.
   */
  async create(dto: CreateCmsPostDto, authorId: string): Promise<CmsPost> {
    const post = this.repo.create({ ...dto, authorId });
    return this.repo.save(post);
  }

  /**
   * Update an existing CMS post.
   *
   * Args:
   *   id (string): UUID of the post.
   *   dto (UpdateCmsPostDto): Fields to update.
   *
   * Returns:
   *   Promise<CmsPost>: The updated post.
   */
  async update(id: string, dto: UpdateCmsPostDto): Promise<CmsPost> {
    const post = await this.findOne(id);
    Object.assign(post, dto);
    return this.repo.save(post);
  }

  /**
   * Delete a CMS post.
   *
   * Args:
   *   id (string): UUID of the post.
   *
   * Returns:
   *   Promise<void>
   */
  async remove(id: string): Promise<void> {
    const post = await this.findOne(id);
    await this.repo.remove(post);
  }
}
