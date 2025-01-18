import {BlogDbType} from "../../src/03-blogs/types/blog-db-type";
import {PostDbType} from "../../src/04-posts/types/post-db-type";
import {UserDbType} from "../../src/02-users/types/user-db-type";
import {UserInputModel} from "../../src/02-users/types/input-output-types";
import {BlogInputModel} from "../../src/03-blogs/types/input-output-types";
import {PostInputModel} from "../../src/04-posts/types/input-output-types";
import {CommentInputModel} from "../../src/05-comments/types/input-output-types";

const blog: BlogDbType = {
    name: 'BLOG',
    description: 'DESCRIPTION',
    websiteUrl: 'https://blogs.com',
    createdAt: new Date().toISOString(),
    isMembership: false
} as const;

const post: PostDbType = {
    title: 'POST',
    shortDescription: 'SHORT_DESCRIPTION_POST',
    content: 'CONTENT_POST',
    blogId: '',
    blogName: blog.name,
    createdAt: new Date().toISOString(),
} as const;

const user: UserDbType = {
    login: 'user',
    email: '@example.com',
    passwordHash: 'hash',
    createdAt: new Date().toISOString(),
} as const;

const clearPresets = () => {
    presets.users = [];
    presets.blogs = [];
    presets.posts = [];
    presets.comments = [];
};

    type PresetsType = {
    users: UserInputModel[],
    blogs: BlogInputModel[],
    posts: PostInputModel[],
    comments: CommentInputModel[]
};

const presets: PresetsType = {
    users: [],
    blogs: [],
    posts: [],
    comments: []
};

const usersLogins = [
    'robert85', 'anna404', 'chris34', 'megan574', 'laura464',
    'robert186', 'james932', 'laura774', 'daniel281', 'george545',
    'john232'
] as const;


const incorrectAccessToken: string = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nzg2NjQxNmU0M2Y5MzM1NjlmYjllMmIiLCJpYXQiOjE3MzY4NjA2OTQsImV4cCI6MTczNzAzMzQ5NH0.YSZz3-eZv0lJeqKhpBjq0TUcAt2FGUiI1bh0aBqgNbY` as const;

export {
    blog,
    post,
    user,
    presets,
    usersLogins,
    clearPresets,
    incorrectAccessToken
};