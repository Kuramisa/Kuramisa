import {
    InteractionHandler,
    InteractionHandlerTypes
} from "@sapphire/framework";
import { type AutocompleteInteraction } from "discord.js";

export class SelfRolesACHandler extends InteractionHandler {
    constructor(
        ctx: InteractionHandler.LoaderContext,
        opts: InteractionHandler.Options
    ) {
        super(ctx, {
            ...opts,
            interactionHandlerType: InteractionHandlerTypes.Autocomplete
        });
    }

    override async run(
        interaction: AutocompleteInteraction,
        result: InteractionHandler.ParseResult<this>
    ) {
        return interaction.respond(result);
    }

    override async parse(interaction: AutocompleteInteraction) {
        if (interaction.commandName !== "selfroles") return this.none();

        const { guild } = interaction;
        if (!guild) return this.none();

        const { database, util } = this.container;
        const { options } = interaction;

        const db = await database.guilds.fetch(guild.id);

        const focused = options.getFocused(true);

        switch (focused.name) {
            case "sr_channel_name": {
                let channels = db.selfRoles.map((sr) =>
                    guild.channels.cache.get(sr.channelId)
                );

                if (focused.value.length > 1)
                    channels = channels.filter((ch) =>
                        ch?.name
                            .toLowerCase()
                            .startsWith(focused.value.toLowerCase())
                    );

                channels = channels.slice(0, 25);

                return this.some(
                    channels.map((ch) => ({
                        name: ch?.name
                            ? util.shorten(`${ch.name} - ID: ${ch.id}`, 99)
                            : "Unknown Channel",
                        value: ch?.id ?? ""
                    }))
                );
            }
            case "sr_message": {
                const channelId = options.getString("sr_channel_name", true);
                const channel = guild.channels.cache.find(
                    (ch) => ch.id === channelId
                );
                if (!channel || !channel.isTextBased()) return this.none();

                const dbChannel = db.selfRoles.find(
                    (sr) => sr.channelId === channel.id
                );
                if (!dbChannel) return this.none();

                let messages = (await channel.messages.fetch()).toJSON();

                if (focused.value.length > 1)
                    messages = messages.filter((m) =>
                        m.content
                            .toLowerCase()
                            .startsWith(focused.value.toLowerCase())
                    );

                messages = messages.slice(0, 25);

                return this.some(
                    messages.map((msg) => ({
                        name: util.shorten(
                            `${msg.content} - ID: ${msg.id}`,
                            99
                        ),
                        value: msg.id
                    }))
                );
            }
            default:
                return this.none();
        }
    }
}
