import { model, Schema } from "mongoose";

export interface IStaff extends MongoResult {
    id: string;
    username: string;
    description: string;
    type: StaffType;
}

export const Staff = new Schema<IStaff>({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        required: true,
    },
});

const StaffModel = model<IStaff>("Staff", Staff);

export type StaffDocument = ReturnType<(typeof StaffModel)["hydrate"]>;

export default StaffModel;
