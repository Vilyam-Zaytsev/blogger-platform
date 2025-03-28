import {console_log_e2e, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets, user} from "../helpers/datasets-for-tests";
import {MongoClient, ObjectId, WithId} from "mongodb";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {User} from "../../src/04-users/domain/user-entity";
import {EmailTemplateType} from "../../src/common/types/input-output-types/email-template-type";
import {EmailTemplates} from "../../src/01-auth/adapters/email-templates";
import {UsersRepository} from "../../src/04-users/repositoryes/users-repository";
import mongoose from "mongoose";
import {container} from "../../src/composition-root";
import {NodemailerService} from "../../src/01-auth/adapters/nodemailer-service";

const usersRepository: UsersRepository = container.get(UsersRepository);
const nodemailerService: NodemailerService = container.get(NodemailerService);


beforeAll(async () => {

    const uri = SETTINGS.MONGO_URL;

    if (!uri) {

        throw new Error("MONGO_URL is not defined in SETTINGS");
    }

    await runDb(uri);
});

afterAll(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();

    clearPresets();
});

beforeEach(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();

    clearPresets();

    nodemailerService.sendEmail = jest
        .fn()
        .mockImplementation((email: string, template: EmailTemplateType) => {
            return Promise.resolve({
                email,
                template
            });
        });
});

describe('POST /auth/password-recovery', () => {

    it('should send the recovery code by email and save the recovery code and the date of the expiration to the database if the user has sent the correct data: (email address).', async () => {

        await usersTestManager
            .createUser(1);

        const foundUser_1: WithId<User> | null = await usersRepository
            .findByEmail(user.email);

        // expect(foundUser_1).toEqual<WithId<User>>({
        //     _id: expect.any(ObjectId),
        //     login: presets.users[0].login,
        //     email: presets.users[0].email,
        //     passwordHash: expect.any(String),
        //     createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        //     passwordRecovery: {
        //         recoveryCode: null,
        //         expirationDate: null
        //     },
        //     emailConfirmation: {
        //         confirmationCode: null,
        //         expirationDate: null,
        //         confirmationStatus: ConfirmationStatus.Confirmed
        //     }
        // });

        const resPasswordRecovery: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.PASSWORD_RECOVERY}`)
            .send({
                email: presets.users[0].email
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundUser_2: WithId<User> | null = await usersRepository
            .findByEmail(user.email);

        // expect(foundUser_2).toEqual<WithId<User>>({
        //     _id: expect.any(ObjectId),
        //     login: presets.users[0].login,
        //     email: presets.users[0].email,
        //     passwordHash: expect.any(String),
        //     createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
        //     passwordRecovery: {
        //         recoveryCode: expect.any(String),
        //         expirationDate: expect.any(Date)
        //     },
        //     emailConfirmation: {
        //         confirmationCode: null,
        //         expirationDate: null,
        //         confirmationStatus: ConfirmationStatus.Confirmed
        //     }
        // });

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(1);
        console.log((nodemailerService.sendEmail as jest.Mock).mock.results[0].value)
        console.log((nodemailerService.sendEmail as jest.Mock).mock.calls.length)
        // expect(await (nodemailerService.sendEmail as jest.Mock).mock.results[0].value)
        //     .toEqual({
        //         email: foundUser_2!.email,
        //         template: emailTemplates.passwordRecoveryEmail(foundUser_2!.passwordRecovery.recoveryCode!)
        //     });

        console_log_e2e(resPasswordRecovery.body, resPasswordRecovery.status, 'Test 1: post(/auth/password-recovery)');
    }, 50000);

    // it('should not send the recovery code by e-mail and save the recovery code and expiration date in the database if the user has sent incorrect data: (email address).', async () => {
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     const foundUser_1: WithId<User> | null = await usersRepository
    //         .findByEmail(user.email);
    //
    //     expect(foundUser_1).toEqual<WithId<User>>({
    //         _id: expect.any(ObjectId),
    //         login: presets.users[0].login,
    //         email: presets.users[0].email,
    //         passwordHash: expect.any(String),
    //         createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
    //         passwordRecovery: {
    //             recoveryCode: null,
    //             expirationDate: null
    //         },
    //         emailConfirmation: {
    //             confirmationCode: null,
    //             expirationDate: null,
    //             confirmationStatus: ConfirmationStatus.Confirmed
    //         }
    //     });
    //
    //     const resPasswordRecovery: Response = await req
    //         .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.PASSWORD_RECOVERY}`)
    //         .send({
    //             email: `incorrect-email@example.com`
    //         })
    //         .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    //
    //     const foundUser_2: WithId<User> | null = await usersRepository
    //         .findByEmail(user.email);
    //
    //     expect(foundUser_1).toEqual(foundUser_2!);
    //
    //     expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(0);
    //
    //     console_log_e2e(resPasswordRecovery.body, resPasswordRecovery.status, 'Test 2: post(/auth/password-recovery)');
    // });
    //
    // it('should not send the recovery code by e-mail and save the recovery code and expiration date in the database if the user has sent invalid data: (email address).', async () => {
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     const foundUser_1: WithId<User> | null = await usersRepository
    //         .findByEmail(user.email);
    //
    //     expect(foundUser_1).toEqual<WithId<User>>({
    //         _id: expect.any(ObjectId),
    //         login: presets.users[0].login,
    //         email: presets.users[0].email,
    //         passwordHash: expect.any(String),
    //         createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
    //         passwordRecovery: {
    //             recoveryCode: null,
    //             expirationDate: null
    //         },
    //         emailConfirmation: {
    //             confirmationCode: null,
    //             expirationDate: null,
    //             confirmationStatus: ConfirmationStatus.Confirmed
    //         }
    //     });
    //
    //     const resPasswordRecovery: Response = await req
    //         .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.PASSWORD_RECOVERY}`)
    //         .send({
    //             email: `invalid-email`
    //         })
    //         .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
    //
    //     expect(resPasswordRecovery.body).toEqual({
    //         'errorsMessages': [
    //             {
    //                 'field': 'email',
    //                 'message': 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
    //             }
    //         ]
    //     });
    //
    //     const foundUser_2: WithId<User> | null = await usersRepository
    //         .findByEmail(user.email);
    //
    //     expect(foundUser_1).toEqual(foundUser_2!);
    //
    //     expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(0);
    //
    //     console_log_e2e(resPasswordRecovery.body, resPasswordRecovery.status, 'Test 3: post(/auth/password-recovery)');
    // });
    //
    // it('should abort the request with error 429 if the user has sent more than 5 requests in the last 10 seconds.', async () => {
    //
    //     await usersTestManager
    //         .createUser(1);
    //
    //     for (let i = 0; i < 5; i++) {
    //
    //         await req
    //             .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.PASSWORD_RECOVERY}`)
    //             .send({
    //                 email: presets.users[0].email
    //             })
    //             .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
    //     }
    //
    //     const resPasswordRecovery: Response = await req
    //         .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.PASSWORD_RECOVERY}`)
    //         .send({
    //             email: presets.users[0].email
    //         })
    //         .expect(SETTINGS.HTTP_STATUSES.TOO_MANY_REQUESTS_429);
    //
    //     console_log_e2e(resPasswordRecovery.body, resPasswordRecovery.status, 'Test 4: post(/auth/password-recovery)');
    // });
});
