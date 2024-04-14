import { type ChatInputCommandInteraction } from "discord.js";
import { Listener } from "@sapphire/framework";

export class SlashFinishListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Slash Command Finish",
            event: "chatInputCommandFinish"
        });
    }

    async run(interaction: ChatInputCommandInteraction) {
        const { logger } = this.container;
        if (!interaction.isChatInputCommand()) return;
        const { commandName, user, guild } = interaction;
        const info = `Slash Command: \`${commandName}\` was used by ${
            user.globalName
                ? `${user.globalName} (${user.username})`
                : `${user.username}`
        } ${
            guild
                ? `in ${interaction.guild?.name} (${interaction.guild?.id})`
                : ""
        }`;
        logger.info(info);
    }
}
