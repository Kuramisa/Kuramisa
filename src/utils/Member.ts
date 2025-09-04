import { Button, Row } from "@builders";
import { ButtonStyle, type GuildMember, type PresenceStatus } from "discord.js";

export const memberActions = (executor: GuildMember, target: GuildMember) => {
    const midRow = new Row();

    if (executor.permissions.has("KickMembers") && target.kickable)
        midRow.addComponents(
            new Button()
                .setCustomId("kick_member")
                .setLabel("Kick Member")
                .setStyle(ButtonStyle.Danger),
        );

    if (executor.permissions.has("BanMembers") && target.bannable)
        midRow.addComponents(
            new Button()
                .setCustomId("ban_member")
                .setLabel("Ban Member")
                .setStyle(ButtonStyle.Danger),
        );

    const rowsToShow = [];

    if (midRow.components.length > 0) rowsToShow.push(midRow);

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
