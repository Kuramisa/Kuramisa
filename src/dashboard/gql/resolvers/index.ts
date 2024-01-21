import client from "./client";
import guilds from "./guilds";
import valorant from "./valorant";
import users from "./users";

export default {
    Query: {
        ...client.Query,
        ...guilds.Query,
        ...valorant.Query,
        ...users.Query
    },
    Mutation: {
        ...users.Mutation
    }
} as any;
