import { container } from "@sapphire/framework";
import { GraphQLError } from "graphql";

export default {
    Query: {
        clientUser: async () => {
            const { client } = container;

            const user = await client.user?.fetch();
            const app = await client.application?.fetch();

            if (!user || !app)
                throw new GraphQLError(
                    "Couldn't fetch client user or application"
                );

            return {
                ...user,
                description: app?.description,
                avatarURL: user?.displayAvatarURL({ size: 4096 }),
                guilds: client.guilds.cache.size,
                users: client.users.cache.size,
            };
        },
    },
} as any;
