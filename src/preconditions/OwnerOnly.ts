import { Precondition } from "@sapphire/framework";
import {
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction
} from "discord.js";

export class OwnerOnlyPrecondition extends Precondition {
    constructor(ctx: Precondition.LoaderContext, opts: Precondition.Options) {
        super(ctx, {
            ...opts,
            name: "OwnerOnly"
        });
    }

    override chatInputRun = (interaction: ChatInputCommandInteraction) =>
        this.checkOwner(interaction.user.id);

    override contextMenuRun = (interaction: ContextMenuCommandInteraction) =>
        this.checkOwner(interaction.user.id);

    private checkOwner = (userId: string) =>
        this.container.owners.find((owner) => owner.id === userId)
            ? this.ok()
            : this.error({
                  message: "Only the bot owner can use this command"
              });
}
