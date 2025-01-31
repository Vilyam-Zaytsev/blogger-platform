import {Response} from "supertest";
import {PostInputModel, PostViewModel} from "../../../src/04-posts/types/input-output-types";
import {
    blogNames,
    postContents,
    postShortDescriptions,
    postTitles,
    presets
} from "../datasets-for-tests";
import {encodingAdminDataInBase64, req} from "../test-helpers";
import {SETTINGS} from "../../../src/common/settings";
import {
    PaginationAndSortFilterType,
    Paginator, SortDirection
} from "../../../src/common/types/input-output-types/pagination-sort-types";

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

            expect(res.body).toEqual<PostViewModel>({
                id: expect.any(String),
                title: postTitles[i],
                shortDescription: postShortDescriptions[i],
                content: postContents[i],
                blogId: presets.blogs[0].id,
                blogName: blogNames[0],
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            presets.posts.push(res.body);

            responses.push(res);
        }


        return responses;
    },

    async getPosts(): Promise<Paginator<PostViewModel>> {

        const res: Response = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        return res.body;
    },

    filterAndSort<T>(
        items: T[],
        sortAndPaginationFilter: PaginationAndSortFilterType,
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