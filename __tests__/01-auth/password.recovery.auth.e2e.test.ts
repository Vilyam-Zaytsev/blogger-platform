import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets, user} from "../helpers/datasets-for-tests";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {UserDocument} from "../../src/03-users/domain/user-entity";
import {UsersRepository} from "../../src/03-users/repositoryes/users-repository";
import mongoose from "mongoose";
import {container} from "../../src/composition-root";
import {NodemailerService} from "../../src/01-auth/adapters/nodemailer-service";
import {console_log_e2e, req} from "../helpers/test-helpers";
import {Response} from "supertest";

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

describe('POST /auth/password-recovery', () => {

    it('should send the recovery code by email and save the recovery code and the date of the expiration to the database if the user has sent the correct data: (email address).', async () => {

        await usersTestManager
            .createUser(1);

        const foundUser_1: UserDocument | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_1).toEqual(expect.objectContaining({
            passwordRecovery: null,
        }));

        const resPasswordRecovery: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.PASSWORD_RECOVERY}`)
            .send({
                email: presets.users[0].email
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundUser_2: UserDocument | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_2).toEqual(expect.objectContaining({

                passwordRecovery: expect.objectContaining({

                    recoveryCode: expect.any(String),
                    expirationDate: expect.any(Date)
                })
            })
        );

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(1);

        console_log_e2e(resPasswordRecovery.body, resPasswordRecovery.status, 'Test 1: post(/auth/password-recovery)');
    }, 50000);

    it('should not send the recovery code by e-mail and save the recovery code and expiration date in the database if the user has sent incorrect data: (email address).', async () => {

        await usersTestManager
            .createUser(1);

        const foundUser_1: UserDocument | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_1).toEqual(expect.objectContaining({
            passwordRecovery: null,
        }));

        const resPasswordRecovery: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.PASSWORD_RECOVERY}`)
            .send({
                email: `incorrect-email@example.com`
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundUser_2: UserDocument | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_2).toEqual(expect.objectContaining({
            passwordRecovery: null,
        }));

        expect(foundUser_1).toEqual(foundUser_2!);

        expect(sendEmailMock).toHaveBeenCalledTimes(0);

        console_log_e2e(resPasswordRecovery.body, resPasswordRecovery.status, 'Test 2: post(/auth/password-recovery)');
    });

    it('should not send the recovery code by e-mail and save the recovery code and expiration date in the database if the user has sent invalid data: (email address).', async () => {

        await usersTestManager
            .createUser(1);

        const foundUser_1: UserDocument | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_1).toEqual(expect.objectContaining({
            passwordRecovery: null,
        }));

        const resPasswordRecovery: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.PASSWORD_RECOVERY}`)
            .send({
                email: `invalid-email`
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resPasswordRecovery.body).toEqual({
            'errorsMessages': [
                {
                    'field': 'email',
                    'message': 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
                }
            ]
        });

        const foundUser_2: UserDocument | null = await usersRepository
            .findByEmail(user.email);

        expect(foundUser_2).toEqual(expect.objectContaining({
            passwordRecovery: null,
        }));

        expect(foundUser_1).toEqual(foundUser_2!);

        expect(sendEmailMock).toHaveBeenCalledTimes(0);

        console_log_e2e(resPasswordRecovery.body, resPasswordRecovery.status, 'Test 3: post(/auth/password-recovery)');
    });

    it('should abort the request with error 429 if the user has sent more than 5 requests in the last 10 seconds.', async () => {

        await usersTestManager
            .createUser(1);

        for (let i = 0; i < 5; i++) {

            await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.PASSWORD_RECOVERY}`)
                .send({
                    email: presets.users[0].email
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
        }

        const resPasswordRecovery: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.PASSWORD_RECOVERY}`)
            .send({
                email: presets.users[0].email
            })
            .expect(SETTINGS.HTTP_STATUSES.TOO_MANY_REQUESTS_429);

        expect(sendEmailMock).toHaveBeenCalledTimes(5);

        console_log_e2e(resPasswordRecovery.body, resPasswordRecovery.status, 'Test 4: post(/auth/password-recovery)');
    });
});
