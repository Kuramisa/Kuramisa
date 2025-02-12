import { model, Schema, type InferSchemaType } from "mongoose";

export const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
});

export type IUser = InferSchemaType<typeof userSchema>;

const userModel = model("users", userSchema);

export type UserDocument = ReturnType<(typeof userModel)["hydrate"]>;

export default userModel;
