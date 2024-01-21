import { Listener } from "@sapphire/framework";
import { ButtonInteraction } from "discord.js";

export class DismissAnnouncementListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Button for Dismissing the announcement",
            event: "interactionCreate",
        });
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== "dismiss-announcement") return;
        const { message } = interaction;
        if (message.inGuild()) return;

        const { logger } = this.container;

        await message.delete().catch((err) => logger.error(err.message));
    }
}
