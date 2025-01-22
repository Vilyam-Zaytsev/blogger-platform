import {encodingAdminDataInBase64, req} from "../test-helpers";
import {SETTINGS} from "../../../src/common/settings";
import {Response} from "supertest";
import {UserInputModel, UserViewModel} from "../../../src/02-users/types/input-output-types";
import {
    PaginationAndSortFilterType,
    SortDirection
} from "../../../src/common/types/input-output-types/pagination-sort-types";
import {presets, user, userLogins} from "../datasets-for-tests";

const usersTestManager = {
    async createUser(numberOfUsers: number) {
        const responses: Response[] = [];

        for (let i = 0; i < numberOfUsers; i++) {
            const user: UserInputModel = {
                login: userLogins[i],
                email: `${userLogins[i]}@example.com`,
                password: userLogins[i]
            }

            const res: Response = await req
                .post(SETTINGS.PATH.USERS)
                .send(user)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

            expect(res.body).toEqual<UserViewModel>({
                id: expect.any(String),
                login: userLogins[i],
                email: `${userLogins[i]}@example.com`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            presets.users.push(res.body);

            responses.push(res);
        }


        return responses;
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

    // filterAndSort(
    //     items: UserViewModel[],
    //     sortBy: keyof UserViewModel = 'createdAt',
    //     sortDirection: SortDirection = SortDirection.Descending,
    //     searchLoginTerm: string | null = null,
    //     searchEmailTerm: string | null = null,
    //     pageNumber: number = 1,
    //     pageSize: number = 10,
    // ) {
    //     let startIndex = (pageNumber - 1) * pageSize;
    //     let finishIndex = startIndex + pageSize;
    //
    //     if (searchLoginTerm || searchEmailTerm) {
    //         return items
    //             .filter(u =>
    //                 u.login.includes(searchLoginTerm!)
    //                     ? u
    //                     : u.email.includes(searchEmailTerm!)
    //                         ? u
    //                         : null
    //             )
    //             .sort((a: UserViewModel, b: UserViewModel) => {
    //                 return a[sortBy] > b[sortBy]
    //                     ? sortDirection === 'desc' ? -1 : 1
    //                     : a[sortBy] < b[sortBy]
    //                         ? sortDirection === 'desc' ? 1 : -1
    //                         : sortDirection === 'desc' ? -1 : 1
    //             })
    //             .filter((b, i) => {
    //                 return i >= startIndex && i < finishIndex ? b : null;
    //             });
    //     } else {
    //         return items
    //             .sort((a: UserViewModel, b: UserViewModel) => {
    //                 return a[sortBy] > b[sortBy]
    //                     ? sortDirection === 'desc' ? -1 : 1
    //                     : a[sortBy] < b[sortBy]
    //                         ? sortDirection === 'desc' ? 1 : -1
    //                         : sortDirection === 'desc' ? -1 : 1
    //             })
    //             .filter((b, i) => {
    //                 return i >= startIndex && i < finishIndex ? b : null;
    //             });
    //     }
    // }
};

export {usersTestManager};
