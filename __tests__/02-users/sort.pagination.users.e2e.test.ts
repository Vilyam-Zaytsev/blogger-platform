import {console_log, encodingAdminDataInBase64, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets, user, userPropertyMap} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {postsTestManager} from "../helpers/managers/04_posts-test-manager";
import {Response} from "supertest";
import {UserDbType} from "../../src/02-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {SortDirection} from "../../src/common/types/input-output-types/pagination-sort-types";
import {UserViewModel} from "../../src/02-users/types/input-output-types";
import {createPaginationAndSortFilter} from "../../src/common/helpers/create-pagination-and-sort-filter";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setUsersCollection(db.collection<UserDbType>('users'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});

    clearPresets();
});

describe('pagination, sort, search in term /users', () => {
    it('should use default pagination values when none are provided by the client.', async () => {

        await usersTestManager
            .createUser(11);

        const resGetUsers: Response = await req
            .get(SETTINGS.PATH.USERS)
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetUsers.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 11,
            items: usersTestManager.filterAndSort<UserViewModel>(
                presets.users,
                createPaginationAndSortFilter({
                    pageNumber: '1',
                    pageSize: '10',
                    sortBy: 'createdAt',
                    sortDirection: SortDirection.Descending
                }),
                userPropertyMap
            )
        });

        expect(resGetUsers.body.items.length).toEqual(10);

        expect(presets.users.length).toEqual(11);

        console_log(resGetUsers.body, resGetUsers.status, 'Test 1: pagination and sort(/users)');
    });
    it('should use client-provided pagination values to return the correct subset of data.', async () => {

        await usersTestManager
            .createUser(11);

        const resGetUsers: Response = await req
            .get(SETTINGS.PATH.USERS)
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .query({
                pageNumber: 2,
                pageSize: 3,
                sortBy: 'login',
                sortDirection: SortDirection.Ascending,
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetUsers.body).toEqual({
            pagesCount: 4,
            page: 2,
            pageSize: 3,
            totalCount: 11,
            items: usersTestManager.filterAndSort<UserViewModel>(
                presets.users,
                createPaginationAndSortFilter({
                    pageNumber: '2',
                    pageSize: '3',
                    sortBy: 'login',
                    sortDirection: SortDirection.Ascending
                }),
                userPropertyMap
            )
        });

        expect(resGetUsers.body.items.length).toEqual(3);

        console_log(resGetUsers.body, resGetUsers.status, 'Test 2: pagination(/users)');
    });
    it('should use client-provided pagination values to return the correct subset of data.', async () => {

        await usersTestManager
            .createUser(11);

        const resGetUsers: Response = await req
            .get(SETTINGS.PATH.USERS)
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .query({
                pageNumber: 6,
                pageSize: 2,
                sortBy: 'createdAt',
                sortDirection: SortDirection.Ascending,
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetUsers.body).toEqual({
            pagesCount: 6,
            page: 6,
            pageSize: 2,
            totalCount: 11,
            items: usersTestManager.filterAndSort<UserViewModel>(
                presets.users,
                createPaginationAndSortFilter({
                    pageNumber: '6',
                    pageSize: '2',
                    sortBy: 'createdAt',
                    sortDirection: SortDirection.Ascending
                }),
                userPropertyMap
            )
        });

        expect(resGetUsers.body.items.length).toEqual(1);

        console_log(resGetUsers.body, resGetUsers.status, 'Test 3: pagination(/users)');
    });
    it('should use the values provided by the client to search for users by the occurrence of the substring (the' +
        ' "login" field).', async () => {

        await usersTestManager
            .createUser(11);

        const resGetUsers: Response = await req
            .get(SETTINGS.PATH.USERS)
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .query({
                searchLoginTerm: [...presets.users[1]].slice(1, 2).join(''),
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetUsers.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: usersTestManager.filterAndSort<UserViewModel>(
                presets.users,
                createPaginationAndSortFilter({
                    pageNumber: '6',
                    pageSize: '2',
                    sortBy: 'createdAt',
                    sortDirection: SortDirection.Ascending,
                    searchLoginTerm: [...presets.users[1]].slice(1, 2).join(''),
                }),
                userPropertyMap
            )
        });

        //TODO

        expect(resGetUsers.body.items.length).toEqual(3);

        console_log(resGetUsers.body, resGetUsers.status, 'Test 4: search in term(/users)');
    });
    it('should use the values provided by the client to search for users by the occurrence of the substring (the' +
        ' "email" field).', async () => {
        const resPost: Response[] = await usersTestManager.createUser(
            11,
            {
                login: user.login,
                email: user.email,
                password: 'qwerty'
            },
            encodingAdminDataInBase64(
                SETTINGS.ADMIN_DATA.LOGIN,
                SETTINGS.ADMIN_DATA.PASSWORD
            )
        );

        for (let i = 0; i < resPost.length; i++) {
            expect(resPost[i].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_${i + 1}`,
                email: `${user.login}_${i + 1}${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });
        }

        const resGet = await req
            .get(SETTINGS.PATH.USERS)
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .query({
                searchEmailTerm: '_1',
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGet.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 3,
            items: usersTestManager.filterAndSort(
                resPost.map(r => r.body),
                'createdAt',
                SortDirection.Descending,
                null,
                '_1',
            )
        })

        for (let i = 0; i < resGet.body.items.length; i++) {
            expect(resGet.body.items[i]).toEqual(
                usersTestManager.filterAndSort(
                    resPost.map(r => r.body),
                    'createdAt',
                    SortDirection.Descending,
                    null,
                    '_1',
                )[i]
            );
        }

        expect(resGet.body.items.length).toEqual(3);

        console_log(resGet.body, resGet.status, 'Test 5: search in term(/users)');
    });
    it('should use the values provided by the client to search for users by the occurrence of the substring (the' +
        ' "login" and "email" fields). ', async () => {
        const resPost: Response[] = await usersTestManager.createUser(
            11,
            {
                login: user.login,
                email: user.email,
                password: 'qwerty'
            },
            encodingAdminDataInBase64(
                SETTINGS.ADMIN_DATA.LOGIN,
                SETTINGS.ADMIN_DATA.PASSWORD
            )
        );

        for (let i = 0; i < resPost.length; i++) {
            expect(resPost[i].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_${i + 1}`,
                email: `${user.login}_${i + 1}${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });
        }

        const resGet = await req
            .get(SETTINGS.PATH.USERS)
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .query({
                searchLoginTerm: '_1',
                searchEmailTerm: '_7',
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGet.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: usersTestManager.filterAndSort(
                resPost.map(r => r.body),
                'createdAt',
                SortDirection.Descending,
                '_1',
                '_7'
            )
        })

        for (let i = 0; i < resGet.body.items.length; i++) {
            expect(resGet.body.items[i]).toEqual(
                usersTestManager.filterAndSort(
                    resPost.map(r => r.body),
                    'createdAt',
                    SortDirection.Descending,
                    '_1',
                    '_7'
                )[i]
            );
        }

        expect(resGet.body.items.length).toEqual(4);

        console_log(resGet.body, resGet.status, 'Test 6: search in term(/users)');
    });
});
