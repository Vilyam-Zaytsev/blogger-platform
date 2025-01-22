import {console_log, encodingAdminDataInBase64, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, userLogins} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/02-users/types/user-db-type";
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

        const resGetUsers = await req
            .get(`${SETTINGS.PATH.USERS}`)
            .set(
                'Authorization',
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                )
            )
            .expect(SETTINGS.HTTP_STATUSES.OK_200);

        expect(resGetUsers.body.items.length).toEqual(1);
        expect(resPostUser.body).toEqual(resGetUsers.body.items[0]);

        console_log(resPostUser.body, resPostUser.status, 'Test 1: post(/users)');
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

        console_log(resPostUser.body, resPostUser.status, 'Test 2: post(/users)');
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

        console_log(resPostUser.body, resPostUser.status, 'Test 3: post(/users)');
    });
    it('should not create a user if the data in the request body is incorrect (login, email, password contain empty strings).', async () => {

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

        console_log(resPostUser.body, resPostUser.status, 'Test 4: post(/users)');
    });
    it('should not create a user if the data in the request body is incorrect (login contains less than 3 characters, password contains less than 6 characters, email does not match the pattern).', async () => {

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

        console_log(resPostUser.body, resPostUser.status, 'Test 5: post(/users)');
    });
    it('should not create a user if the data in the request body is incorrect (login contains more than 10 characters, password contains more than 20 characters, email does not match the pattern).', async () => {

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

        console_log(resPostUser.body, resPostUser.status, 'Test 6: post(/users)');
    });
    it('should not create a user if the data in the request body is incorrect (the login, email, password fields are number type).', async () => {

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

        console_log(resPostUser.body, resPostUser.status, 'Test 7: post(/users)');
    });
});
