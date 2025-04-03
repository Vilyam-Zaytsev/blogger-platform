import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, user, userLogins} from "../helpers/datasets-for-tests";
import {WithId} from "mongodb";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {UsersRepository} from "../../src/04-users/repositoryes/users-repository";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {UserInputModel} from "../../src/04-users/types/input-output-types";
import {ConfirmationStatus, User, UserDocument} from "../../src/04-users/domain/user-entity";
import {container} from "../../src/composition-root";
import mongoose from "mongoose";
import {NodemailerService} from "../../src/01-auth/adapters/nodemailer-service";
import {SortQueryDto} from "../../src/common/helpers/sort-query-dto";

const usersRepository: UsersRepository = container.get(UsersRepository);

let sendEmailMock: any;

beforeAll(async () => {

    const uri = SETTINGS.MONGO_URL;

    if (!uri) {

        throw new Error("MONGO_URL is not defined in SETTINGS");
    }

    await runDb(uri);

    //@ts-ignore
    sendEmailMock = jest
        .spyOn(NodemailerService.prototype, 'sendEmail')
        .mockResolvedValue(true);
});

afterAll(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();

    jest.clearAllMocks();
    clearPresets();
});

beforeEach(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();

    jest.clearAllMocks();
    clearPresets();
});

describe('POST /auth/registration-confirmation', () => {

    it('should be confirmed if the user has sent the correct verification code.', async () => {

        await authTestManager
            .registration(user);


        const foundUser_1: UserDocument | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_1).toEqual(expect.objectContaining({

            emailConfirmation: expect.objectContaining({

                confirmationCode: expect.any(String),
                expirationDate: expect.any(Date),
                confirmationStatus: ConfirmationStatus.NotConfirmed
                })
            })
        );

        const resRegistrationConfirmation: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_CONFIRMATION}`)
            .send({
                code: foundUser_1!.emailConfirmation.confirmationCode
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundUser_2: UserDocument | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_2).toEqual(expect.objectContaining({

                emailConfirmation: expect.objectContaining({

                    confirmationCode: null,
                    expirationDate: null,
                    confirmationStatus: ConfirmationStatus.Confirmed
                })
            })
        );

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(1);

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

        const filter: SortQueryDto = new SortQueryDto({});

        const users: UserDocument[] = await usersRepository
            .findUsers(filter);

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

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(5);

        console_log_e2e(resRegistrationConfirmation.body, resRegistrationConfirmation.status, 'Test 2: post(/auth/registration-confirmation)');
    }, 15000);

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

        const foundUser: UserDocument | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser).toEqual(expect.objectContaining({

                emailConfirmation: expect.objectContaining({

                    confirmationCode: expect.any(String),
                    expirationDate: expect.any(Date),
                    confirmationStatus: ConfirmationStatus.NotConfirmed
                })
            })
        );

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(1);

        console_log_e2e(resRegistrationConfirmation.body, resRegistrationConfirmation.status, 'Test 3:' +
            ' post(/auth/registration-confirmation)');
    });

    it('should not be confirmed if the user has sent an incorrect verification code (the code has already been used)', async () => {

        await authTestManager
            .registration(user);

        const foundUser_1: WithId<User> | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_1).toEqual(expect.objectContaining({

                emailConfirmation: expect.objectContaining({

                    confirmationCode: expect.any(String),
                    expirationDate: expect.any(Date),
                    confirmationStatus: ConfirmationStatus.NotConfirmed
                })
            })
        );

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

        expect(foundUser_2).toEqual(expect.objectContaining({

                emailConfirmation: expect.objectContaining({

                    confirmationCode: null,
                    expirationDate: null,
                    confirmationStatus: ConfirmationStatus.Confirmed
                })
            })
        );

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(1);

        console_log_e2e(resRegistrationConfirmation_2.body, resRegistrationConfirmation_2.status, 'Test 4:' +
            ' post(/auth/registration-confirmation)');
    });
});
