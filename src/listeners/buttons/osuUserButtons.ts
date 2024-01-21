import { Listener } from "@sapphire/framework";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import _ from "lodash";
import type { LegacyUserBestScore, LegacyUserRecentScore } from "osu-web.js";

export class OsuUserButtons extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "osuUserButtons",
            event: "interactionCreate",
        });
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;
        if (
            !["best-user-beatmaps", "recent-user-beatmaps"].includes(
                interaction.customId
            )
        )
            return;

        const {
            emojis,
            games: { osu },
            util,
        } = this.container;

        const osUsername =
            interaction.message.embeds[0].author?.name?.split(" - ")[0];

        if (osUsername == null) return;

        const user = await osu.getUser({ u: osUsername, type: "string" });

        if (user == null)
            return interaction.reply({
                content: `**${osUsername} not found**`,
                ephemeral: true,
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
                ephemeral: true,
            });

        await interaction.deferReply({
            ephemeral: true,
        });

        const embeds: EmbedBuilder[] = [];

        for (let i = 0; i < maps.length; i++) {
            const score = maps[i];
            const beatmap = (await osu.getBeatmaps({ b: score.beatmap_id }))[0];
            embeds.push(
                util
                    .embed()
                    .setAuthor({
                        name: `${user.username}'s ${_.capitalize(
                            interaction.customId.split("-")[0]
                        )} Beatmaps`,
                        iconURL: `https://a.ppy.sh/${user.user_id}`,
                        url: `https://osu.ppy.sh/users/${user.user_id}`,
                    })
                    .setDescription(
                        `#${i + 1} ${util.embedURL(
                            `**${beatmap.artist}** - ${beatmap.title}`,
                            `https://osu.ppy.sh/beatmapsets/${beatmap.beatmapset_id}#osu/${beatmap.beatmap_id}`
                        )}\n**Score**: ${util.formatNumber(
                            score.score
                        )}\n**Rank**: ${
                            score.rank !== "F"
                                ? emojis.get(
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
                        text: `Map ${i + 1} of ${maps.length} `,
                    })
            );
        }

        return util.pagination.embeds(interaction, embeds);
    }
}
