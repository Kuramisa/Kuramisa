import { Listener } from "@sapphire/framework";
import { AutocompleteInteraction, TextChannel } from "discord.js";

export class SelfRolesAC extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Autocomplete for Self Roles",
            event: "interactionCreate",
        });
    }

    async run(interaction: AutocompleteInteraction) {
        if (!interaction.isAutocomplete()) return;

        const { database, util } = this.container;

        const { options, guild, commandName } = interaction;
        if (commandName !== "selfroles") return;
        if (!guild) return;

        const db = await database.guilds.fetch(guild.id);

        const focused = options.getFocused(true);

        switch (focused.name) {
            case "sr_channel_name": {
                let channels = db.selfRoles.map((sr) =>
                    guild.channels.cache.get(sr.channelId)
                ) as TextChannel[];

                if (focused.value.length > 1)
                    channels = channels.filter((ch) =>
                        ch.name
                            .toLowerCase()
                            .startsWith(focused.value.toLowerCase())
                    );

                channels = channels.slice(0, 25);

                return interaction.respond(
                    channels.map((ch) => ({
                        name: util.shorten(`${ch.name} - ID: ${ch.id}`, 99),
                        value: ch.id,
                    }))
                );
            }
            case "sr_message": {
                const channelId = options.getString("sr_channel_name", true);
                const channel = guild.channels.cache.find(
                    (ch) => ch.id === channelId
                );
                if (!channel || !channel.isTextBased()) return;

                const dbChannel = db.selfRoles.find(
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
                        name: util.shorten(
                            `${msg.content} - ID: ${msg.id}`,
                            99
                        ),
                        value: msg.id,
                    }))
                );
            }
        }
    }
}
