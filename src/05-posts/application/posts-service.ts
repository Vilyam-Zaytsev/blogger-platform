import {WithId} from "mongodb";
import {PostsRepository} from "../repositoryes/posts-repository";
import {BlogsRepository} from "../../04-blogs/repositoryes/blogs-repository";
import {injectable} from "inversify";
import {PostDto} from "../domain/post-dto";
import {Post, PostDocument, PostInputModel, PostModel} from "../domain/post-entity";
import {LikeDocument, LikeModel, LikeStatus} from "../../07-likes/like-entity";
import {ResultType} from "../../common/types/result-types/result-type";
import {NotFoundResult, SuccessResult} from "../../common/helpers/result-object";
import {LikesRepository} from "../../07-likes/repositoryes/likes-repository";

@injectable()
class PostsService {

    constructor(
        private blogsRepository: BlogsRepository,
        private postsRepository: PostsRepository,
        private likeRepository: LikesRepository
    ) {};

    async findPost(id: string): Promise<WithId<Post> | null> {

        return await this.postsRepository
            .findPost(id);
    }

    async createPost(postDto: PostDto): Promise<string> {

        const {blogId} = postDto;

        const blogName: string = (await this.blogsRepository.findBlog(blogId))!.name

        const postDocument: PostDocument = PostModel.createPost(postDto, blogName);

        return await this.postsRepository
            .savePost(postDocument);
    }

    async updatePost(id: string, data: PostInputModel): Promise<boolean> {

        return await this.postsRepository
            .updatePost(id, data);
    }

    async updatePostReaction(
        postId: string,
        userId: string,
        reaction: LikeStatus
    ): Promise<ResultType> {

        const postDocument: PostDocument | null = await this.postsRepository
            .findPost(postId);

        if (!postDocument) {

            return NotFoundResult
                .create(
                    'postId',
                    'Post not found.',
                    'Failed to update user\'s reaction to the post.'
                );
        }

        let likeDocument: LikeDocument | null = await this.likeRepository
            .findLikeByUserIdAndParentId(userId, postId);

        const currentReaction: LikeStatus | null = likeDocument
            ? likeDocument.status
            : null;

        if (!currentReaction) {

            likeDocument = LikeModel
                .createLike(
                    reaction,
                    userId,
                    postId
                );

            await this.likeRepository
                .saveLike(likeDocument!);
        }

        if (reaction === LikeStatus.None) {

            postDocument
                .updateReactionsCount(reaction, currentReaction);

            await this.postsRepository
                .savePost(postDocument);

            await this.likeRepository
                .deleteLike(String(likeDocument!._id));

            return SuccessResult
                .create(null);
        }

        postDocument
            .updateReactionsCount(reaction, currentReaction);

        await this.postsRepository
            .savePost(postDocument);

        likeDocument!.status = reaction;

        await this.likeRepository
            .saveLike(likeDocument!);

        return SuccessResult
            .create(null);
    }

    async deletePost(id: string): Promise<boolean> {

        return await this.postsRepository
            .deletePost(id);
    }
}

export {PostsService};