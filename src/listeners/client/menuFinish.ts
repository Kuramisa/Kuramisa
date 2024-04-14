import { Listener } from "@sapphire/framework";
import {
    ApplicationCommandType,
    type ContextMenuCommandInteraction
} from "discord.js";

export class MenuFinishListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Context Command Finish",
            event: "contextMenuCommandFinish"
        });
    }

    async run(interaction: ContextMenuCommandInteraction) {
        const { logger } = this.container;
        if (!interaction.isContextMenuCommand()) return;

        const { commandType, commandName, user, guild } = interaction;

        const info = `Context Menu Command (${
            commandType === ApplicationCommandType.User ? "User" : "Message"
        }): \`${commandName}\` was used by ${
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
