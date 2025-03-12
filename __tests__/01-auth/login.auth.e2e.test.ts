import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, deviceNames, presets} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {
    apiTrafficCollection,
    sessionsCollection,
    setApiTrafficCollection,
    setSessionsCollection,
    setUsersCollection,
    usersCollection
} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/04-users/types/confirmation-status";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";
import {ApiTrafficType} from "../../src/common/types/api-traffic-type";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

    // const user = db.collection('user')
    //TODO: replace with runDB func

    setUsersCollection(db.collection<UserDbType>('users'));
    setSessionsCollection(db.collection<ActiveSessionType>('sessions'));
    setApiTrafficCollection(db.collection<ApiTrafficType>('api-traffic'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});
    await sessionsCollection.deleteMany({});
    await apiTrafficCollection.deleteMany({});

    clearPresets();
});

describe('POST /auth/login', () => {

    it('should be authorized if the user has sent the correct data (loginOrEmail and password).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: presets.users[0].login,
                password: presets.users[0].login
            })
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resLogin.body).toEqual<LoginSuccessViewModel>(
            {
                accessToken: expect.any(String)
            }
        );

        expect(resLogin.headers['set-cookie']).toBeDefined();
        expect(resLogin.headers['set-cookie'][0]).toMatch(/refreshToken=.*;/);

        console_log_e2e(resLogin.body, resLogin.status, 'Test 1: post(/auth/login)');
    });

    it('should not log in if the user has sent more than 5 requests from one IP to "/login" in the last 10 seconds.', async () => {

        await usersTestManager
            .createUser(1);

        for (let i = 0; i < 5; i++) {

            await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .set("User-Agent", `device${i}`)
                .send({
                    loginOrEmail: presets.users[0].login,
                    password: presets.users[0].login
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);
        }

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .set("User-Agent", deviceNames[0])
            .send({
                loginOrEmail: presets.users[0].login,
                password: presets.users[0].login
            })
            .expect(SETTINGS.HTTP_STATUSES.TOO_MANY_REQUESTS_429);

        console_log_e2e(resLogin.body, resLogin.status, 'Test 2: post(/auth/login)');
    });

    it('should not log in if the user has sent invalid data (loginOrEmail: "undefined", password: "undefined").', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({})
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resLogin.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'loginOrEmail',
                        message: 'The "loginOrEmail" field must be of the string type.'
                    },
                    {
                        field: 'password',
                        message: 'The "password" field must be of the string type.'
                    }
                ]
            }
        );

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 3: post(/auth/login)');
    });

    it('should not log in if the user has sent invalid data (loginOrEmail: type number, password: type number).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: 123,
                password: 123
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resLogin.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmail',
                    message: 'The "loginOrEmail" field must be of the string type.'
                },
                {
                    field: 'password',
                    message: 'The "password" field must be of the string type.'
                }
            ]
        });

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 4: post(/auth/login)');
    });

    it('should not log in if the user has sent invalid data (loginOrEmail: empty line, password: empty line).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: '   ',
                password: '   '
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resLogin.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmail',
                    message: 'The length of the "loginOrEmail" field should be from 3 to 100.'
                },
                {
                    field: 'password',
                    message: 'The length of the "password" field should be from 6 to 20.'
                }
            ]
        });

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 5: post(/auth/login)');
    });

    it('should not log in if the user has sent invalid data (loginOrEmail: exceeds max length, password: exceeds max length).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: generateRandomString(101),
                password: generateRandomString(21)
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resLogin.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmail',
                    message: 'The length of the "loginOrEmail" field should be from 3 to 100.'
                },
                {
                    field: 'password',
                    message: 'The length of the "password" field should be from 6 to 20.'
                }
            ]
        });

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 6: post(/auth/login)');
    });

    it('should not be authorized if the user has sent incorrect data (loginOrEmail: non-existent login).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: generateRandomString(10),
                password: presets.users[0].login
            })
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        expect(resLogin.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmailOrPassword',
                    message: 'Login, email or password incorrect.'
                }
            ]
        });

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 7: post(/auth/login)');
    });

    it('should not be authorized if the user has sent incorrect data (password: invalid password).', async () => {

        await usersTestManager
            .createUser(1);

        const resLogin: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
            .send({
                loginOrEmail: presets.users[0].login,
                password: 'qwertyu'
            })
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        expect(resLogin.body).toEqual({
            errorsMessages: [
                {
                    field: 'loginOrEmailOrPassword',
                    message: 'Login, email or password incorrect.'
                }
            ]
        });

        expect(resLogin.headers['set-cookie']).toBeUndefined();

        console_log_e2e(resLogin.body, resLogin.status, 'Test 8: post(/auth/login)');
    });
});
