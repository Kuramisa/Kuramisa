import { Command } from "@sapphire/framework";
import { AttachmentBuilder } from "discord.js";

export class MemberCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "whois",
            aliases: ["user"],
            description: "Information about a member",
            runIn: "GUILD_ANY"
        });
    }

    /**
     * Register Slash Command and Context Menu
     */
    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .addUserOption((option) =>
                    option
                        .setName("member")
                        .setDescription(
                            "Which user's information do you want to view?"
                        )
                        .setRequired(false)
                )
        );

        registry.registerContextMenuCommand((builder) =>
            builder.setName("User Info").setDMPermission(false).setType(2)
        );
    }

    /**
     * Execute Slash Command
     */
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild())
            return interaction.reply({
                content: "This command can only be used in a server",
                ephemeral: true
            });

        let member = interaction.options.getMember("member");

        if (!member) member = interaction.member;

        const { user } = member;

        if (user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true
            });

        await interaction.deferReply();

        const { kanvas, util } = this.container;

        const rows = util.member.actionRow(interaction.member, member);

        const profile = await kanvas.member.profile(member);

        const attachment = new AttachmentBuilder(profile, {
            name: `profile-${user.id}.png`
        });

        return interaction.editReply({
            components: rows,
            files: [attachment]
        });
    }

    /**
     * Execute Context Menu
     */
    async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
        if (!interaction.inCachedGuild())
            return interaction.reply({
                content: "This command can only be used in a server",
                ephemeral: true
            });

        const { guild, targetId } = interaction;

        const member = await guild.members.fetch(targetId);
        if (!member)
            return interaction.reply({
                content: "Member not found",
                ephemeral: true
            });

        if (member.user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true
            });

        await interaction.deferReply();

        const { kanvas, util } = this.container;

        const rows = util.member.actionRow(interaction.member, member);

        const profile = await kanvas.member.profile(member);

        const attachment = new AttachmentBuilder(profile, {
            name: `profile-${member.id}.png`
        });

        return interaction.editReply({ files: [attachment], components: rows });
    }
}
