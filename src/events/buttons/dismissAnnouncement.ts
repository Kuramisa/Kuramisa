import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Interaction } from "discord.js";

@KEvent({
    event: "interactionCreate",
    description: "Dismiss announcement message."
})
export default class DismissAnnouncementButton extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isButton()) return;
        if (interaction.customId !== "dismiss_announcement") return;

        const { message } = interaction;
        if (message.inGuild()) return;

        const { logger } = this.client;
        await message.delete().catch((e) => logger.error(e));
    }
}
