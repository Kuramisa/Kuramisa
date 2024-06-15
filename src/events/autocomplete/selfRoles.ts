import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { GuildBasedChannel, Interaction } from "discord.js";
import { truncate } from "lodash";

@KEvent({
    event: "interactionCreate",
    description: "Manage Self Roles autocomplete interaction."
})
export default class SelfRolesAutocomplete extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "self-roles") return;
        if (!interaction.guildId) return;

        const { managers } = this.client;
        const { options } = interaction;

        const guild = await managers.guilds.get(interaction.guildId);
        const focused = options.getFocused(true);

        switch (focused.name) {
            case "sr_channel_name": {
                let channels: GuildBasedChannel[] = [];

                for (const dbChannel of guild.selfRoles) {
                    let channel = guild.channels.cache.get(dbChannel.channelId);
                    if (!channel)
                        channel =
                            (await guild.channels.fetch(dbChannel.channelId)) ??
                            undefined;
                    if (channel) channels.push(channel);
                }

                if (focused.value.length > 0)
                    channels = channels.filter((c) =>
                        c.name
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );

                channels = channels.slice(0, 25);

                return interaction.respond(
                    channels.map((channel) => ({
                        name: channel.name,
                        value: channel.id
                    }))
                );
            }
            case "sr_message": {
                const channelId = options.getString("sr_channel_name", true);
                const channel = guild.channels.cache.find(
                    (ch) => ch.id === channelId
                );
                if (!channel) return;
                if (!channel.isTextBased()) return;

                const dbChannel = guild.selfRoles.find(
                    (sr) => sr.channelId === channel.id
                );
                if (!dbChannel) return;

                let messages = (await channel.messages.fetch()).toJSON();

                if (focused.value.length > 1)
                    messages = messages.filter((m) =>
                        m.content
                            .toLowerCase()
                            .startsWith(focused.value.toLowerCase())
                    );

                messages = messages.slice(0, 25);

                return interaction.respond(
                    messages.map((msg) => ({
                        name: truncate(`${msg.content} - ID: ${msg.id}`, {
                            length: 99
                        }),
                        value: msg.id
                    }))
                );
            }
        }
    }
}
