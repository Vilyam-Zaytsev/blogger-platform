import {console_log, encodingAdminDataInBase64, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/02-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/02_users-test-manager";
import {UserViewModel} from "../../src/02-users/types/input-output-types";

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

    describe('DELETE /users', () => {
        it('should delete user, the admin is authenticated.', async () => {

            await usersTestManager
                .createUser(1);

            const resDeleteUser: Response = await req
                .delete(`${SETTINGS.PATH.USERS}/${presets.users[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            await req
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

            console_log(resDeleteUser.body, resDeleteUser.status, 'Test 1: delete(/users)');
        });
        it('should not delete user, the admin is not authenticated.', async () => {

            await usersTestManager
                .createUser(1);

            const resDeleteUser: Response = await req
                .delete(`${SETTINGS.PATH.USERS}/${presets.users[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

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

            expect(resGetUsers.body.items[0]).toEqual<UserViewModel>(presets.users[0]);
            expect(resGetUsers.body.items.length).toEqual(1);

            console_log(resDeleteUser.body, resDeleteUser.status, 'Test 2: delete(/users)');
        });
        it('should return a 404 error if the user was not found by the passed ID in the parameters.', async () => {

            await usersTestManager
                .createUser(1);

            const resDeleteUser: Response = await req
                .delete(`${SETTINGS.PATH.USERS}/${new ObjectId()}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

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

            expect(resGetUsers.body.items.length).toEqual(1)

            console_log(resDeleteUser.body, resDeleteUser.status, 'Test 3: delete(/users)');
        });
    });
