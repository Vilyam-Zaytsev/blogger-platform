import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets, user, userLogins} from "../helpers/datasets-for-tests";
import {MongoClient, WithId} from "mongodb";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {nodemailerService} from "../../src/01-auth/adapters/nodemailer-service";
import {EmailTemplateType} from "../../src/common/types/input-output-types/email-template-type";
import {UsersRepository} from "../../src/04-users/repositoryes/users-repository";
import {EmailTemplates} from "../../src/01-auth/adapters/email-templates";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {UserInputModel} from "../../src/04-users/types/input-output-types";
import {createPaginationAndSortFilter} from "../../src/common/helpers/sort-query-dto";
import {User} from "../../src/04-users/domain/user-entity";
import {container} from "../../src/composition-root";
import mongoose from "mongoose";

const usersRepository: UsersRepository = container.get(UsersRepository);

let client: MongoClient;

beforeAll(async () => {

    const uri = SETTINGS.MONGO_URL;

    if (!uri) {

        throw new Error("MONGO_URL is not defined in SETTINGS");
    }

    await runDb(uri);

    client = new MongoClient(uri);
    await client.connect();
});

afterAll(async () => {
    await mongoose.disconnect();
    await client.close();
});

beforeEach(async () => {

    if (!mongoose.connection.db) {

        throw new Error("mongoose.connection.db is undefined");
    }

    await mongoose.connection.db.dropDatabase();

    await client.db(SETTINGS.DB_NAME).dropDatabase();

    clearPresets();

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

        const foundUser: WithId<User> | null = await usersRepository
            .findByEmail(user.email);

        const emailTemplates: EmailTemplates = new EmailTemplates();

        expect((nodemailerService.sendEmail as jest.Mock).mock.calls.length).toEqual(2);
        expect(await (nodemailerService.sendEmail as jest.Mock).mock.results[1].value)
            .toEqual({
                email: foundUser!.email,
                template: emailTemplates.registrationEmail(foundUser!.emailConfirmation.confirmationCode!)
            });

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 1:' +
            ' post(/auth/registration-email-resending)');
    });

    it('should email not be resent if the user has sent more than 5 requests from one IP to "/registration-email-resend" in the last 10 seconds.', async () => {

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

        const emails: string[] = users.map(u => u.email);

        for (let i = 0; i < emails.length; i++) {

            await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_EMAIL_RESENDING}`)
                .send({
                    email: emails[i]
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);
        }

        const resRegistrationEmailResending = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.REGISTRATION_EMAIL_RESENDING}`)
            .send({
                email: generateRandomString(15)
            })
            .expect(SETTINGS.HTTP_STATUSES.TOO_MANY_REQUESTS_429);

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 2: post(/auth/registration-email-resending)');
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

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 3:' +
            ' post(/auth/registration-email-resending)');
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

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 4:' +
            ' post(/auth/registration-email-resending)');
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

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 5:' +
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

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 6:' +
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

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 7:' +
            ' post(/auth/registration-email-resending)');
    });
});
