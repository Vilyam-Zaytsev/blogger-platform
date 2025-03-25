import {console_log_e2e, encodingAdminDataInBase64, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, userLogins} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {UserViewModel} from "../../src/04-users/types/input-output-types";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
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


describe('POST /users', () => {

    it('should create a new user, the admin is authenticated.', async () => {

        const resPostUser: Response = await req
            .post(SETTINGS.PATH.USERS)
            .send({
                login: userLogins[0],
                email: `${userLogins[0]}@example.com`,
                password: userLogins[0]
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.CREATED_201);

        expect(resPostUser.body).toEqual<UserViewModel>({
            id: expect.any(String),
            login: userLogins[0],
            email: `${userLogins[0]}@example.com`,
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        });

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(resPostUser.body).toEqual(foundUsers.items[0]);
        expect(foundUsers.items.length).toEqual(1);

        console_log_e2e(resPostUser.body, resPostUser.status, 'Test 1: post(/users)');
    });

    it('should not create a user if the admin is not authenticated.', async () => {

        const resPostUser: Response = await req
            .post(SETTINGS.PATH.USERS)
            .send({
                login: userLogins[0],
                email: `${userLogins[0]}@example.com`,
                password: userLogins[0]
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    'incorrect_login',
                    'incorrect_password'
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resPostUser.body, resPostUser.status, 'Test 2: post(/users)');
    });

    it('should not create a user if the data in the request body is incorrect (an empty object is passed).', async () => {

        const resPostUser: Response = await req
            .post(SETTINGS.PATH.USERS)
            .send({})
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPostUser.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'login',
                        message: 'The "login" field must be of the string type.'
                    },
                    {
                        field: 'email',
                        message: 'The "email" field must be of the string type.'
                    },
                    {
                        field: 'password',
                        message: 'The "password" field must be of the string type.'
                    },
                ]
            },
        );

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resPostUser.body, resPostUser.status, 'Test 3: post(/users)');
    });

    it('should not create a user if the data in the request body is incorrect (login: empty line, email: empty line, password: empty line).', async () => {

        const resPostUser: Response = await req
            .post(SETTINGS.PATH.USERS)
            .send({
                login: '   ',
                email: '   ',
                password: '   ',
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPostUser.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'login',
                        message: 'The length of the "login" field should be from 3 to 10.'
                    },
                    {
                        field: 'email',
                        message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
                    },
                    {
                        field: 'password',
                        message: 'The length of the "password" field should be from 6 to 20.'
                    },
                ]
            },
        );

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resPostUser.body, resPostUser.status, 'Test 4: post(/users)');
    });

    it('should not create a user if the data in the request body is incorrect (login: less than the minimum length, email: incorrect, password: less than the minimum length)', async () => {

        const resPostUser: Response = await req
            .post(SETTINGS.PATH.USERS)
            .send({
                login: generateRandomString(2),
                email: generateRandomString(10),
                password: generateRandomString(5),
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPostUser.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'login',
                        message: 'The length of the "login" field should be from 3 to 10.'
                    },
                    {
                        field: 'email',
                        message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
                    },
                    {
                        field: 'password',
                        message: 'The length of the "password" field should be from 6 to 20.'
                    },
                ]
            },
        );

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resPostUser.body, resPostUser.status, 'Test 5: post(/users)');
    });

    it('should not create a user if the data in the request body is incorrect (login: exceeds max length,  email: incorrect, password: exceeds max length).', async () => {

        const resPostUser: Response = await req
            .post(SETTINGS.PATH.USERS)
            .send({
                login: generateRandomString(11),
                email: generateRandomString(10),
                password: generateRandomString(21),
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPostUser.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'login',
                        message: 'The length of the "login" field should be from 3 to 10.'
                    },
                    {
                        field: 'email',
                        message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
                    },
                    {
                        field: 'password',
                        message: 'The length of the "password" field should be from 6 to 20.'
                    },
                ]
            },
        );

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resPostUser.body, resPostUser.status, 'Test 6: post(/users)');
    });

    it('should not create a user if the data in the request body is incorrect (login: type number,  email: type number, password: type number).', async () => {

        const resPostUser: Response = await req
            .post(SETTINGS.PATH.USERS)
            .send({
                login: 123,
                email: 123,
                password: 123,
            })
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPostUser.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'login',
                        message: 'The "login" field must be of the string type.'
                    },
                    {
                        field: 'email',
                        message: 'The "email" field must be of the string type.'
                    },
                    {
                        field: 'password',
                        message: 'The "password" field must be of the string type.'
                    },
                ]
            },
        );

        const foundUsers: Paginator<UserViewModel> = await usersTestManager
            .getUsers();

        expect(foundUsers.items.length).toEqual(0);

        console_log_e2e(resPostUser.body, resPostUser.status, 'Test 7: post(/users)');
    });
});
