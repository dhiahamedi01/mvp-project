import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    private notificationService: NotificationService,
  ) {}

  async create(createPostDto: CreatePostDto, userId?: number, isAdmin?: boolean): Promise<Post> {
    const post = this.postRepository.create(createPostDto);
    const savedPost = await this.postRepository.save(post);
    
    // Send notification to non-admin users when admin creates a post with sendNotification = true
    if (isAdmin && savedPost.sendNotification) {
      await this.notificationService.notifyPostCreated(
        savedPost.id,
        savedPost.title,
      );
    }
    
    return savedPost;
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByAuthor(authorId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { authorId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, adminId?: number): Promise<Post> {
    const post = await this.findOne(id);
    
    // Only the author can update the post
    if (post.authorId !== adminId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    await this.postRepository.update(id, updatePostDto);
    return this.findOne(id);
  }

  async remove(id: number, adminId?: number): Promise<void> {
    const post = await this.findOne(id);
    
    // Only the author can delete the post
    if (post.authorId !== adminId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
  }
}