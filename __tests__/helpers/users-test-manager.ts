import {req} from "./test-helpers";
import {SETTINGS} from "../../src/settings";
import {Response} from "supertest";
import {UserViewModel} from "../../src/users/types/input-output-types";
import {SortDirection} from "../../src/common/types/input-output-types/pagination-sort-types";

const usersTestManager = {
    async createUser(
        numberOfUsers: number,
        dataUser: any,
        adminData: string,
        statusCode: number = SETTINGS.HTTP_STATUSES.CREATED_201,
        path: string = SETTINGS.PATH.USERS
    ) {
        const responses: Response[] = [];

        for (let i = 0; i < numberOfUsers; i++) {
            const res: Response = await req
                .post(path)
                .send(this.formingUserData({...dataUser}, (i + 1)))
                .set('Authorization', adminData)
                .expect(statusCode);

            responses.push(res);
        }


        return responses;
    },

    formingUserData(dataUser: any, userNumber: number) {
        return {
            login:
                dataUser.login
                    ? typeof dataUser.login === 'string'
                        ? dataUser.login.trim() !== ''
                            ? `${dataUser.login}_${userNumber}`
                            : ''
                        : dataUser.title
                    : null,
            email:
                dataUser.email
                    ? typeof dataUser.email === 'string'
                        ? dataUser.email.trim() !== ''
                            ? `${dataUser.login}_${userNumber}${dataUser.email}`
                            : ''
                        : dataUser.email
                    : null,
            password:
                dataUser.password
                    ? typeof dataUser.password === 'string'
                        ? dataUser.password.trim() !== ''
                            ? `${dataUser.password}`
                            : ''
                        : dataUser.password
                    : null,
        };
    },
    filterAndSort(
        items: UserViewModel[],
        sortBy: keyof UserViewModel = 'createdAt',
        sortDirection: SortDirection = SortDirection.Descending,
        pageNumber: number = 1,
        pageSize: number = 10,
    ) {
        let startIndex = (pageNumber - 1) * pageSize;
        let finishIndex = startIndex + pageSize;

        return items
            .sort((a: UserViewModel, b: UserViewModel) => {
                return a[sortBy] > b[sortBy]
                    ? sortDirection === 'desc' ? -1 : 1
                    : a[sortBy] < b[sortBy]
                        ? sortDirection === 'desc' ? 1 : -1
                        : sortDirection === 'desc' ? -1 : 1
            })
            .filter((b, i) => {
                return i >= startIndex && i < finishIndex ? b : null;
            })
    }
};

export {usersTestManager};