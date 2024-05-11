import { KEmbed } from "@builders";
import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { embedUrl, formatNumber } from "@utils";
import { Pagination } from "@utils";
import { Interaction } from "discord.js";
import { capitalize } from "lodash";
import { LegacyUserRecentScore, LegacyUserBestScore } from "osu-web.js";

@KEvent({
    event: "interactionCreate",
    description: "Manage osu! user buttons interaction."
})
export default class OsuUserButtons extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isButton()) return;
        if (
            !["best-user-beatmaps", "recent-user-beatmaps"].includes(
                interaction.customId
            )
        )
            return;

        const {
            kEmojis,
            games: { osu }
        } = this.client;

        const osUsername =
            interaction.message.embeds[0].author?.name?.split(" - ")[0];

        if (osUsername == null) return;

        const user = await osu.getUser({ u: osUsername, type: "string" });

        if (user == null)
            return interaction.reply({
                content: `**${osUsername} not found**`,
                ephemeral: true
            });

        let maps: LegacyUserRecentScore[] | LegacyUserBestScore[] = [];

        let chosenMapType = "";

        switch (interaction.customId) {
            case "best-user-beatmaps": {
                maps = (await osu.getUserBestScores({ u: user.user_id })).sort(
                    (a, b) => b.pp - a.pp
                );
                chosenMapType = "best";
                break;
            }
            case "recent-user-beatmaps": {
                maps = (
                    await osu.getUserRecentScores({ u: user.user_id })
                ).sort((a, b) => b.score - a.score);
                chosenMapType = "recent";
                break;
            }
        }

        if (maps.length < 1)
            return interaction.reply({
                content: `**No *${chosenMapType}* beatmaps found!**`,
                ephemeral: true
            });

        await interaction.deferReply({
            ephemeral: true
        });

        const embeds: KEmbed[] = [];

        for (let i = 0; i < maps.length; i++) {
            const score = maps[i];
            const beatmap = (await osu.getBeatmaps({ b: score.beatmap_id }))[0];
            embeds.push(
                new KEmbed()
                    .setAuthor({
                        name: `${user.username}'s ${capitalize(
                            interaction.customId.split("-")[0]
                        )} Beatmaps`,
                        iconURL: `https://a.ppy.sh/${user.user_id}`,
                        url: `https://osu.ppy.sh/users/${user.user_id}`
                    })
                    .setDescription(
                        `#${i + 1} ${embedUrl(
                            `**${beatmap.artist}** - ${beatmap.title}`,
                            `https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#osu/${beatmap.beatmap_id}`
                        )}\n**Score**: ${formatNumber(
                            score.score
                        )}\n**Rank**: ${
                            score.rank !== "F"
                                ? kEmojis.get(
                                      `osu_${score.rank
                                          .replaceAll("XH", "ssh")
                                          .toLowerCase()}grade`
                                  )
                                : "F"
                        }\n**Max Combo**: ${score.maxcombo}\n**Star Rating**: ${
                            Math.round(beatmap.difficultyrating * 10) / 10
                        }\n**BPM**: ${beatmap.bpm} `
                    )
                    .setFooter({
                        text: `Map ${i + 1} of ${maps.length} `
                    })
            );
        }

        return Pagination.embeds(interaction, embeds);
    }
}
