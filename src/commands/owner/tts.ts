import { KAttachment, KStringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";
import { ElevenLabsClient } from "elevenlabs";

const { ELEVENLABS_API, MY_VOICE_ID } = process.env;

@SlashCommand({
    name: "tts",
    description: "Text to speech command",
    ownerOnly: true,
    options: [
        new KStringOption()
            .setName("text")
            .setDescription("The text to convert to speech")
    ]
})
export default class TTSCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { options } = interaction;
        const text = options.getString("text", true);

        await interaction.deferReply();

        try {
            const elevenLabs = new ElevenLabsClient({
                apiKey: ELEVENLABS_API
            });

            const audio = await elevenLabs.generate({
                voice: MY_VOICE_ID,
                text,
                model_id: "eleven_multilingual_v2"
            });

            const attachment = new KAttachment(audio, {
                name: `tts_${Date.now()}.mp3`
            });

            interaction.editReply({
                files: [attachment]
            });
        } catch (error: any) {
            interaction.editReply({
                content: `An error occurred while converting the text to speech ${error.message}`
            });
            this.logger.error(error.message, { error });
        }
    }
}
