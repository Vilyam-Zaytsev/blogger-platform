import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {user} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId, WithId} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {ConfirmationStatus, UserDbType} from "../../src/04-users/types/user-db-type";
import {usersRepository} from "../../src/04-users/repositoryes/users-repository";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";

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

//TODO create helper with mock email sending

describe('POST /auth/registration-confirmation', () => {

    it('should be confirmed if the user has sent the correct verification code.', async () => {

        await authTestManager
            .registration(user);

        const foundUser_1: WithId<UserDbType> | null = await usersRepository
            .findByEmail(user.email);


        const resRegistrationConfirmation: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION}`)
            .send({
                code: foundUser_1!.emailConfirmation.confirmationCode
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundUser_2: WithId<UserDbType> | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_2).toEqual({
            _id: expect.any(ObjectId),
            login: user.login,
            email: user.email,
            passwordHash: expect.any(String),
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            emailConfirmation: {
                confirmationCode: expect.any(String),
                expirationDate: expect.any(Date),
                confirmationStatus: ConfirmationStatus.Confirmed
            }
        });

        console_log_e2e(resRegistrationConfirmation.body, resRegistrationConfirmation.status, 'Test 1: post(/auth/registration-confirmation)');
    });

    it('should not be confirmed if the user has sent an incorrect verification code.', async () => {

        await authTestManager
            .registration(user);

        const resRegistrationConfirmation: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION}`)
            .send({
                code: generateRandomString(15)
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistrationConfirmation.body).toEqual({
            errorsMessages: [
                {
                    field: 'code',
                    message: 'Confirmation code incorrect.'
                }
            ]
        });

        const foundUser: WithId<UserDbType> | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser).toEqual({
            _id: expect.any(ObjectId),
            login: user.login,
            email: user.email,
            passwordHash: expect.any(String),
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            emailConfirmation: {
                confirmationCode: expect.any(String),
                expirationDate: expect.any(Date),
                confirmationStatus: ConfirmationStatus.NotConfirmed
            }
        });

        console_log_e2e(resRegistrationConfirmation.body, resRegistrationConfirmation.status, 'Test 2: post(/auth/registration-confirmation)');
    });

    it('should not be confirmed if the user has sent an incorrect verification code (the code has already been used)', async () => {

        await authTestManager
            .registration(user);

        const foundUser_1: WithId<UserDbType> | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_1).toEqual({
            _id: expect.any(ObjectId),
            login: user.login,
            email: user.email,
            passwordHash: expect.any(String),
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            emailConfirmation: {
                confirmationCode: expect.any(String),
                expirationDate: expect.any(Date),
                confirmationStatus: ConfirmationStatus.NotConfirmed
            }
        });

        await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION}`)
            .send({
                code: foundUser_1!.emailConfirmation.confirmationCode
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const resRegistrationConfirmation_2: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION}`)
            .send({
                code: foundUser_1!.emailConfirmation.confirmationCode
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistrationConfirmation_2.body).toEqual({
            errorsMessages: [
                {
                    field: 'code',
                    message: 'The confirmation code has already been used. The account has already been verified.'
                }
            ]
        })

        const foundUser_2: WithId<UserDbType> | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_2).toEqual({
            _id: expect.any(ObjectId),
            login: user.login,
            email: user.email,
            passwordHash: expect.any(String),
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            emailConfirmation: {
                confirmationCode: expect.any(String),
                expirationDate: expect.any(Date),
                confirmationStatus: ConfirmationStatus.Confirmed
            }
        });

        console_log_e2e(resRegistrationConfirmation_2.body, resRegistrationConfirmation_2.status, 'Test 3: post(/auth/registration-confirmation)');
    });
});
