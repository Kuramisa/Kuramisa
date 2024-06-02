import { extract } from "@extractus/feed-extractor";
import { Collection } from "discord.js";
import RSSModel from "@schemas/RSS";
import logger from "@struct/Logger";

type Feed = {
    name: string;
    description: string;
    url: string;
    type: RSSType;
};

export default class RSS {
    readonly feeds = new Collection<string, Feed>();

    constructor() {
        this.init();
    }

    async init() {
        const rss = await RSSModel.find();

        for (const feed of rss) {
            this.feeds.set(feed.id, feed);
        }
    }

    async add(name: string, description: string, url: string, type: RSSType) {
        const id = name.toLowerCase().replace(/ /g, "-");

        const feed = new RSSModel({
            id,
            name,
            description,
            url,
            type
        });

        await feed.save();

        logger.debug(`Adding RSS feed ${name} (${url})`);

        this.feeds.set(feed.id, feed);
    }

    async remove(id: string) {
        const feed = await RSSModel.findOneAndDelete({ id });

        if (!feed) return null;

        if (this.feeds.has(feed.id)) this.feeds.delete(feed.id);

        return feed;
    }

    async update(
        id: string,
        name?: string | null,
        description?: string | null,
        url?: string | null
    ) {
        const feed = await RSSModel.findOne({ id });

        if (!feed) return null;

        if (name) feed.name = name;
        if (description) feed.description = description;
        if (url) feed.url = url;

        await feed.save();

        return feed;
    }

    extract = (feed: string) => extract(feed);
}
