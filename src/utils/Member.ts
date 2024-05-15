import { KRow, KButton } from "@builders";
import { ButtonStyle, GuildMember, PresenceStatus } from "discord.js";

export const memberActions = (executor: GuildMember, target: GuildMember) => {
    const topRow = new KRow().setComponents(
        new KButton().setCustomId("show_rank").setLabel("Rank")
    );

    const midRow = new KRow();

    if (executor.permissions.has("KickMembers") && target.kickable)
        midRow.addComponents(
            new KButton()
                .setCustomId("kick_member")
                .setLabel("Kick Member")
                .setStyle(ButtonStyle.Danger)
        );

    if (executor.permissions.has("BanMembers") && target.bannable)
        midRow.addComponents(
            new KButton()
                .setCustomId("ban_member")
                .setLabel("Ban Member")
                .setStyle(ButtonStyle.Danger)
        );

    if (executor.permissions.has("ModerateMembers"))
        midRow.addComponents(
            new KButton()
                .setCustomId("warn_member")
                .setLabel("Warn Member")
                .setStyle(ButtonStyle.Danger)
        );

    const bottomRow = new KRow();

    if (executor.permissions.has("ViewAuditLog"))
        bottomRow.addComponents(
            new KButton()
                .setCustomId("show_warns")
                .setLabel("Show Warns")
                .setStyle(ButtonStyle.Primary)
        );

    if (executor.id === target.id) return [topRow];

    const rowsToShow = [];

    if (topRow.components.length > 0) rowsToShow.push(topRow);
    if (midRow.components.length > 0) rowsToShow.push(midRow);
    if (bottomRow.components.length > 0) rowsToShow.push(bottomRow);

    return rowsToShow;
};

export const statusColor = (status?: PresenceStatus) => {
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
};

export const statusEmoji = (status?: PresenceStatus) => {
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
};

export const statusText = (status?: PresenceStatus) => {
    switch (status) {
        case "online":
            return "Online";
        case "dnd":
            return "Do Not Disturb";
        case "idle":
            return "Idle";
        case "offline":
        case "invisible":
        default:
            return "Offline";
    }
};
