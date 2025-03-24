// import {BlogDbType} from "../../05-blogs/types/blog-db-type";
// import mongoose, {HydratedDocument, Model, Schema} from "mongoose";
//
// type BlogModel = Model<BlogDbType>;
// type BlogDocument = HydratedDocument<BlogDbType>;
//
// const blogSchema = new Schema<BlogDbType>({
//     name: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     websiteUrl: {
//         type: String,
//         required: true
//     },
//     createdAt: {
//         type: String,
//         required: true
//     },
//     isMembership: {
//         type: Boolean,
//         required: true
//     },
// });
//
// const BlogModel: BlogModel = mongoose.model<BlogDbType, BlogModel>('Blog', blogSchema);
//
// export {
//     BlogModel,
//     BlogDocument
// };