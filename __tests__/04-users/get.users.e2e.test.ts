import {console_log_e2e, encodingAdminDataInBase64, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets, userPropertyMap} from "../helpers/datasets-for-tests";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {UserViewModel} from "../../src/04-users/types/input-output-types";
import mongoose from "mongoose";
import {SortDirection} from "../../src/common/helpers/sort-query-dto";

beforeAll(async () => {

    const uri = SETTINGS.MONGO_URL;

    if (!uri) {

        throw new Error("MONGO_URL is not defined in SETTINGS");
    }

    await runDb(uri);
});

afterAll(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();

    clearPresets();
});

beforeEach(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();

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

        console_log_e2e(resGetUsers.body, resGetUsers.status, 'Test 1: get(/users)');
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

        console_log_e2e(resGetUsers.body, resGetUsers.status, 'Test 2: get(/users)');
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

        console_log_e2e(resGetUsers.body, resGetUsers.status, 'Test 3: get(/users)');
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

        const filter = {
            pageNumber: '1',
            pageSize: '10',
            sortBy: 'createdAt',
            sortDirection: SortDirection.Descending
        };

            expect(resGetUsers.body.items).toEqual(
                usersTestManager.filterAndSort<UserViewModel>(
                    [...presets.users],
                    filter,
                    userPropertyMap
                )
            );

        expect(resGetUsers.body.items.length).toEqual(3);

        console_log_e2e(resGetUsers.body, resGetUsers.status, 'Test 4: get(/users)');
    });
});
