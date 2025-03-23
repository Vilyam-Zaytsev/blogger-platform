import {
    console_log_e2e,
    encodingAdminDataInBase64,
    req
} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {
    clearPresets,
    presets,
    userPropertyMap
} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {SortDirection} from "../../src/common/types/input-output-types/pagination-sort-types";
import {UserViewModel} from "../../src/04-users/types/input-output-types";
import {createPaginationAndSortFilter} from "../../src/common/helpers/sort-query-dto";
import {User} from "../../src/04-users/domain/user-entity";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setUsersCollection(db.collection<User>('users'));
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
                [...presets.users],
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

        console_log_e2e(resGetUsers.body, resGetUsers.status, 'Test 1: pagination and sort(/users)');
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
                [...presets.users],
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

        console_log_e2e(resGetUsers.body, resGetUsers.status, 'Test 2: pagination(/users)');
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
                [...presets.users],
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

        console_log_e2e(resGetUsers.body, resGetUsers.status, 'Test 3: pagination(/users)');
    });

    it('should use the values provided by the client to search for users by the occurrence of the substring (the  "login" field).', async () => {

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
                searchLoginTerm: 'ro',
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetUsers.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 2,
            items: usersTestManager.filterAndSort<UserViewModel>(
                [...presets.users],
                createPaginationAndSortFilter({
                    searchLoginTerm: 'ro',
                }),
                userPropertyMap
            )
        });

        expect(resGetUsers.body.items.length).toEqual(2);

        console_log_e2e(resGetUsers.body, resGetUsers.status, 'Test 4: search in term(/users)');
    });

    it('should use the values provided by the client to search for users by the occurrence of the substring (the "email" field).', async () => {

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
                searchEmailTerm: 'ro',
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetUsers.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 2,
            items: usersTestManager.filterAndSort<UserViewModel>(
                [...presets.users],
                createPaginationAndSortFilter({
                    searchEmailTerm: 'ro',
                }),
                userPropertyMap
            )
        });

        expect(resGetUsers.body.items.length).toEqual(2);

        console_log_e2e(resGetUsers.body, resGetUsers.status, 'Test 5: search in term(/users)');
    });

    it('should use the values provided by the client to search for users by the occurrence of the substring (the "login" and "email" fields).', async () => {

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
                searchLoginTerm: 'ro',
                searchEmailTerm: 'la',
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetUsers.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: usersTestManager.filterAndSort<UserViewModel>(
                [...presets.users],
                createPaginationAndSortFilter({
                    searchLoginTerm: 'ro',
                    searchEmailTerm: 'la'
                }),
                userPropertyMap
            )
        })

        expect(resGetUsers.body.items.length).toEqual(4);

        console_log_e2e(resGetUsers.body, resGetUsers.status, 'Test 6: search in term(/users)');
    });
});
