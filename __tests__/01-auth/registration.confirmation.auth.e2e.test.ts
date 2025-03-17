import {console_log_e2e, encodingAdminDataInBase64, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {user, userLogins} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId, WithId} from "mongodb";
import {apiTrafficCollection, setApiTrafficCollection, setUsersCollection, usersCollection} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {ConfirmationStatus} from "../../src/04-users/types/confirmation-status";
import {UsersRepository} from "../../src/04-users/repositoryes/users-repository";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {nodemailerService} from "../../src/01-auth/adapters/nodemailer-service";
import {EmailTemplateType} from "../../src/common/types/input-output-types/email-template-type";
import {ApiTrafficType} from "../../src/common/types/api-traffic-type";
import {UserInputModel} from "../../src/04-users/types/input-output-types";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {createPaginationAndSortFilter} from "../../src/common/helpers/create-pagination-and-sort-filter";
import {User} from "../../src/04-users/domain/user.entity";

const usersRepository: UsersRepository = new UsersRepository();

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setUsersCollection(db.collection<User>('users'));
    setApiTrafficCollection(db.collection<ApiTrafficType>('api-traffic'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});
    await apiTrafficCollection.deleteMany({});

    nodemailerService.sendEmail = jest
        .fn()
        .mockImplementation((email: string, template: EmailTemplateType) => {
            return Promise.resolve({
                email,
                template
            });
        });
});

describe('POST /auth/registration-confirmation', () => {

    it('should be confirmed if the user has sent the correct verification code.', async () => {

        await authTestManager
            .registration(user);


        const foundUser_1: WithId<User> | null = await usersRepository
            .findByEmail(user.email);

        const resRegistrationConfirmation: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION}`)
            .send({
                code: foundUser_1!.emailConfirmation.confirmationCode
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundUser_2: WithId<User> | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_2).toEqual({
            _id: expect.any(ObjectId),
            login: user.login,
            email: user.email,
            passwordHash: expect.any(String),
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            passwordRecovery: {
                recoveryCode: null,
                expirationDate: null
            },
            emailConfirmation: {
                confirmationCode: null,
                expirationDate: null,
                confirmationStatus: ConfirmationStatus.Confirmed
            }
        });

        console_log_e2e(resRegistrationConfirmation.body, resRegistrationConfirmation.status, 'Test 1: post(/auth/registration-confirmation)');
    });

    it('should not be confirmed registration if the user has sent more than 5 requests from one IP to "/registration-confirmation" in the last 10 seconds.', async () => {

        for (let i = 0; i < 5; i++) {

            const user: UserInputModel = {
                login: userLogins[i],
                email: `${userLogins[i]}@example.com`,
                password: userLogins[i]
            }

            await authTestManager
                .registration(user);
        }

        const users: User[] = await usersRepository
            .findUsers(createPaginationAndSortFilter({}))

        const confirmationCodes: string[] = users.map(u => u.emailConfirmation.confirmationCode!);

        for (let i = 0; i < confirmationCodes.length; i++) {

            await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION}`)
                .send({
                    code: confirmationCodes[i]
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
        }

        const resRegistrationConfirmation = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION}`)
            .send({
                code: generateRandomString(15)
            })
            .expect(SETTINGS.HTTP_STATUSES.TOO_MANY_REQUESTS_429);

        console_log_e2e(resRegistrationConfirmation.body, resRegistrationConfirmation.status, 'Test 2: post(/auth/registration-confirmation)');
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

        const foundUser: WithId<User> | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser).toEqual({
            _id: expect.any(ObjectId),
            login: user.login,
            email: user.email,
            passwordHash: expect.any(String),
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            passwordRecovery: {
                recoveryCode: null,
                expirationDate: null
            },
            emailConfirmation: {
                confirmationCode: expect.any(String),
                expirationDate: expect.any(Date),
                confirmationStatus: ConfirmationStatus.NotConfirmed
            }
        });

        console_log_e2e(resRegistrationConfirmation.body, resRegistrationConfirmation.status, 'Test 3:' +
            ' post(/auth/registration-confirmation)');
    });

    it('should not be confirmed if the user has sent an incorrect verification code (the code has already been used)', async () => {

        await authTestManager
            .registration(user);

        const foundUser_1: WithId<User> | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_1).toEqual({
            _id: expect.any(ObjectId),
            login: user.login,
            email: user.email,
            passwordHash: expect.any(String),
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            passwordRecovery: {
                recoveryCode: null,
                expirationDate: null
            },
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
                    //TODO: ЗАМЕНИТЬ СООБЩЕНИЕ!!!

                    // message: 'The confirmation code has already been used. The account has already been verified.'
                    message: 'Confirmation code incorrect.'
                }
            ]
        })

        const foundUser_2: WithId<User> | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_2).toEqual({
            _id: expect.any(ObjectId),
            login: user.login,
            email: user.email,
            passwordHash: expect.any(String),
            createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
            passwordRecovery: {
                recoveryCode: null,
                expirationDate: null
            },
            emailConfirmation: {
                confirmationCode: null,
                expirationDate: null,
                confirmationStatus: ConfirmationStatus.Confirmed
            }
        });

        console_log_e2e(resRegistrationConfirmation_2.body, resRegistrationConfirmation_2.status, 'Test 4:' +
            ' post(/auth/registration-confirmation)');
    });
});
