import kuramisa from "@kuramisa";
import { GraphQLError } from "graphql";

export default {
    Query: {
        clientUser: async () => {
            const user = await kuramisa.user?.fetch();
            const app = await kuramisa.application?.fetch();

            if (!user || !app)
                throw new GraphQLError(
                    "Couldn't fetch client user or application"
                );

            return {
                ...user,
                description: app?.description,
                avatarURL: user?.displayAvatarURL({ size: 4096 }),
                guilds: kuramisa.guilds.cache.size,
                users: kuramisa.users.cache.size
            };
        }
    }
} as any;
