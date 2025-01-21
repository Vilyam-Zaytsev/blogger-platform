// import {console_log, encodingAdminDataInBase64, generateRandomString, req} from '../helpers/test-helpers';
// import {SETTINGS} from "../../src/common/settings";
// import {user} from "../helpers/datasets-for-tests";
// import {MongoMemoryServer} from "mongodb-memory-server";
// import {MongoClient, ObjectId} from "mongodb";
// import {setUsersCollection, usersCollection} from "../../src/db/mongoDb";
// import {postsTestManager} from "../helpers/managers/04_posts-test-manager";
// import {Response} from "supertest";
// import {UserDbType} from "../../src/02-users/types/user-db-type";
// import {usersTestManager} from "../helpers/managers/02_users-test-manager";
// import {SortDirection} from "../../src/common/types/input-output-types/pagination-sort-types";
//
// let mongoServer: MongoMemoryServer;
// let client: MongoClient;
//
// beforeAll(async () => {
//     mongoServer = await MongoMemoryServer.create();
//     const uri = mongoServer.getUri();
//
//     client = new MongoClient(uri);
//     await client.connect();
//
//     const db = client.db();
//     setUsersCollection(db.collection<UserDbType>('users'));
// });
//
// afterAll(async () => {
//     await client.close();
//     await mongoServer.stop();
// });
//
// beforeEach(async () => {
//     await usersCollection.deleteMany({});
// });
//
//
// describe('/users', () => {
//     describe('POST /users', () => {
//         it('should create a new user, the admin is authenticated.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             expect(resPost[0].body).toEqual({
//                 id: expect.any(String),
//                 login: `${user.login}_1`,
//                 email: `${user.login}_1${user.email}`,
//                 createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//             });
//
//             const resGet = await req
//                 .get(`${SETTINGS.PATH.USERS}`)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resGet.body.items.length).toEqual(1);
//
//             const resGetById = await req
//                 .get(`${SETTINGS.PATH.USERS}/${resPost[0].body.id}`)
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resPost[0].body).toEqual(resGetById.body);
//
//
//             console_log(resPost[0].body, resPost[0].status, 'Test 1: post(/users)');
//         });
//         it('should not create a user if the admin is not authenticated.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     'incorrect_login',
//                     'incorrect_password'
//                 ),
//                 SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401
//             );
//
//             await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect({
//                 pageCount: 0,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 0,
//                 items: []
//             });
//
//             console_log(resPost[0].body, resPost[0].status, 'Test 2: post(/users)');
//         });
//         it('should not create a user if the data in the request body is incorrect.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {},
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 ),
//                 SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
//             );
//
//             expect(resPost[0].body).toEqual(
//                 {
//                     errorsMessages: [
//                         {
//                             field: 'login',
//                             message: 'The "login" field must be of the string type.'
//                         },
//                         {
//                             field: 'email',
//                             message: 'The "email" field must be of the string type.'
//                         },
//                         {
//                             field: 'password',
//                             message: 'The "password" field must be of the string type.'
//                         },
//                     ]
//                 },
//             );
//
//             await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect({
//                 pageCount: 0,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 0,
//                 items: []
//             });
//
//             console_log(resPost[0].body, resPost[0].status, 'Test 3: post(/users)');
//         });
//         it('should not create a user if the data in the request body is incorrect.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: '   ',
//                     email: '   ',
//                     password: '   ',
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 ),
//                 SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
//             );
//
//             expect(resPost[0].body).toEqual(
//                 {
//                     errorsMessages: [
//                         {
//                             field: 'login',
//                             message: 'The length of the "login" field should be from 3 to 10.'
//                         },
//                         {
//                             field: 'email',
//                             message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
//                         },
//                         {
//                             field: 'password',
//                             message: 'The length of the "password" field should be from 6 to 20.'
//                         },
//                     ]
//                 },
//             );
//
//             await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect({
//                 pageCount: 0,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 0,
//                 items: []
//             });
//
//             console_log(resPost[0].body, resPost[0].status, 'Test 4: post(/users)');
//         });
//         it('should not create a user if the data in the request body is incorrect.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: generateRandomString(11),
//                     email: generateRandomString(10),
//                     password: generateRandomString(21),
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 ),
//                 SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
//             );
//
//             expect(resPost[0].body).toEqual(
//                 {
//                     errorsMessages: [
//                         {
//                             field: 'login',
//                             message: 'The length of the "login" field should be from 3 to 10.'
//                         },
//                         {
//                             field: 'email',
//                             message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
//                         },
//                         {
//                             field: 'password',
//                             message: 'The length of the "password" field should be from 6 to 20.'
//                         },
//                     ]
//                 },
//             );
//
//             await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect({
//                 pageCount: 0,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 0,
//                 items: []
//             });
//
//             console_log(resPost[0].body, resPost[0].status, 'Test 5: post(/users)');
//         });
//         it('should not create a user if the data in the request body is incorrect.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: 123,
//                     email: 123,
//                     password: 123,
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 ),
//                 SETTINGS.HTTP_STATUSES.BAD_REQUEST_400
//             );
//
//             expect(resPost[0].body).toEqual(
//                 {
//                     errorsMessages: [
//                         {
//                             field: 'login',
//                             message: 'The "login" field must be of the string type.'
//                         },
//                         {
//                             field: 'email',
//                             message: 'The "email" field must be of the string type.'
//                         },
//                         {
//                             field: 'password',
//                             message: 'The "password" field must be of the string type.'
//                         },
//                     ]
//                 },
//             );
//
//             await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect({
//                 pageCount: 0,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 0,
//                 items: []
//             });
//
//             console_log(resPost[0].body, resPost[0].status, 'Test 6: post(/users)');
//         });
//     });
//     describe('GET /users', () => {
//         it('should return an empty array, the admin is authenticated.', async () => {
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect({
//                 pageCount: 0,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 0,
//                 items: []
//             });
//
//             console_log(resGet.body, resGet.status, 'Test 1: get(/users)');
//         });
//         it('should return a 401 error if the admin is not authenticated', async () => {
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         'incorrect login',
//                         'incorrect password',
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
//
//             console_log(resGet.body, resGet.status, 'Test 2: get(/users)');
//         });
//         it('should return an array with a single user, the admin is authenticated.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             expect(resPost[0].body).toEqual({
//                 id: expect.any(String),
//                 login: `${user.login}_1`,
//                 email: `${user.login}_1${user.email}`,
//                 createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//             });
//
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resPost[0].body).toEqual(resGet.body.items[0]);
//             expect(resGet.body.items.length).toEqual(1);
//
//             console_log(resGet.body, resGet.status, 'Test 3: get(/users)');
//         });
//         it('should return an array with a two users, the admin is authenticated..', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 2,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             for (let i = 0; i < resPost.length; i++) {
//                 expect(resPost[i].body).toEqual({
//                     id: expect.any(String),
//                     login: `${user.login}_${i + 1}`,
//                     email: `${user.login}_${i + 1}${user.email}`,
//                     createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//                 });
//             }
//
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resGet.body).toEqual({
//                 pagesCount: 1,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 2,
//                 items: usersTestManager.filterAndSort(
//                     resPost.map(r => r.body)
//                 )
//             })
//
//             expect(resGet.body.items.length).toEqual(2);
//
//             console_log(resGet.body, resGet.status, 'Test 4: get(/users)');
//         });
//         it('should return user found by id.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             expect(resPost[0].body).toEqual({
//                 id: expect.any(String),
//                 login: `${user.login}_1`,
//                 email: `${user.login}_1${user.email}`,
//                 createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//             });
//
//             const resGetById = await req
//                 .get(`${SETTINGS.PATH.USERS}/${resPost[0].body.id}`)
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resPost[0].body).toEqual(resGetById.body);
//
//             console_log(resGetById.body, resGetById.status, 'Test 5: get(/users)');
//         });
//         it('should return error 404 not found.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             expect(resPost[0].body).toEqual({
//                 id: expect.any(String),
//                 login: `${user.login}_1`,
//                 email: `${user.login}_1${user.email}`,
//                 createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//             });
//
//             const resGetById_1 = await req
//                 .get(`${SETTINGS.PATH.USERS}/${new ObjectId()}`)
//                 .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);
//
//             const resGetById_2 = await req
//                 .get(`${SETTINGS.PATH.USERS}/${resPost[0].body.id}`)
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resPost[0].body).toEqual(resGetById_2.body);
//
//             console_log(resGetById_1.body, resGetById_1.status, 'Test 6: get(/users)');
//         });
//     });
//     describe('DELETE /users', () => {
//         it('should delete user, the admin is authenticated.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             expect(resPost[0].body).toEqual({
//                 id: expect.any(String),
//                 login: `${user.login}_1`,
//                 email: `${user.login}_1${user.email}`,
//                 createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//             });
//
//             const resDelete = await req
//                 .delete(`${SETTINGS.PATH.USERS}/${resPost[0].body.id}`)
//                 .set({
//                     'Authorization': encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 })
//                 .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
//
//             await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect({
//                 pageCount: 0,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 0,
//                 items: []
//             });
//
//             console_log(resDelete.body, resDelete.status, 'Test 1: delete(/users)');
//         });
//         it('should not delete user, the admin is not authenticated.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             expect(resPost[0].body).toEqual({
//                 id: expect.any(String),
//                 login: `${user.login}_1`,
//                 email: `${user.login}_1${user.email}`,
//                 createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//             });
//
//             const resDelete = await req
//                 .delete(`${SETTINGS.PATH.USERS}/${resPost[0].body.id}`)
//                 .set({
//                     'Authorization': encodingAdminDataInBase64(
//                         'incorrect_login',
//                         'incorrect_password'
//                     )
//                 })
//                 .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);
//
//             const resGetById = await req
//                 .get(`${SETTINGS.PATH.USERS}/${resPost[0].body.id}`)
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resPost[0].body).toEqual(resGetById.body);
//
//             console_log(resDelete.body, resDelete.status, 'Test 2: delete(/users)');
//         });
//         it('should return a 404 error if the user was not found by the passed ID in the parameters.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 1,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             expect(resPost[0].body).toEqual({
//                 id: expect.any(String),
//                 login: `${user.login}_1`,
//                 email: `${user.login}_1${user.email}`,
//                 createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//             });
//
//             const resDelete = await req
//                 .delete(`${SETTINGS.PATH.USERS}/${new ObjectId()}`)
//                 .set({
//                     'Authorization': encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 })
//                 .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);
//
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resGet.body.items.length).toEqual(1)
//
//             console_log(resDelete.body, resDelete.status, 'Test 3: delete(/users)');
//         });
//     });
//     describe('pagination, sort, search in term /users', () => {
//         it('should use default pagination values when none are provided by the client.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 11,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             for (let i = 0; i < resPost.length; i++) {
//                 expect(resPost[i].body).toEqual({
//                     id: expect.any(String),
//                     login: `${user.login}_${i + 1}`,
//                     email: `${user.login}_${i + 1}${user.email}`,
//                     createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//                 });
//             }
//
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resGet.body).toEqual({
//                 pagesCount: 2,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 11,
//                 items: usersTestManager.filterAndSort(
//                     resPost.map(r => r.body)
//                 )
//             })
//
//             for (let i = 0; i < resGet.body.items.length; i++) {
//                 expect(resGet.body.items[i]).toEqual(
//                     postsTestManager.filterAndSort(
//                         resPost.map(r => r.body)
//                     )[i]
//                 );
//             }
//
//             expect(resGet.body.items.length).toEqual(10);
//
//             console_log(resGet.body, resGet.status, 'Test 1: pagination(/users)');
//         });
//         it('should use client-provided pagination values to return the correct subset of data.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 11,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             for (let i = 0; i < resPost.length; i++) {
//                 expect(resPost[i].body).toEqual({
//                     id: expect.any(String),
//                     login: `${user.login}_${i + 1}`,
//                     email: `${user.login}_${i + 1}${user.email}`,
//                     createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//                 });
//             }
//
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .query({
//                     sortBy: 'login',
//                     sortDirection: 'asc',
//                     pageNumber: 2,
//                     pageSize: 3
//                 })
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resGet.body).toEqual({
//                 pagesCount: 4,
//                 page: 2,
//                 pageSize: 3,
//                 totalCount: 11,
//                 items: usersTestManager.filterAndSort(
//                     resPost.map(r => r.body),
//                     'login',
//                     SortDirection.Ascending,
//                     null,
//                     null,
//                     2,
//                     3
//                 )
//             })
//
//             for (let i = 0; i < resGet.body.items.length; i++) {
//                 expect(resGet.body.items[i]).toEqual(
//                     usersTestManager.filterAndSort(
//                         resPost.map(r => r.body),
//                         'login',
//                         SortDirection.Ascending,
//                         null,
//                         null,
//                         2,
//                         3
//                     )[i]
//                 );
//             }
//
//             expect(resGet.body.items.length).toEqual(3);
//
//             console_log(resGet.body, resGet.status, 'Test 2: pagination(/users)');
//         });
//         it('should use client-provided pagination values to return the correct subset of data.', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 11,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             for (let i = 0; i < resPost.length; i++) {
//                 expect(resPost[i].body).toEqual({
//                     id: expect.any(String),
//                     login: `${user.login}_${i + 1}`,
//                     email: `${user.login}_${i + 1}${user.email}`,
//                     createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//                 });
//             }
//
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .query({
//                     sortBy: 'createdAt',
//                     sortDirection: 'asc',
//                     pageNumber: 6,
//                     pageSize: 2
//                 })
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resGet.body).toEqual({
//                 pagesCount: 6,
//                 page: 6,
//                 pageSize: 2,
//                 totalCount: 11,
//                 items: usersTestManager.filterAndSort(
//                     resPost.map(r => r.body),
//                     'createdAt',
//                     SortDirection.Ascending,
//                     null,
//                     null,
//                     6,
//                     2
//                 )
//             })
//
//             for (let i = 0; i < resGet.body.items.length; i++) {
//                 expect(resGet.body.items[i]).toEqual(
//                     usersTestManager.filterAndSort(
//                         resPost.map(r => r.body),
//                         'createdAt',
//                         SortDirection.Ascending,
//                         null,
//                         null,
//                         6,
//                         2
//                     )[i]
//                 );
//             }
//
//             expect(resGet.body.items.length).toEqual(1);
//
//             console_log(resGet.body, resGet.status, 'Test 3: pagination(/users)');
//         });
//         it('should use the values provided by the client to search for users by the occurrence of the substring (the' +
//             ' "login" field).', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 11,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             for (let i = 0; i < resPost.length; i++) {
//                 expect(resPost[i].body).toEqual({
//                     id: expect.any(String),
//                     login: `${user.login}_${i + 1}`,
//                     email: `${user.login}_${i + 1}${user.email}`,
//                     createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//                 });
//             }
//
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .query({
//                     searchLoginTerm: '_1',
//                 })
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resGet.body).toEqual({
//                 pagesCount: 1,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 3,
//                 items: usersTestManager.filterAndSort(
//                     resPost.map(r => r.body),
//                     'createdAt',
//                     SortDirection.Descending,
//                     '_1',
//                 )
//             })
//
//             for (let i = 0; i < resGet.body.items.length; i++) {
//                 expect(resGet.body.items[i]).toEqual(
//                     usersTestManager.filterAndSort(
//                         resPost.map(r => r.body),
//                         'createdAt',
//                         SortDirection.Descending,
//                         '_1',
//                     )[i]
//                 );
//             }
//
//             expect(resGet.body.items.length).toEqual(3);
//
//             console_log(resGet.body, resGet.status, 'Test 4: search in term(/users)');
//         });
//         it('should use the values provided by the client to search for users by the occurrence of the substring (the' +
//             ' "email" field).', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 11,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             for (let i = 0; i < resPost.length; i++) {
//                 expect(resPost[i].body).toEqual({
//                     id: expect.any(String),
//                     login: `${user.login}_${i + 1}`,
//                     email: `${user.login}_${i + 1}${user.email}`,
//                     createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//                 });
//             }
//
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .query({
//                     searchEmailTerm: '_1',
//                 })
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resGet.body).toEqual({
//                 pagesCount: 1,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 3,
//                 items: usersTestManager.filterAndSort(
//                     resPost.map(r => r.body),
//                     'createdAt',
//                     SortDirection.Descending,
//                     null,
//                     '_1',
//                 )
//             })
//
//             for (let i = 0; i < resGet.body.items.length; i++) {
//                 expect(resGet.body.items[i]).toEqual(
//                     usersTestManager.filterAndSort(
//                         resPost.map(r => r.body),
//                         'createdAt',
//                         SortDirection.Descending,
//                         null,
//                         '_1',
//                     )[i]
//                 );
//             }
//
//             expect(resGet.body.items.length).toEqual(3);
//
//             console_log(resGet.body, resGet.status, 'Test 5: search in term(/users)');
//         });
//         it('should use the values provided by the client to search for users by the occurrence of the substring (the' +
//             ' "login" and "email" fields). ', async () => {
//             const resPost: Response[] = await usersTestManager.createUser(
//                 11,
//                 {
//                     login: user.login,
//                     email: user.email,
//                     password: 'qwerty'
//                 },
//                 encodingAdminDataInBase64(
//                     SETTINGS.ADMIN_DATA.LOGIN,
//                     SETTINGS.ADMIN_DATA.PASSWORD
//                 )
//             );
//
//             for (let i = 0; i < resPost.length; i++) {
//                 expect(resPost[i].body).toEqual({
//                     id: expect.any(String),
//                     login: `${user.login}_${i + 1}`,
//                     email: `${user.login}_${i + 1}${user.email}`,
//                     createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
//                 });
//             }
//
//             const resGet = await req
//                 .get(SETTINGS.PATH.USERS)
//                 .set(
//                     'Authorization',
//                     encodingAdminDataInBase64(
//                         SETTINGS.ADMIN_DATA.LOGIN,
//                         SETTINGS.ADMIN_DATA.PASSWORD
//                     )
//                 )
//                 .query({
//                     searchLoginTerm: '_1',
//                     searchEmailTerm: '_7',
//                 })
//                 .expect(SETTINGS.HTTP_STATUSES.OK_200);
//
//             expect(resGet.body).toEqual({
//                 pagesCount: 1,
//                 page: 1,
//                 pageSize: 10,
//                 totalCount: 4,
//                 items: usersTestManager.filterAndSort(
//                     resPost.map(r => r.body),
//                     'createdAt',
//                     SortDirection.Descending,
//                     '_1',
//                     '_7'
//                 )
//             })
//
//             for (let i = 0; i < resGet.body.items.length; i++) {
//                 expect(resGet.body.items[i]).toEqual(
//                     usersTestManager.filterAndSort(
//                         resPost.map(r => r.body),
//                         'createdAt',
//                         SortDirection.Descending,
//                         '_1',
//                         '_7'
//                     )[i]
//                 );
//             }
//
//             expect(resGet.body.items.length).toEqual(4);
//
//             console_log(resGet.body, resGet.status, 'Test 6: search in term(/users)');
//         });
//     });
// });
