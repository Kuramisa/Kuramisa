import { container } from "@sapphire/framework";
import type { IUser } from "@schemas/User";
import { ButtonStyle, type GuildMember, type PresenceStatus } from "discord.js";

export default class UtilMember {
    actionRow(executor: GuildMember, target: GuildMember) {
        const { util } = container;

        const topRow = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("show_rank")
                    .setLabel("Rank")
                    .setStyle(ButtonStyle.Secondary)
            );

        const midRow = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("kick_member")
                    .setLabel("Kick Member")
                    .setStyle(ButtonStyle.Danger),
                util
                    .button()
                    .setCustomId("ban_member")
                    .setLabel("Ban Member")
                    .setStyle(ButtonStyle.Danger),
                util
                    .button()
                    .setCustomId("report_member")
                    .setLabel("Report Member")
                    .setStyle(ButtonStyle.Danger),
                util
                    .button()
                    .setCustomId("warn_member")
                    .setLabel("Warn Member")
                    .setStyle(ButtonStyle.Danger)
            );

        const bottomRow = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("show_warns")
                    .setLabel("Show Warns")
                    .setStyle(ButtonStyle.Primary),
                util
                    .button()
                    .setCustomId("show_reports")
                    .setLabel("Show Reports")
                    .setStyle(ButtonStyle.Primary)
            );

        return executor.id === target.id
            ? [topRow]
            : executor.permissions.has("ViewAuditLog")
            ? [topRow, midRow, bottomRow]
            : [
                  topRow.addComponents(
                      util
                          .button()
                          .setCustomId("report_member")
                          .setLabel("Report Member")
                          .setStyle(ButtonStyle.Danger)
                  ),
              ];
    }

    statusColor(status?: PresenceStatus) {
        switch (status) {
            case "online":
                return "#43B581";
            case "dnd":
                return "#F04747";
            case "idle":
                return "#FAA61A";
            case "offline":
            case "invisible":
            default:
                return "#747F8E";
        }
    }

    statusEmoji(status?: PresenceStatus) {
        switch (status) {
            case "online":
                return ":green_circle:";
            case "dnd":
                return ":red_circle:";
            case "idle":
                return ":yellow_circle:";
            case "offline":
            case "invisible":
            default:
                return ":white_circle:";
        }
    }

    async getCardData(user: IUser) {
        const {
            systems: { xp },
        } = container;

        const neededXP = xp.calculateReqXP(user.level);

        const rank = await this.getRank(user);

        return {
            rank,
            card: user.card,
            level: user.level,
            currentXP: user.xp,
            neededXP,
        };
    }

    async getRanks() {
        const users = await container.database.users.fetchAll();
        const sorted = users.sort((a, b) => b.xp - a.xp);

        return sorted.map((u, i) => ({
            id: u.id,
            xp: u.xp,
            rank: i + 1,
        }));
    }

    async getRank(user: IUser) {
        return (await this.getRanks()).find((u) => u.id === user.id)?.rank;
    }
}
