import { Schema, model } from "mongoose";

export interface IRSS extends IMongoResult<IRSS> {
    id: string;
    name: string;
    description: string;
    url: string;
    type: RSSType;
}

export const rss = new Schema<IRSS>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
});

const rssModel = model<IRSS>("rss", rss);

export type RSSDocument = ReturnType<(typeof rssModel)["hydrate"]>;

export default rssModel;
