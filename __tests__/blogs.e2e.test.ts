import {console_log, req} from './helpers/test-helpers';
import {SETTINGS} from "../src/settings";
import {blog1, dbTest1} from "./helpers/datasets-for-tests";
import {db} from "../src/db/db";

describe('/blogs', () => {
    it('should get empty array', async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200, [])

        console_log(res.body, res.status, 'Test 1: get(/blogs)\n');
    });
    it('should find a blog by ID', async () => {
        const res1 = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(blog1)
            .expect(201);

        const res2 = await req
            .get(`${SETTINGS.PATH.BLOGS}/${res1.body.id}`)
            .expect(200);

        expect(res2.body).toEqual({
            id: expect.any(String),
            name: blog1.name,
            description: blog1.description,
            websiteUrl: blog1.websiteUrl
        });

        expect(res2.body).toEqual(db.blogs[0]);

        console_log(res2.body, res2.status, 'Test 2: get(/blogs/id)\n');
    });
    it('should create a new blog', async () => {
        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(blog1)
            .expect(201);

        expect(res.body).toEqual({
            id: expect.any(String),
            name: blog1.name,
            description: blog1.description,
            websiteUrl: blog1.websiteUrl
        });

        expect(res.body).toEqual(db.blogs[0]);

        console_log(res.body, res.status, 'Test 3: post(/blogs)\n');
    });
});
