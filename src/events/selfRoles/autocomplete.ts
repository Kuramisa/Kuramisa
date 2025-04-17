import { AbstractEvent, Event } from "classes/Event";
import type { GuildTextBasedChannel, Interaction, Message } from "discord.js";
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

        const {
            client: { managers },
            guild,
            options,
        } = interaction;

        const db = await managers.guilds.get(guild.id);
        const { name, value } = options.getFocused(true);

        switch (name) {
            case "sr_channel": {
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
                        ch.name.toLowerCase().includes(value.toLowerCase()),
                    );

                channels = channels.slice(0, 25);

                return interaction.respond(
                    channels.map((ch) => ({
                        name: `${truncate(ch.name, {
                            length: 99 - (ch.id.length + 15),
                        })} - ID: ${ch.id}`,
                        value: ch.id,
                    })),
                );
            }
            case "sr_message": {
                const channelId = options.getString("sr_channel");
                if (!channelId) return;
                const channel =
                    guild.channels.cache.get(channelId) ??
                    (await guild.channels.fetch(channelId).catch(() => null));

                if (!channel) return;
                if (!channel.isTextBased()) return;

                const dbChannel = db.selfRoles.find(
                    (sr) => sr.channelId === channel.id,
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
                        msg.content.toLowerCase().includes(value.toLowerCase()),
                    );

                messages = messages.slice(0, 25);

                return interaction.respond(
                    messages.map((msg) => ({
                        name: `${truncate(msg.content, {
                            length: 99 - (msg.id.length + 15),
                        })} - ID: ${msg.id}`,
                        value: msg.id,
                    })),
                );
            }
            case "sr_button": {
                const channelId = options.getString("sr_channel");
                if (!channelId) return;
                const channel =
                    guild.channels.cache.get(channelId) ??
                    (await guild.channels.fetch(channelId).catch(() => null));
                if (!channel) return;
                if (!channel.isTextBased()) return;

                const dbChannel = db.selfRoles.find(
                    (sr) => sr.channelId === channel.id,
                );
                if (!dbChannel) return;

                const messageId = options.getString("sr_message");
                if (!messageId) return;
                const message =
                    channel.messages.cache.get(messageId) ??
                    (await channel.messages.fetch(messageId).catch(() => null));
                if (!message) return;

                const dbMessage = dbChannel.messages.find(
                    (sr) => sr.id === message.id,
                );
                if (!dbMessage) return;

                let buttons = dbMessage.buttons;
                if (value.length > 0)
                    buttons = buttons.filter((btn) =>
                        btn.name.toLowerCase().includes(value.toLowerCase()),
                    );

                buttons = buttons.slice(0, 25);

                return interaction.respond(
                    buttons.map((btn) => ({
                        name: `${truncate(btn.name, {
                            length: 99 - (btn.id.length + 15),
                        })} - ID: ${btn.id}`,
                        value: btn.id,
                    })),
                );
            }
        }
    }
}
