import {console_log, req} from './helpers/test-helpers';
import {SETTINGS} from "../src/settings";

describe('/blogs', () => {
    it('should get empty array', async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200, [])

        console_log(res.body, res.status);
    });
});
