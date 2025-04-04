import {Response} from "supertest";
import {comments, presets} from "../datasets-for-tests";
import {req} from "../test-helpers";
import {SETTINGS} from "../../../src/common/settings";
import {CommentInputModel, CommentViewModel} from "../../../src/07-comments/types/input-output-types";
import {Paginator,} from "../../../src/common/types/input-output-types/pagination-sort-types";
import {SortDirection} from "../../../src/common/helpers/sort-query-dto";

const commentsTestManager = {

    async createComments(numberOfPosts: number, numberOfCommentator: number = 1) {

        const responses: Response[] = [];

        for (let i = 0; i < numberOfPosts; i++) {
            const comment: CommentInputModel = {
                content: comments[i]
            }

            const res: Response = await req
                .post(`${SETTINGS.PATH.POSTS}/${presets.posts[0].id}${SETTINGS.PATH.COMMENTS}`)
                .send(comment)
                .set(
                    'Authorization',
                    `Bearer ${presets.authTokens[i < numberOfCommentator ? i : 0].accessToken}`
                )
                .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

            expect(res.body).toEqual<CommentViewModel>({
                id: expect.any(String),
                content: comments[i],
                commentatorInfo: {
                    userId: presets.users[i < numberOfCommentator ? i : 0].id,
                    userLogin: presets.users[i < numberOfCommentator ? i : 0].login
                },
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            presets.comments.push(res.body);

            responses.push(res);
        }


        return responses;
    },

    async getComments(postId: string): Promise<Paginator<CommentViewModel>> {

        const res: Response = await req
            .get(`${SETTINGS.PATH.POSTS}/${postId}${SETTINGS.PATH.COMMENTS}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        return res.body;
    },

    async getComment(id: string): Promise<CommentViewModel> {

        const res: Response = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${id}`)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

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
            sortDirection
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
    }
};


export {commentsTestManager};