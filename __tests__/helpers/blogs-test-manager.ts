import {req} from "./test-helpers";
import {SETTINGS} from "../../src/common/settings";
import {Response} from "supertest";
import {BlogDbType} from "../../src/03-blogs/types/blog-db-type";
import {BlogViewModel} from "../../src/03-blogs/types/input-output-types";

const blogsTestManager = {
    async createBlog(
        numberOfBlogs: number,
        dataBlog: any,
        adminData: string,
        statusCode: number = SETTINGS.HTTP_STATUSES.CREATED_201,
    ) {
        const responses: Response[] = [];

        for (let i = 0; i < numberOfBlogs; i++) {
            const res: Response = await req
                .post(SETTINGS.PATH.BLOGS)
                .send(this.formingBlogData({...dataBlog}, (i + 1)))
                .set('Authorization', adminData)
                .expect(statusCode);

            responses.push(res);
        }


        return responses;
    },

    formingBlogData(dataBlog: any, blogNumber: number) {
        return {
            name:
                dataBlog.name
                    ? typeof dataBlog.name === 'string'
                        ? dataBlog.name.trim() !== ''
                            ? `${dataBlog.name}_${blogNumber}`
                            : ''
                        : dataBlog.name
                    : null,
            description:
                dataBlog.description
                    ? typeof dataBlog.description === 'string'
                        ? dataBlog.description.trim() !== ''
                            ? `${dataBlog.description}_${blogNumber}`
                            : ''
                        : dataBlog.description
                    : null,
            websiteUrl: dataBlog.websiteUrl
                ? typeof dataBlog.description === 'string'
                    ? dataBlog.websiteUrl.trim() !== ''
                        ? dataBlog.websiteUrl
                        : ''
                    : dataBlog.description
                : null
        }
    },
    filterAndSort(
        items: BlogViewModel[],
        sortBy: keyof BlogViewModel = 'createdAt',
        sortDirection: string = 'desc',
        pageNumber: number = 1,
        pageSize: number = 10,
        searchNameTerm: string | null = null,
    ) {
        let startIndex = (pageNumber - 1) * pageSize;
        let finishIndex = startIndex + pageSize;

        if (!searchNameTerm) {
        return items
            .sort((a: BlogViewModel, b: BlogViewModel) => {
                return a[sortBy] > b[sortBy]
                    ? sortDirection === 'desc' ? -1 : 1
                    : a[sortBy] < b[sortBy]
                        ? sortDirection === 'desc' ? 1 : -1
                        : sortDirection === 'desc' ? -1 : 1
            })
            .filter((b, i) => {
                return  i >= startIndex && i < finishIndex ? b : null;
            })
        } else {
            return items
                .filter(b => b.name.includes(searchNameTerm) ? b : null)
                .sort((a: BlogViewModel, b: BlogViewModel) => {
                    return a[sortBy] > b[sortBy]
                        ? sortDirection === 'desc' ? -1 : 1
                        : a[sortBy] < b[sortBy]
                            ? sortDirection === 'desc' ? 1 : -1
                            : sortDirection === 'desc' ? -1 : 1
                })
                .filter((b, i) => {
                    return  i >= startIndex && i < finishIndex ? b : null;
                })
        }

    }
};

export {blogsTestManager};