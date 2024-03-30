import { ApplicationCommandRegistry, Command } from "@sapphire/framework";
import { AttachmentBuilder } from "discord.js";
import Voice from "elevenlabs-node";

const { ELEVENLABS_API, MY_VOICE_ID } = process.env;

export class TSCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "tts",
            description: "Text to speech",
            preconditions: ["OwnerOnly"]
        });
    }

    override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption((option) =>
                    option
                        .setName("text")
                        .setDescription("Text to speech")
                        .setRequired(true)
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { options } = interaction;
        const text = options.getString("text", true);

        const { logger } = this.container;

        await interaction.deferReply();

        try {
            const voice = new Voice({
                apiKey: ELEVENLABS_API,
                voiceId: MY_VOICE_ID
            });

            const response = await voice.textToSpeechStream({
                textInput: text
            });

            const attachment = new AttachmentBuilder(response, {
                name: `tts_${Math.round(Math.random() * 2000)}.mp3`
            });

            await interaction.editReply({
                files: [attachment]
            });
        } catch (err: any) {
            logger.error(err);
            await interaction.editReply({
                content: `An error occurred, ${err.message}`
            });
        }
    }
}
