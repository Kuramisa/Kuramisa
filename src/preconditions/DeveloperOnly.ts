import { Precondition } from "@sapphire/framework";
import {
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
} from "discord.js";

export class StaffOnly extends Precondition {
    constructor(ctx: Precondition.LoaderContext, opts: Precondition.Options) {
        super(ctx, {
            ...opts,
            name: "StaffOnly",
        });
    }

    override chatInputRun = (interaction: ChatInputCommandInteraction) =>
        this.checkDeveloper(interaction.user.id);

    override contextMenuRun = (interaction: ContextMenuCommandInteraction) =>
        this.checkDeveloper(interaction.user.id);

    private checkDeveloper = (userId: string) =>
        this.container.owners.find((owner) => owner.id === userId) ||
        this.container.staff.find((staff) => staff.id === userId)
            ? this.ok()
            : this.error({
                  message: "Only the bot staff can use this command",
              });
}
