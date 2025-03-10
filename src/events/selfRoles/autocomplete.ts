import { AbstractEvent, Event } from "classes/Event";
import { GuildTextBasedChannel, Interaction, Message } from "discord.js";
import truncate from "lodash/truncate";

@Event({
    event: "interactionCreate",
    description: "Autocomplete for self roles",
})
export default class SelfRolesAutocomplete extends AbstractEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "self-roles") return;
        if (!interaction.inCachedGuild()) return;

        const { managers } = this.client;
        const { options, guild } = interaction;

        const db = await managers.guilds.get(guild.id);
        const { name, value } = options.getFocused(true);

        switch (name) {
            case "sr_channel_name": {
                let channels: GuildTextBasedChannel[] = [];

                for (const dbChannel of db.selfRoles) {
                    const channel =
                        guild.channels.cache.get(dbChannel.channelId) ??
                        (await guild.channels
                            .fetch(dbChannel.channelId)
                            .catch(() => null));
                    if (!channel) continue;
                    if (!channel.isTextBased()) continue;
                    channels.push(channel);
                }

                if (value.length > 0)
                    channels = channels.filter((ch) =>
                        ch.name.toLowerCase().includes(value.toLowerCase())
                    );

                channels = channels.slice(0, 25);

                return interaction.respond(
                    channels.map((ch) => ({
                        name: ch.name,
                        value: ch.id,
                    }))
                );
            }
            case "sr_message": {
                const channelId = options.getString("sr_channel_name");
                if (!channelId) return;
                const channel =
                    guild.channels.cache.get(channelId) ??
                    (await guild.channels.fetch(channelId).catch(() => null));

                if (!channel) return;
                if (!channel.isTextBased()) return;

                const dbChannel = db.selfRoles.find(
                    (sr) => sr.channelId === channel.id
                );

                if (!dbChannel) return;

                let messages: Message[] = [];
                for (const dbMessage of dbChannel.messages) {
                    const message =
                        channel.messages.cache.get(dbMessage.id) ??
                        (await channel.messages
                            .fetch(dbMessage.id)
                            .catch(() => null));
                    if (!message) continue;
                    messages.push(message);
                }

                if (value.length > 0)
                    messages = messages.filter((msg) =>
                        msg.content.toLowerCase().includes(value.toLowerCase())
                    );

                messages = messages.slice(0, 25);

                return interaction.respond(
                    messages.map((msg) => ({
                        name: `${truncate(msg.content, {
                            length: 99 - msg.id.length,
                        })} - ID: ${msg.id}`,
                        value: msg.id,
                    }))
                );
            }
        }
    }
}
