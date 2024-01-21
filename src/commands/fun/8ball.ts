import { Command } from "@sapphire/framework";
import { AttachmentBuilder } from "discord.js";

export class EightBallCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "8ball",
            aliases: ["ask", "8b"],
            description: "8ball answers your burning questions",
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
                .addStringOption((option) =>
                    option
                        .setName("question")
                        .setDescription("Question for the 8 Ball")
                        .setRequired(true)
                )
        );
    }

    /**
     * Execute Slash Command
     */
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { options } = interaction;

        let question = options.getString("question", true);

        const { util } = this.container;

        if (!question.includes("?")) question += "?";

        const { url, response } = await util.nekos.eightBall({
            text: question,
        });

        if (url) {
            const attachment = new AttachmentBuilder(url, {
                name: `8ball-answer-${question.trim()}.png`,
            });

            return interaction.reply({
                content: `${interaction.user}: **${question}**`,
                files: [attachment],
                allowedMentions: { repliedUser: false, users: [] },
            });
        }

        await interaction.reply(response);
    }
}
