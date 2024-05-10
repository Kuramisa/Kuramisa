import { model, Schema } from "mongoose";

export interface IStaff extends IMongoResult<IStaff> {
    id: string;
    username: string;
    description: string;
    type: StaffType;
}

export const staff = new Schema<IStaff>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        required: true
    }
});

const staffModel = model<IStaff>("staff", staff);

export type StaffDocument = ReturnType<(typeof staffModel)["hydrate"]>;

export default staffModel;
