import { Command } from "@sapphire/framework";
import { ButtonStyle, GuildMember, TextInputStyle } from "discord.js";

const { version } = require("../../../package.json");

export class AnnounceCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "announce",
            description: "Announce bot changes to Server Owners",
            preconditions: ["OwnerOnly"]
        });
    }

    /**
     * Register Slash Command
     */
    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder.setName(this.name).setDescription(this.description)
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { client, database, logger, util } = this.container;
        const { user } = interaction;

        const modal = util
            .modal()
            .setCustomId("announce-modal")
            .setTitle("Announcing Bot Changes to users")
            .setComponents(
                util
                    .modalRow()
                    .setComponents(
                        util
                            .input()
                            .setCustomId("announcement-text")
                            .setLabel("Announcement")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({
            time: 0,
            filter: (i) => i.customId === "announce-modal"
        });

        await mInteraction.deferReply({ ephemeral: true });

        const text = `${mInteraction.fields.getTextInputValue(
            "announcement-text"
        )}`;

        const owners: GuildMember[] = [];

        for (const guild of client.guilds.cache.toJSON()) {
            const owner = await guild.fetchOwner();

            if (!owners.some((owner2) => owner2.id === owner.id))
                owners.push(await guild.fetchOwner());
        }

        const embed = util
            .embed()
            .setAuthor({
                name: user.username,
                iconURL: user.displayAvatarURL({ extension: "gif" })
            })
            .setTitle("Announcement from The Developers")
            .setDescription(
                `${text}\n\n*This is from the official developers and will not be used to spam the users*\n**Disclaimer: If you encounter any bugs or unresponsiveness, please DM me directly or use </reportbug:1117262898528522311>**\n**If you have some suggestions please use </suggest:1117263868465520690>**\n*To disable this notification, use </notifications:1067525395685048413> command*\n\n- Sent by ${user}\n- **${client.user?.username} ${version}**`
            );

        const row = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("dismiss-announcement")
                    .setLabel("Dismiss")
                    .setStyle(ButtonStyle.Danger)
            );

        for (const owner of owners) {
            const db = await database.users.fetch(owner.user.id);

            if (!db.notifications.botAnnouncements) continue;

            await owner
                .send({ embeds: [embed], components: [row] })
                .catch((err) => logger.error(err.message));
        }

        await mInteraction.editReply({ content: "Announcement sent" });
    }
}
