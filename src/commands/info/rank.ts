import { Command } from "@sapphire/framework";

export class RankCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "rank",
            description: "Look at your or someone's rank",
            preconditions: ["OwnerOnly"],
        });
    }

    /**
     * Register Slash Command
     */
    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption((option) =>
                    option
                        .setName("person")
                        .setDescription("Who's rank do you want to view")
                        .setRequired(false)
                )
        );
    }

    /**
     * Execute Slash Command
     */
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { options } = interaction;

        let member = options.getMember("person");
        if (!member) member = interaction.member;

        if (member.user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true,
            });

        await interaction.reply({
            content: `**Loading ${
                member.user.id === interaction.user.id ? "your" : `${member}'s`
            } rank card...**`,
            allowedMentions: { users: [] },
        });

        if (!member)
            return interaction.editReply({ content: "Failed to get member" });

        const attachment = await this.container.kanvas.member.rank(member);

        if (!attachment)
            return interaction.reply({
                content: "Failed to get rank card",
                ephemeral: true,
            });

        return interaction.editReply({ content: "", files: [attachment] });
    }
}
