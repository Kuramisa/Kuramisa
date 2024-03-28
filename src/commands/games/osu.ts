import { Command } from "@sapphire/framework";
import { ButtonStyle } from "discord.js";
import moment from "moment";
import { time } from "@discordjs/builders";
import { flag } from "country-emoji";

export class OsuCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "osu",
            description: "Osu! Helper",
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
                        .setName("osu_player")
                        .setDescription("Osu! Player Username")
                        .setRequired(true)
                )
        );
    }

    /**
     * Execute Slash Command
     */
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const {
            games: { osu },
            emojis,
            util,
        } = this.container;

        const player = interaction.options.getString("osu_player", true);

        const user = await osu.getUser({
            u: player,
            type: "string",
        });

        if (!user)
            return interaction.reply({
                content: "Player not found",
                ephemeral: true,
            });

        const embed = util
            .embed()
            .setAuthor({
                name: `${user.username} - Level: ${Math.round(user.level)}`,
                iconURL: `https://a.ppy.sh/${user.user_id}`,
                url: `https://osu.ppy.sh/users/${user.user_id}`,
            })
            .setThumbnail(`https://a.ppy.sh/${user.user_id}`)
            .setDescription(
                `${emojis.get("osu_accuracy")} **Accuracy**: ${Math.round(
                    user.accuracy
                )}\n${emojis.get("osu_music")} **Time Played**: ${util.msToDur(
                    user.total_seconds_played
                )}\n${emojis.get("osu_beatmap")} **Total Plays**: ${
                    user.playcount
                }\n${emojis.get("osu_calendar")} **Joined**: ${time(
                    moment(user.join_date).unix()
                )} (${time(
                    moment(user.join_date).unix(),
                    "R"
                )})\n\n${emojis.get("osu_rankings")} ***Ranks***\n- **${flag(
                    user.country
                )} Country Rank**: ${user.pp_country_rank}\n- **${emojis.get(
                    "osu_globe"
                )} Global**: ${user.pp_rank}\n\n***Plays***\n- **${emojis.get(
                    "osu_sshgrade"
                )} SS Perfect**: ${user.count_rank_ssh}\n- **${emojis.get(
                    "osu_ssgrade"
                )} SS**: ${user.count_rank_ss}\n- **${emojis.get(
                    "osu_shgrade"
                )} S Perfect**: ${user.count_rank_sh}\n- **${emojis.get(
                    "osu_sgrade"
                )} S**: ${user.count_rank_s}\n- **${emojis.get(
                    "osu_agrade"
                )} A**: ${user.count_rank_a}`
            );

        const row = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("best-user-beatmaps")
                    .setLabel("Best Beatmaps")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("🔥"),
                util
                    .button()
                    .setCustomId("recent-user-beatmaps")
                    .setLabel("Recent Beatmaps")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("📜")
            );

        await interaction.reply({
            embeds: [embed],
            components: [row],
        });
    }
}
