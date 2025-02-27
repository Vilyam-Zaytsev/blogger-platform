import {console_log_e2e, generateRandomString, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, devices, presets, userLogins} from "../helpers/datasets-for-tests";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient} from "mongodb";
import {sessionsCollection, setSessionsCollection, setUsersCollection, usersCollection} from "../../src/db/mongoDb";
import {Response} from "supertest";
import {UserDbType} from "../../src/04-users/types/user-db-type";
import {usersTestManager} from "../helpers/managers/03_users-test-manager";
import {LoginSuccessViewModel} from "../../src/01-auth/types/login-success-view-model";
import {ActiveSessionType} from "../../src/02-sessions/types/active-session-type";
import {authService} from "../../src/01-auth/domain/auth-service";
import {authTestManager} from "../helpers/managers/01_auth-test-manager";
import {DeviceViewModel} from "../../src/02-sessions/types/input-output-types";
import {sessionsTestManager} from "../helpers/managers/02_sessions-test-manager";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

    setUsersCollection(db.collection<UserDbType>('users'));
    setSessionsCollection(db.collection<ActiveSessionType>('sessions'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await usersCollection.deleteMany({});
    await sessionsCollection.deleteMany({});

    clearPresets();
});

describe('GET ACTIVE SESSION /security/devices', () => {

    it('should return an array with active sessions if the user is logged in.', async () => {

        await usersTestManager
            .createUser(1);

        for (let i = 0; i < 4; i++) {

            const res: Response = await req
                .post(`${SETTINGS.PATH.AUTH.BASE}${SETTINGS.PATH.AUTH.LOGIN}`)
                .set("User-Agent", devices[i])
                .send({
                    loginOrEmail: presets.users[0].login,
                    password: presets.users[0].login
                })
                .expect(SETTINGS.HTTP_STATUSES.OK_200);

            expect(res.body).toEqual<LoginSuccessViewModel>(
                expect.objectContaining({
                    accessToken: expect.any(String)
                })
            );

            const authTokens = {
                accessToken: res.body.accessToken,
                refreshToken: res.headers['set-cookie'][0].split(';')[0].split('=')[1]
            };

            presets.authTokens.push({...authTokens});
        }



        // console_log_e2e(resGetActiveSessions.body, resGetActiveSessions.status, 'Test 1: get active' +
        //     ' session(/security/devices)');
    });
});
