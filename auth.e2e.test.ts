import {console_log_e2e, encodingAdminDataInBase64, generateRandomString, req} from './__tests__/helpers/test-helpers';
import {SETTINGS} from "./src/common/settings";
import {incorrectAccessToken, user} from "./__tests__/helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {setUsersCollection, usersCollection} from "./src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "./src/02-users/types/user-db-type";
import {usersTestManager} from "./__tests__/helpers/managers/02_users-test-manager";

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
});


describe('/auth', () => {
    describe('POST /auth/login', () => {
        it('should be authorized if the user has sent the correct data (login or email and password).', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
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

            expect(resPost[0].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_1`,
                email: `${user.login}_1${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const resGet: Response = await req
                .get(SETTINGS.PATH.USERS)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGet.body.items[0]).toEqual(resPost[0].body);

            const resAuth: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({
                    loginOrEmail: resPost[0].body.login,
                    password: 'qwerty'
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resAuth.body).toEqual(
                expect.objectContaining({
                    accessToken: expect.any(String)
                })
            );

            console_log_e2e(resAuth.body, resAuth.status, 'Test 1: post(/auth/users)');
        });
        it('should be authorized if the user has sent the correct data (login or email and password).', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
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

            expect(resPost[0].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_1`,
                email: `${user.login}_1${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const resGet: Response = await req
                .get(SETTINGS.PATH.USERS)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGet.body.items[0]).toEqual(resPost[0].body);

            const resAuth: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({
                    loginOrEmail: resPost[0].body.email,
                    password: 'qwerty'
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resAuth.body).toEqual(
                expect.objectContaining({
                    accessToken: expect.any(String)
                })
            );

            console_log_e2e(resAuth.body, resAuth.status, 'Test 2: post(/auth/users)');
        });
        it('should not log in if the user has sent invalid data (login or email address and password).', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
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

            expect(resPost[0].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_1`,
                email: `${user.login}_1${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const resGet: Response = await req
                .get(SETTINGS.PATH.USERS)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGet.body.items[0]).toEqual(resPost[0].body);

            const resAuth: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({})
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resAuth.body).toEqual(
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

            console_log_e2e(resAuth.body, resAuth.status, 'Test 3: post(/auth/users)');
        });
        it('should not log in if the user has sent invalid data (login or email address and password).', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
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

            expect(resPost[0].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_1`,
                email: `${user.login}_1${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const resGet: Response = await req
                .get(SETTINGS.PATH.USERS)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGet.body.items[0]).toEqual(resPost[0].body);

            const resAuth: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({
                    loginOrEmail: 123,
                    password: 123
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resAuth.body).toEqual({
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

            console_log_e2e(resAuth.body, resAuth.status, 'Test 4: post(/auth/users)');
        });
        it('should not log in if the user has sent invalid data (login or email address and password).', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
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

            expect(resPost[0].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_1`,
                email: `${user.login}_1${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const resGet: Response = await req
                .get(SETTINGS.PATH.USERS)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGet.body.items[0]).toEqual(resPost[0].body);

            const resAuth: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({
                    loginOrEmail: '   ',
                    password: '   '
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resAuth.body).toEqual({
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

            console_log_e2e(resAuth.body, resAuth.status, 'Test 5: post(/auth/users)');
        });
        it('should not log in if the user has sent invalid data (login or email address and password).', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
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

            expect(resPost[0].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_1`,
                email: `${user.login}_1${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const resGet: Response = await req
                .get(SETTINGS.PATH.USERS)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGet.body.items[0]).toEqual(resPost[0].body);

            const resAuth: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({
                    loginOrEmail: generateRandomString(101),
                    password: generateRandomString(21)
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

            expect(resAuth.body).toEqual({
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

            console_log_e2e(resAuth.body, resAuth.status, 'Test 6: post(/auth/users)');
        });
        it('should not be authorized if the user has sent incorrect data (login or email address and password).', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
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

            expect(resPost[0].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_1`,
                email: `${user.login}_1${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const resGet: Response = await req
                .get(SETTINGS.PATH.USERS)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGet.body.items[0]).toEqual(resPost[0].body);

            const resAuth: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({
                    loginOrEmail: generateRandomString(10),
                    password: 'qwerty'
                })
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            expect(resAuth.body).toEqual({
                errorsMessages: [
                    {
                        field: 'loginOrEmailOrPassword',
                        message: 'Login, email or password incorrect.'
                    }
                ]
            });

            console_log_e2e(resAuth.body, resAuth.status, 'Test 7: post(/auth/users)');
        });
        it('should not be authorized if the user has sent incorrect data (login or email address and password).', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
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

            expect(resPost[0].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_1`,
                email: `${user.login}_1${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const resGet: Response = await req
                .get(SETTINGS.PATH.USERS)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGet.body.items[0]).toEqual(resPost[0].body);

            const resAuth: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({
                    loginOrEmail: resGet.body.items[0].login,
                    password: 'qwertyu'
                })
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            expect(resAuth.body).toEqual({
                errorsMessages: [
                    {
                        field: 'loginOrEmailOrPassword',
                        message: 'Login, email or password incorrect.'
                    }
                ]
            });

            console_log_e2e(resAuth.body, resAuth.status, 'Test 8: post(/auth/users)');
        });
        it('should not create a user if the data in the request body is incorrect.', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
                {
                    login: 123,
                    email: 123,
                    password: 123,
                },
                encodingAdminDataInBase64(
                    SETTINGS.ADMIN_DATA.LOGIN,
                    SETTINGS.ADMIN_DATA.PASSWORD
                ),
                SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
            );

            expect(resPost[0].body).toEqual(
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

            console_log_e2e(resPost[0].body, resPost[0].status, 'Test 9: post(/users)');
        });
    });
    describe('GET /auth/me', () => {
        it('should return information about the user if the user is logged in (sends a valid access token).', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
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

            expect(resPost[0].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_1`,
                email: `${user.login}_1${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const resGet: Response = await req
                .get(SETTINGS.PATH.USERS)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGet.body.items[0]).toEqual(resPost[0].body);

            const resAuth: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({
                    loginOrEmail: resPost[0].body.login,
                    password: 'qwerty'
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resAuth.body).toEqual(
                expect.objectContaining({
                    accessToken: expect.any(String)
                })
            );

            const resMe: Response = await req
                .get(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.ME}`)
                .set(
                    'Authorization',
                    `Bearer ${resAuth.body.accessToken}`
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200)

            expect(resMe.body).toEqual(
                expect.objectContaining({
                    email: resPost[0].body.email,
                    login: resPost[0].body.login,
                    userId: expect.any(String)
                })
            )

            console_log_e2e(resMe.body, resMe.status, 'Test 1: post(/auth/me)');
        });
        it('should return a 401 error if the user is logged in (sending an invalid access token).', async () => {
            const resPost: Response[] = await usersTestManager.createUser(
                1,
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

            expect(resPost[0].body).toEqual({
                id: expect.any(String),
                login: `${user.login}_1`,
                email: `${user.login}_1${user.email}`,
                createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
            });

            const resGet: Response = await req
                .get(SETTINGS.PATH.USERS)
                .set(
                    'Authorization',
                    encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                )
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resGet.body.items[0]).toEqual(resPost[0].body);

            const resAuth: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .send({
                    loginOrEmail: resPost[0].body.login,
                    password: 'qwerty'
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(resAuth.body).toEqual(
                expect.objectContaining({
                    accessToken: expect.any(String)
                })
            );

            const resMe: Response = await req
                .get(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.ME}`)
                .set(
                    'Authorization',
                    incorrectAccessToken
                )
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            console_log_e2e(resMe.body, resMe.status, 'Test 2: post(/auth/me)');
        });
    });
});
