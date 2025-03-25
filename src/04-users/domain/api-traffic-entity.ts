import mongoose, {HydratedDocument, Model, Schema} from "mongoose";

type ApiTrafficType = {
    ip: string,
    url: string,
    date: Date
};

type ApiTrafficModel = Model<ApiTrafficType>;
type ApiTrafficDocument = HydratedDocument<ApiTrafficType>;

const apiTrafficSchema = new Schema<ApiTrafficType>({

    ip: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

const ApiTrafficModel: ApiTrafficModel = mongoose.model<ApiTrafficType, ApiTrafficModel>('ApiTraffic', apiTrafficSchema);

export {
    ApiTrafficType,
    ApiTrafficModel,
    ApiTrafficDocument
};