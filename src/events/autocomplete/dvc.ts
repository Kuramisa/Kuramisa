import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { GuildBasedChannel, Interaction } from "discord.js";

@KEvent({
    event: "interactionCreate",
    description: "Manage Dynamic Voice Channel autocomplete interaction."
})
export default class DVCAutocomplete extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "dvc") return;
        if (!interaction.guildId) return;

        const { managers } = this.client;
        const { options } = interaction;

        const guild = await managers.guilds.get(interaction.guildId);
        const focused = options.getFocused(true);

        if (focused.name === "channel_to_undo") {
            let channels: GuildBasedChannel[] = [];

            for (const dbChannel of guild.dvc) {
                let channel = guild.channels.cache.get(dbChannel.categoryId);
                if (!channel)
                    channel =
                        (await guild.channels.fetch(dbChannel.categoryId)) ??
                        undefined;
                if (channel) channels.push(channel);
            }

            if (focused.value.length > 0)
                channels = channels.filter((c) =>
                    c.name.toLowerCase().includes(focused.value.toLowerCase())
                );

            channels = channels.slice(0, 25);

            return interaction.respond(
                channels.map((channel) => ({
                    name: channel.name,
                    value: channel.id
                }))
            );
        }
    }
}
