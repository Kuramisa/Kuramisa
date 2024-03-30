import { Command } from "@sapphire/framework";
import { AttachmentBuilder } from "discord.js";

export class PatCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, { ...opts, name: "pat", description: "Pat someone" });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("The user to pat")
                        .setRequired(true)
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { util } = this.container;
        const { options } = interaction;

        const user = options.getUser("user", true);

        await interaction.deferReply();

        const { url } = await util.nekos.pat();

        const attachment = new AttachmentBuilder(url, {
            name: `pat-${user.username}.gif`
        });

        return interaction.editReply({
            content: `${interaction.user} patted ${user}`,
            files: [attachment],
            allowedMentions: { repliedUser: false, users: [] }
        });
    }
}
