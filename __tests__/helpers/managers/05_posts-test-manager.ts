import {Response} from "supertest";
import {blogNames, postContents, postShortDescriptions, postTitles, presets} from "../datasets-for-tests";
import {encodingAdminDataInBase64, req} from "../test-helpers";
import {SETTINGS} from "../../../src/common/settings";
import {Paginator} from "../../../src/common/types/input-output-types/pagination-sort-types";
import {SortDirection} from "../../../src/common/helpers/sort-query-dto";
import {LikeStatus} from "../../../src/07-likes/like-entity";
import {PostInputModel, PostViewModel} from "../../../src/05-posts/domain/post-entity";

const postsTestManager = {

    async createPost(numberOfPosts: number) {

        const responses: Response[] = [];

        for (let i = 0; i < numberOfPosts; i++) {

            const post: PostInputModel = {
                title: postTitles[i],
                shortDescription: postShortDescriptions[i],
                content: postContents[i],
                blogId: presets.blogs[0].id
            }

            const res: Response = await req
                .post(SETTINGS.PATH.POSTS)
                .send(post)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    ))
                .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

            expect(res.body).toEqual({
                id: expect.any(String),
                title: postTitles[i],
                shortDescription: postShortDescriptions[i],
                content: postContents[i],
                blogId: presets.blogs[0].id,
                blogName: blogNames[0],
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: LikeStatus.None,
                    newestLikes: []
                },
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            presets.posts.push(res.body);

            responses.push(res);
        }


        return responses;
    },

    async getPosts(accessToken?: string): Promise<Paginator<PostViewModel>> {

        let request = req.get(`${SETTINGS.PATH.POSTS}`);

        if (accessToken) {
            request = request.set('Authorization', `Bearer ${accessToken}`);
        }

        const res = await request.expect(SETTINGS.HTTP_STATUSES.OK_200);

        return res.body;
    },

    async getPost(id: string, accessToken?: string): Promise<PostViewModel> {

        let request = req.get(`${SETTINGS.PATH.POSTS}/${id}`);

        if (accessToken) {
            request = request.set('Authorization', `Bearer ${accessToken}`);
        }

        const res = await request.expect(SETTINGS.HTTP_STATUSES.OK_200);

        return res.body;
    },

    filterAndSort<T>(
        items: T[],
        sortAndPaginationFilter: any,
        propertyMap: Record<string, string>
    ) {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
        } = sortAndPaginationFilter;

        let startIndex = (pageNumber - 1) * pageSize;
        let endIndex = startIndex + pageSize;

        const path: string = propertyMap[sortBy];

        if (!path) throw new Error(`Invalid sortBy property: ${sortBy}`);

        const getValueByPath = (obj: T, path: string): any => {
            return path.split('.').reduce((acc: any, key) => acc && acc[key], obj);
        };

        return items
            .sort((a: T, b: T) => {

                const aValue = getValueByPath(a, path);
                const bValue = getValueByPath(b, path);

                if (sortDirection === SortDirection.Descending) {
                    if (aValue < bValue) return 1;
                    if (aValue > bValue) return -1;
                    return 0;
                }
                if (sortDirection === SortDirection.Ascending) {
                    if (aValue < bValue) return -1;
                    if (aValue > bValue) return 1;
                    return 0;
                }

                return 0;
            })
            .slice(startIndex, endIndex);
    },
};

export {postsTestManager};