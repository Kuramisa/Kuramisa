import { Precondition } from "@sapphire/framework";
import {
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
} from "discord.js";

export class InDevelopmentPrecondition extends Precondition {
    constructor(ctx: Precondition.LoaderContext, opts: Precondition.Options) {
        super(ctx, {
            ...opts,
            name: "InDevelopment",
        });
    }

    override chatInputRun = async (interaction: ChatInputCommandInteraction) =>
        await this.checkDevelopment(interaction.user.id);
    override contextMenuRun = async (
        interaction: ContextMenuCommandInteraction,
    ) => await this.checkDevelopment(interaction.user.id);

    private checkDevelopment = async (userId: string) =>
        this.container.owners.find((owner) => owner.id === userId)
            ? this.ok()
            : this.error({
                  message: "This command is currently in development",
              });
}
