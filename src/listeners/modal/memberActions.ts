import { Listener } from "@sapphire/framework";
import { type ModalSubmitInteraction } from "discord.js";

export class MemberActionsModalListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Modal actions from member buttons",
            event: "interactionCreate"
        });
    }

    async run(interaction: ModalSubmitInteraction) {
        if (!interaction.isModalSubmit()) return;

        const id = interaction.customId.split("_")[2];

        if (![`warn_member_${id}`].includes(interaction.customId)) return;

        if (!interaction.inCachedGuild())
            return interaction.reply({
                content: "This modal can only be used in a server",
                ephemeral: true
            });

        const { moderation } = this.container;

        const { fields, guild } = interaction;

        const target = await guild.members.fetch(id).catch(() => null);

        if (!target)
            return interaction.reply({
                content: "Member not found",
                ephemeral: true
            });

        if (interaction.customId === `warn_member_${id}`)
            return moderation.warns.create(
                target,
                interaction.member,
                fields.getTextInputValue("warn_reason")
            );
    }
}
