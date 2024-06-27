import { KButton, KEmbed, KRow, KStringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction, ComponentType } from "discord.js";
import ud from "@dmzoneill/urban-dictionary";

@SlashCommand({
    name: "urban",
    description: "Urban Dictionary Lookup",
    options: [
        new KStringOption().setName("word").setDescription("The word to lookup")
    ]
})
export default class UrbanCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { kEmojis } = this.client;

        const word = interaction.options.getString("word", true);

        const list = await ud.define(word).catch(() => null);

        if (!list)
            return interaction.reply({
                content: "Could not find any definitions",
                ephemeral: true
            });

        await interaction.deferReply();

        let page = 0;

        const row = new KRow().setComponents(
            new KButton()
                .setCustomId("previous_page")
                .setEmoji(kEmojis.get("left_arrow")?.toString() ?? "⬅️"),
            new KButton()
                .setCustomId("next_page")
                .setEmoji(kEmojis.get("right_arrow")?.toString() ?? "➡️")
        );

        const embeds = list.map((def: any, i: number) =>
            new KEmbed()
                .setAuthor({ name: def.author, url: def.permalink })
                .setTitle(def.word)
                .setDescription(def.definition)
                .setFields(
                    {
                        name: "Likes",
                        value: `${def.thumbs_up}`,
                        inline: true
                    },
                    {
                        name: "Dislikes",
                        value: `${def.thumbs_down}`,
                        inline: true
                    },
                    { name: "Example", value: def.example }
                )
                .setFooter({ text: `Definition ${i} of ${list.length}` })
        );

        const message = await interaction.editReply({
            embeds: [embeds[page]],
            components: [row]
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) =>
                (i.customId === "previous_page" ||
                    i.customId === "next_page") &&
                i.user.id === interaction.user.id,
            time: 15000
        });

        collector.on("collect", async (i) => {
            switch (i.customId) {
                case "previous_page":
                    page = page > 0 ? --page : embeds.length - 1;
                    break;
                case "next_page":
                    page = page + 1 < embeds.length ? ++page : 0;
                    break;
                default:
                    break;
            }

            await i.deferUpdate();
            await i.editReply({
                embeds: [embeds[page]],
                components: [row]
            });

            collector.resetTimer();
        });
    }
}
