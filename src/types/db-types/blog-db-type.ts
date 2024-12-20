import {ObjectId} from "mongodb";

type BlogDbType = {
    _id: ObjectId,
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
    isMembership: boolean
};

export {BlogDbType};