import { KButton, KEmbed, KRow, KSlashStringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ButtonStyle, ChatInputCommandInteraction, time } from "discord.js";
import moment from "moment";
import { flag } from "country-emoji";

@SlashCommand({
    name: "osu",
    description: "Osu! related commands",
    options: [
        new KSlashStringOption()
            .setName("osu_player")
            .setDescription("The osu! player you want to get information about")
            .setRequired(true)
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const {
            games: { osu },
            kEmojis
        } = this.client;

        const player = interaction.options.getString("osu_player", true);

        const user = await osu.getUser({
            u: player,
            type: "string"
        });

        if (!user)
            return interaction.reply({
                content: "Player not found",
                ephemeral: true
            });

        const embed = new KEmbed()
            .setAuthor({
                name: `${user.username} - Level: ${Math.round(user.level)}`,
                iconURL: `https://a.ppy.sh/${user.user_id}`,
                url: `https://osu.ppy.sh/users/${user.user_id}`
            })
            .setThumbnail(`https://a.ppy.sh/${user.user_id}`)
            .setDescription(
                `${kEmojis.get("osu_accuracy")} **Accuracy**: ${Math.round(
                    user.accuracy
                )}\n${kEmojis.get("osu_music")} **Time Played**: ${moment(
                    user.total_seconds_played
                ).format(
                    "h:mm:ss"
                )}\n${kEmojis.get("osu_beatmap")} **Total Plays**: ${
                    user.playcount
                }\n${kEmojis.get("osu_calendar")} **Joined**: ${time(
                    moment(user.join_date).unix()
                )} (${time(
                    moment(user.join_date).unix(),
                    "R"
                )})\n\n${kEmojis.get("osu_rankings")} ***Ranks***\n- **${flag(
                    user.country
                )} Country Rank**: ${user.pp_country_rank}\n- **${kEmojis.get(
                    "osu_globe"
                )} Global**: ${user.pp_rank}\n\n***Plays***\n- **${kEmojis.get(
                    "osu_sshgrade"
                )} SS Perfect**: ${user.count_rank_ssh}\n- **${kEmojis.get(
                    "osu_ssgrade"
                )} SS**: ${user.count_rank_ss}\n- **${kEmojis.get(
                    "osu_shgrade"
                )} S Perfect**: ${user.count_rank_sh}\n- **${kEmojis.get(
                    "osu_sgrade"
                )} S**: ${user.count_rank_s}\n- **${kEmojis.get(
                    "osu_agrade"
                )} A**: ${user.count_rank_a}`
            );

        const row = new KRow().setComponents(
            new KButton()
                .setCustomId("best-user-beatmaps")
                .setLabel("Best Beatmaps")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🔥"),
            new KButton()
                .setCustomId("recent-user-beatmaps")
                .setLabel("Recent Beatmaps")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("📜")
        );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
}
