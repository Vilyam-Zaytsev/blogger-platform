import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {presets, user} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, WithId} from "mongodb";
import {setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/04-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {nodemailerService} from "../../src/01-auth/adapters/nodemailer-service";
import {EmailTemplateType} from "../../src/common/types/input-output-types/email-template-type";
import {usersRepository} from "../../src/04-users/repositoryes/users-repository";
import {emailTemplates} from "../../src/01-auth/adapters/email-templates";
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
    presets.users = [];

    nodemailerService.sendEmail = jest
        .fn()
        .mockImplementation((email: string, template: EmailTemplateType) => {
            return Promise.resolve({
                email,
                template
            });
        })
});

describe('POST /auth/registration-email-resending', () => {

    it('should should send the verification code again if the user has sent the correct data.', async () => {

        await authTestManager
            .registration(user);

        const resRegistrationEmailResending: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_EMAIL_RESENDING}`)
            .send({
                email: user.email
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundUser: WithId<UserDbType> | null = await usersRepository
            .findByEmail(user.email);

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(2);
        expect(await (nodemailerService.sendEmail as jest.Mock).mock.results[1].value)
            .toEqual({
                email: foundUser!.email,
                template: emailTemplates.registrationEmail(foundUser!.emailConfirmation.confirmationCode!)
            });

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 1:' +
            ' post(/auth/registration-email-resending)');
    });

    it('should not resend the verification code if the user has sent incorrect data(an empty object is passed).', async () => {

        await authTestManager
            .registration(user);

        const resRegistrationEmailResending: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_EMAIL_RESENDING}`)
            .send({})
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistrationEmailResending.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'email',
                        message: 'The "email" field must be of the string type.'
                    },
                ]
            },
        );

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(1);

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 2: post(/auth/registration-email-resending)');
    });

    it('should not resend the verification code if the user has sent incorrect data(email: empty line)', async () => {

        await authTestManager
            .registration(user);

        const resRegistrationEmailResending: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_EMAIL_RESENDING}`)
            .send({
                email: '   '
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistrationEmailResending.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'email',
                        message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
                    },
                ]
            },
        );

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(1);

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 3: post(/auth/registration-email-resending)');
    });

    it('should not resend the verification code if the user has sent incorrect data(email: incorrect)', async () => {

        await authTestManager
            .registration(user);

        const resRegistrationEmailResending: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_EMAIL_RESENDING}`)
            .send({
                email: generateRandomString(10)
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistrationEmailResending.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'email',
                        message: 'The "email" field should be in the format: example@domain.com . Letters, numbers, hyphens, and dots are allowed.'
                    },
                ]
            },
        );

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(1);

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 4:' +
            ' post(/auth/registration-email-resending)');
    });

    it('should not resend the verification code if the user has sent incorrect data(email: type number).', async () => {

        await authTestManager
            .registration(user);

        const resRegistrationEmailResending: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_EMAIL_RESENDING}`)
            .send({
                email: 123
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistrationEmailResending.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'email',
                        message: 'The "email" field must be of the string type.'
                    },
                ]
            },
        );

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(1);

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 5:' +
            ' post(/auth/registration-email-resending)');
    });

    it('should not resend the verification code if the user has already confirmed the account.', async () => {

        await usersTestManager
            .createUser(1);

        const resRegistrationEmailResending: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_EMAIL_RESENDING}`)
            .send({
                email: presets.users[0].email
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resRegistrationEmailResending.body).toEqual(
            {
                errorsMessages: [
                    {
                        field: 'email',
                        message: 'The user have already confirmed their credentials.'
                    },
                ]
            },
        );

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 6:' +
            ' post(/auth/registration-email-resending)');
    });
});
