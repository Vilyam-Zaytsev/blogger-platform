import {Container} from "inversify";
import {AuthController} from "./01-auth/auth-controller";
import {AuthService} from "./01-auth/application/auth-service";
import {SessionsService} from "./02-sessions/application/sessions-service";
import {SessionsRepository} from "./02-sessions/repositories/sessions-repository";
import {UsersQueryRepository} from "./03-users/repositoryes/users-query-repository";
import {BcryptService} from "./01-auth/adapters/bcrypt-service";
import {JwtService} from "./01-auth/adapters/jwt-service";
import {EmailTemplates} from "./01-auth/adapters/email-templates";
import {UsersService} from "./03-users/application/users-service";
import {UsersRepository} from "./03-users/repositoryes/users-repository";
import {SessionsController} from "./02-sessions/sessions-controller";
import {SessionsQueryRepository} from "./02-sessions/repositories/sessions-query-repository";
import {UsersController} from "./03-users/users-controller";
import {BlogsController} from "./04-blogs/blogs-controller";
import {BlogsService} from "./04-blogs/application/blogs-service";
import {BlogsRepository} from "./04-blogs/repositoryes/blogs-repository";
import {PostsService} from "./05-posts/application/posts-service";
import {PostsRepository} from "./05-posts/repositoryes/posts-repository";
import {PostsQueryRepository} from "./05-posts/repositoryes/posts-query-repository";
import {BlogsQueryRepository} from "./04-blogs/repositoryes/blogs-query-repository";
import {PostsController} from "./05-posts/posts-controller";
import {CommentsController} from "./06-comments/comments-controller";
import {CommentsService} from "./06-comments/application/comments-service";
import {CommentRepository} from "./06-comments/repositoryes/comment-repository";
import {CommentQueryRepository} from "./06-comments/repositoryes/comment-query-repository";
import {NodemailerService} from "./01-auth/adapters/nodemailer-service";
import {LikesRepository} from "./07-likes/repositoryes/likes-repository";

const container: Container = new Container();

container.bind(AuthController).to(AuthController);
container.bind(AuthService).to(AuthService);

container.bind(SessionsController).to(SessionsController);
container.bind(SessionsService).to(SessionsService);
container.bind(SessionsRepository).to(SessionsRepository);
container.bind(SessionsQueryRepository).to(SessionsQueryRepository);

container.bind(UsersController).to(UsersController);
container.bind(UsersService).to(UsersService);
container.bind(UsersRepository).to(UsersRepository);
container.bind(UsersQueryRepository).to(UsersQueryRepository);

container.bind(BlogsController).to(BlogsController);
container.bind(BlogsService).to(BlogsService);
container.bind(BlogsRepository).to(BlogsRepository);
container.bind(BlogsQueryRepository).to(BlogsQueryRepository);

container.bind(PostsController).to(PostsController);
container.bind(PostsService).to(PostsService);
container.bind(PostsRepository).to(PostsRepository);
container.bind(PostsQueryRepository).to(PostsQueryRepository);

container.bind(CommentsController).to(CommentsController);
container.bind(CommentsService).to(CommentsService);
container.bind(CommentRepository).to(CommentRepository);
container.bind(CommentQueryRepository).to(CommentQueryRepository);

container.bind(LikesRepository).to(LikesRepository);

container.bind(BcryptService).to(BcryptService);
container.bind(JwtService).to(JwtService);
container.bind(NodemailerService).to(NodemailerService);
container.bind(EmailTemplates).to(EmailTemplates);



export {container};