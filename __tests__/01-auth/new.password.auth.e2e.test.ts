import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {MongoClient, WithId} from "mongodb";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import {Response} from "supertest";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {User} from "../../src/04-users/domain/user.entity";
import {nodemailerService} from "../../src/01-auth/adapters/nodemailer-service";
import {EmailTemplateType} from "../../src/common/types/input-output-types/email-template-type";
import {UsersRepository} from "../../src/04-users/repositoryes/users-repository";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import mongoose from "mongoose";
import {container} from "../../src/composition-root";

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
        });
});

describe('POST /auth/new-password', () => {

    it('should update the password if the user has sent the correct data: (newPassword, recoveryCode).', async () => {

        await usersTestManager
            .createUser(1);

        await authTestManager
            .passwordRecovery(presets.users[0].email);

        const foundUser_1: WithId<User> | null = await usersRepository
            .findByEmail(presets.users[0].email);

        const resNewPassword: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.NEW_PASSWORD}`)
            .send({
                newPassword: generateRandomString(10),
                recoveryCode: foundUser_1!.passwordRecovery.recoveryCode
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        const foundUser_2: WithId<User> | null = await usersRepository
            .findByEmail(presets.users[0].email);

        expect(foundUser_1!.passwordHash).not.toBe(foundUser_2!.passwordHash);

        console_log_e2e(resNewPassword.body, resNewPassword.status, 'Test 1: post(/auth/new-password)');
    });

    it('should not update the password if the user has sent incorrect data: (newPassword: less than 6 characters).', async () => {

        await usersTestManager
            .createUser(1);

        await authTestManager
            .passwordRecovery(presets.users[0].email);

        const foundUser_1: WithId<User> | null = await usersRepository
            .findByEmail(presets.users[0].email);

        const resNewPassword: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.NEW_PASSWORD}`)
            .send({
                newPassword: generateRandomString(5),
                recoveryCode: foundUser_1!.passwordRecovery.recoveryCode
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resNewPassword.body).toEqual({
            errorsMessages: [
                {
                    field: 'newPassword',
                    message: 'The length of the "password" field should be from 6 to 20.'
                }
            ]
        });

        const foundUser_2: WithId<User> | null = await usersRepository
            .findByEmail(presets.users[0].email);

        expect(foundUser_1!.passwordHash).toEqual(foundUser_2!.passwordHash);

        console_log_e2e(resNewPassword.body, resNewPassword.status, 'Test 1: post(/auth/new-password)');
    });

    it('should not update the password if the user has sent incorrect data: (newPassword: more than 20 characters).', async () => {

        await usersTestManager
            .createUser(1);

        await authTestManager
            .passwordRecovery(presets.users[0].email);

        const foundUser_1: WithId<User> | null = await usersRepository
            .findByEmail(presets.users[0].email);

        const resNewPassword: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.NEW_PASSWORD}`)
            .send({
                newPassword: generateRandomString(21),
                recoveryCode: foundUser_1!.passwordRecovery.recoveryCode
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resNewPassword.body).toEqual({
            errorsMessages: [
                {
                    field: 'newPassword',
                    message: 'The length of the "password" field should be from 6 to 20.'
                }
            ]
        });

        const foundUser_2: WithId<User> | null = await usersRepository
            .findByEmail(presets.users[0].email);

        expect(foundUser_1!.passwordHash).toEqual(foundUser_2!.passwordHash);

        console_log_e2e(resNewPassword.body, resNewPassword.status, 'Test 2: post(/auth/new-password)');
    });

    it('should not update the password if the user has sent incorrect data: (recoveryCode).', async () => {

        await usersTestManager
            .createUser(1);

        await authTestManager
            .passwordRecovery(presets.users[0].email);

        const foundUser_1: WithId<User> | null = await usersRepository
            .findByEmail(presets.users[0].email);

        const resNewPassword: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.NEW_PASSWORD}`)
            .send({
                newPassword: generateRandomString(15),
                recoveryCode: 'incorrect-recovery-code'
            })
            .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);

        expect(resNewPassword.body).toEqual({
            errorsMessages: [
                {
                    field: 'recoveryCode',
                    message: 'Recovery code incorrect.'
                }
            ]
        });

        const foundUser_2: WithId<User> | null = await usersRepository
            .findByEmail(presets.users[0].email);

        expect(foundUser_1!.passwordHash).toEqual(foundUser_2!.passwordHash);

        console_log_e2e(resNewPassword.body, resNewPassword.status, 'Test 3: post(/auth/new-password)');
    });

    it('should abort the request with error 429 if the user has sent more than 5 requests in the last 10 seconds.', async () => {

        await usersTestManager
            .createUser(1);

        await authTestManager
            .passwordRecovery(presets.users[0].email);

        const foundUser_1: WithId<User> | null = await usersRepository
            .findByEmail(presets.users[0].email);

        await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.NEW_PASSWORD}`)
            .send({
                newPassword: generateRandomString(15),
                recoveryCode: foundUser_1!.passwordRecovery.recoveryCode
            })
            .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

        for (let i = 0; i < 4; i++) {

            await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.NEW_PASSWORD}`)
                .send({
                    newPassword: generateRandomString(15),
                    recoveryCode: foundUser_1!.passwordRecovery.recoveryCode
                })
                .expect(SETTINGS.HTTP_STATUSES.BAD_REQUEST_400);
        }

        const resNewPassword: Response = await req
            .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.NEW_PASSWORD}`)
            .send({
                newPassword: generateRandomString(15),
                recoveryCode: foundUser_1!.passwordRecovery.recoveryCode
            })
            .expect(SETTINGS.HTTP_STATUSES.TOO_MANY_REQUESTS_429);

        console_log_e2e(resNewPassword.body, resNewPassword.status, 'Test 4: post(/auth/new-password)');
    });
});
