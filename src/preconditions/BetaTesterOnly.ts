import { Precondition } from "@sapphire/framework";
import {
    type ChatInputCommandInteraction,
    type ContextMenuCommandInteraction,
    type User
} from "discord.js";

export class BetaTesterOnlyPrecondition extends Precondition {
    constructor(ctx: Precondition.LoaderContext, opts: Precondition.Options) {
        super(ctx, {
            ...opts,
            name: "BetaTesterOnly"
        });
    }

    override chatInputRun = async (interaction: ChatInputCommandInteraction) =>
        await this.checkBetaTester(interaction.user);

    override contextMenuRun = async (
        interaction: ContextMenuCommandInteraction
    ) => await this.checkBetaTester(interaction.user);

    private async checkBetaTester(user: User) {
        const { database, owners } = this.container;
        if (owners.find((owner) => owner.id === user.id)) return this.ok();

        const db = await database.users.fetch(user.id);

        if (!db.betaTester)
            return this.error({
                message: "You are not a Beta Tester"
            });

        return this.ok();
    }
}
