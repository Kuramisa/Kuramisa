import { container } from "@sapphire/pieces";
import { GuildBasedChannel, Message } from "discord.js";
import { GraphQLError } from "graphql";

export default {
    Query: {
        channel: (
            _: any,
            { guildId, channelId }: { guildId: string; channelId: string }
        ) => {
            const guild = container.client.guilds.cache.get(guildId);
            if (!guild) throw new GraphQLError("Server not found");
            const channel = guild.channels.cache.get(channelId);
            if (!channel) throw new GraphQLError("Channel not found");
            return channel.toJSON();
        },
        channels: (
            _: any,
            {
                guildId,
                page = 0,
                perPage,
            }: { guildId: string; page: number; perPage?: number }
        ) => {
            const guild = container.client.guilds.cache.get(guildId);
            if (!guild) throw new GraphQLError("Server not found");
            const channelsCache = guild.channels.cache;
            let channels = channelsCache.toJSON();

            const { util } = container;

            if (perPage) channels = util.chunk(channels, perPage);
            else channels = util.chunk(channels, channelsCache.size);

            if (!channels[page]) throw new GraphQLError("Page not found");

            return {
                data: channels[page],
                count: channelsCache.size,
                page,
                perPage,
            };
        },

        message: async (
            _: any,
            {
                guildId,
                channelId,
                messageId,
            }: { guildId: string; channelId: string; messageId: string }
        ) => {
            const guild = container.client.guilds.cache.get(guildId);
            if (!guild) throw new GraphQLError("Server not found");
            const channel = guild.channels.cache.get(channelId);
            if (!channel) throw new GraphQLError("Channel not found");
            if (!channel.isTextBased())
                throw new GraphQLError("Channel provided is not text based");
            const messages = await channel.messages.fetch();
            const message = messages.get(messageId);
            if (!message) throw new GraphQLError("Message not found");
            return message.toJSON();
        },
        messages: async (
            _: any,
            {
                guildId,
                channelId,
                page,
                perPage,
            }: {
                guildId: string;
                channelId: string;
                page: number;
                perPage?: number;
            }
        ) => {
            const guild = container.client.guilds.cache.get(guildId);
            if (!guild) throw new GraphQLError("Server not found");
            const channel = guild.channels.cache.get(channelId);
            if (!channel) throw new GraphQLError("Channel not found");
            if (!channel.isTextBased())
                throw new GraphQLError("Channel provided is not text based");
            const messagesCache = await channel.messages.fetch();
            let messages = messagesCache
                .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
                .toJSON();

            const { util } = container;
            if (perPage) messages = util.chunk(messages, perPage);
            if (!messages[page]) throw new GraphQLError("Page not found");
            return {
                data: messages[page],
                count: messagesCache.size,
                page,
                perPage,
            };
        },
    },
};
