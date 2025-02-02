import {Response} from "supertest";
import {
    console_log_e2e,
    encodingAdminDataInBase64,
    req
} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/03_blogs-test-manager";
import {MongoMemoryServer} from "mongodb-memory-server";
import {MongoClient, ObjectId} from "mongodb";
import {blogsCollection, setBlogsCollection} from "../../src/db/mongoDb";
import {BlogDbType} from "../../src/03-blogs/types/blog-db-type";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {BlogViewModel} from "../../src/03-blogs/types/input-output-types";

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    setBlogsCollection(db.collection<BlogDbType>('blogs'));
});

afterAll(async () => {
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    await blogsCollection.deleteMany({});

    clearPresets();
});

    describe('DELETE /blogs', () => {

        it('should delete blog, the admin is authenticated.', async () => {

           await blogsTestManager
               .createBlog(1);

            const resDeleteBlog: Response = await req
                .delete(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NO_CONTENT_204);

            const foundBlogs: Paginator<BlogViewModel> = await blogsTestManager
                .getBlogs();

            expect(foundBlogs.items.length).toEqual(0);

            console_log_e2e(resDeleteBlog.body, resDeleteBlog.status, 'Test 1: delete(/blogs)');
        });

        it('should not delete blog, the admin is not authenticated.', async () => {

            await blogsTestManager
                .createBlog(1);

            const resDeleteBlog: Response = await req
                .delete(`${SETTINGS.PATH.BLOGS}/${presets.blogs[0].id}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        'incorrect_login',
                        'incorrect_password'
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.UNAUTHORIZED_401);

            const foundBlog: BlogViewModel = await blogsTestManager
                .getBlog(presets.blogs[0].id);

            expect(foundBlog).toEqual(presets.blogs[0]);

            console_log_e2e(resDeleteBlog.body, resDeleteBlog.status, 'Test 2: delete(/blogs)');
        });

        it('should return a 404 error if the blog was not found by the passed ID in the parameters.', async () => {

            await blogsTestManager
                .createBlog(1);

            const resDeleteBlog: Response = await req
                .delete(`${SETTINGS.PATH.BLOGS}/${new ObjectId()}`)
                .set({
                    'Authorization': encodingAdminDataInBase64(
                        SETTINGS.ADMIN_DATA.LOGIN,
                        SETTINGS.ADMIN_DATA.PASSWORD
                    )
                })
                .expect(SETTINGS.HTTP_STATUSES.NOT_FOUND_404);

            const foundBlog: BlogViewModel = await blogsTestManager
                .getBlog(presets.blogs[0].id);

            expect(foundBlog).toEqual(presets.blogs[0]);

            console_log_e2e(resDeleteBlog.body, resDeleteBlog.status, 'Test 3: delete(/blogs)');
        });
    });
