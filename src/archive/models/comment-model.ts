// import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
// import {CommentDbType} from "../../07-comments/types/comment-db-type";
//
// type CommentatorInfo = {
//     userId: string,
//     userLogin: string
// };
//
// type CommentModel = Model<CommentDbType>;
// type CommentDocument = HydratedDocument<CommentDbType>;
//
// const commentatorInfoSchema = new Schema<CommentatorInfo>({
//     userId: {
//         type: String,
//         required: true
//     },
//     userLogin: {
//         type: String,
//         required: true
//     }
// });
//
// const commentSchema = new Schema<CommentDbType>({
//     postId: {
//         type: String,
//         required: true
//     },
//     content: {
//         type: String,
//         required: true
//     },
//     commentatorInfo: {
//         type: commentatorInfoSchema,
//         required: true
//     },
//     createdAt: {
//         type: String,
//         required: true
//     }
// });
//
// const CommentModel: CommentModel = mongoose.model<CommentDbType, CommentModel>('Comment', commentSchema);
//
// export {
//     CommentatorInfo,
//     CommentModel,
//     CommentDocument,
// };