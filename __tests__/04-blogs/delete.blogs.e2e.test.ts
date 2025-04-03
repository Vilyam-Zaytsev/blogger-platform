import {Response} from "supertest";
import {console_log_e2e, encodingAdminDataInBase64, req} from '../helpers/test-helpers';
import {SETTINGS} from "../../src/common/settings";
import {clearPresets, presets} from "../helpers/datasets-for-tests";
import {blogsTestManager} from "../helpers/managers/04_blogs-test-manager";
import {ObjectId} from "mongodb";
import {Paginator} from "../../src/common/types/input-output-types/pagination-sort-types";
import {BlogViewModel} from "../../src/04-blogs/types/input-output-types";
import {runDb} from "../../src/db/mongo-db/mongoDb";
import mongoose from "mongoose";

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
