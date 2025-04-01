import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets, user, userLogins} from "../helpers/datasets-for-tests";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {UsersRepository} from "../../src/04-users/repositoryes/users-repository";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {UserInputModel} from "../../src/04-users/types/input-output-types";
import {UserDocument} from "../../src/04-users/domain/user-entity";
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

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(2);

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

        const filter: SortQueryDto = new SortQueryDto({});

        const users: UserDocument[] = await usersRepository
            .findUsers(filter);

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

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(10);

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 2: post(/auth/registration-email-resending)');
    }, 10000);

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

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(1);

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

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(1);

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

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(1);

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

        expect(sendEmailMock).toHaveBeenCalled();
        expect(sendEmailMock).toHaveBeenCalledTimes(1);

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

        expect(sendEmailMock).toHaveBeenCalledTimes(0);

        console_log_e2e(resRegistrationEmailResending.body, resRegistrationEmailResending.status, 'Test 7:' +
            ' post(/auth/registration-email-resending)');
    });
});
