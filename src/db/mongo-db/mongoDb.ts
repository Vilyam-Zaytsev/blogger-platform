import {SETTINGS} from "../../common/settings";
import mongoose from "mongoose";

async function runDb(url: string) {

    try {

        await mongoose.connect(`${url}/${SETTINGS.DB_NAME}`);

        console.log('connected to mongodb...');

        return true;
    } catch (error) {

        console.log(error);

        await mongoose.disconnect();

        return false;
    }
}

export {
    runDb
};