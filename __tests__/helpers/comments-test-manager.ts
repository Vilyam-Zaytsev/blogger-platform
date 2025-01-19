import {Response} from "supertest";
import {comments, presets} from "./datasets-for-tests";
import {req} from "./test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {CommentInputModel, CommentViewModel} from "../../src/05-comments/types/input-output-types";
import {
    PaginationAndSortFilterType,
    SortDirection
} from "../../src/common/types/input-output-types/pagination-sort-types";

const commentsTestManager = {

    async createComments(numberOfPosts: number) {

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
                    `Bearer ${presets.accessTokens[0].accessToken}`
                )
                .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

            expect(res.body).toEqual<CommentViewModel>({
                id: expect.any(String),
                content: comments[i],
                commentatorInfo: {
                    userId: presets.users[0].id,
                    userLogin: presets.users[0].login
                },
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            presets.comments.push(res.body);

            responses.push(res);
        }


        return responses;
    },

//TODO вынести в отдельную функцию и протипизировать <>
    filterAndSort(
        items: CommentViewModel[],
        sortAndPaginationFilter: PaginationAndSortFilterType
    ) {

        const {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection
        } = sortAndPaginationFilter;

        let startIndex = (pageNumber - 1) * pageSize;
        let endIndex = startIndex + pageSize;

        return items
            .sort((a: CommentViewModel, b: CommentViewModel) => {
                const key = sortBy as keyof CommentViewModel;

                if (sortDirection === SortDirection.Descending) {
                    if (a[key] < b[key]) return 1;
                    if (a[key] > b[key]) return -1;
                    return 0;
                }
                if (sortDirection === SortDirection.Ascending) {
                    if (a[key] < b[key]) return -1;
                    if (a[key] > b[key]) return 1;
                    return 0;
                }

                return 0;
            })
            .slice(startIndex, endIndex);
    }
};


export {commentsTestManager};