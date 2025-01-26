import {console_log, encodingAdminDataInBase64, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets, userPropertyMap} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongoDb";
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

describe('GET /users', () => {
    it('should return an empty array, the admin is authenticated.', async () => {

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

        expect({
            pageCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        });

        console_log(resGetUsers.body, resGetUsers.status, 'Test 1: get(/users)');
    });
    it('should return a 401 error if the admin is not authenticated', async () => {

        const resGetUsers: Response = await req
            .get(SETTINGS.PATH.USERS)
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    'incorrect login',
                    'incorrect password',
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        console_log(resGetUsers.body, resGetUsers.status, 'Test 2: get(/users)');
    });
    it('should return an array with a single user, the admin is authenticated.', async () => {

        await usersTestManager
            .createUser(1);

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

        expect(resGetUsers.body.items[0]).toEqual(presets.users[0]);
        expect(resGetUsers.body.items.length).toEqual(1);

        console_log(resGetUsers.body, resGetUsers.status, 'Test 3: get(/users)');
    });
    it('should return an array with a three users, the admin is authenticated.', async () => {

        await usersTestManager
            .createUser(3);

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

        for (let i = 0; i < resGetUsers.body.items.length; i++) {
            expect(resGetUsers.body.items[i]).toEqual(
                usersTestManager.filterAndSort<UserViewModel>(
                    presets.users,
                    createPaginationAndSortFilter({
                        pageNumber: '1',
                        pageSize: '10',
                        sortBy: 'createdAt',
                        sortDirection: SortDirection.Descending
                    }),
                    userPropertyMap
                )[i]
            )
        }

        expect(resGetUsers.body.items.length).toEqual(3);

        console_log(resGetUsers.body, resGetUsers.status, 'Test 4: get(/users)');
    });
});
