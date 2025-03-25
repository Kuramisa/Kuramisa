import type { GuildQueueEvent, PlayerEvent } from "discord-player";
import type {
    Events as DjsEvents,
    GatewayDispatchEvents,
    RESTEvents,
} from "discord.js";

// Typings from discord-logs package (prefix DL)
export type DLChannelEvents =
    | "guildChannelPermissionsUpdate"
    | "guildChannelTopicUpdate"
    | "unhandledGuildChannelUpdate";

export type DLGuildMemberEvents =
    | "guildMemberBoost"
    | "guildMemberUnboost"
    | "guildMemberRoleAdd"
    | "guildMemberRoleRemove"
    | "guildMemberNicknameUpdate"
    | "guildMemberEntered"
    | "unhandledGuildMemberUpdate";

export type DLGuildEvents =
    | "guildBoostLevelUp"
    | "guildBoostLevelDown"
    | "guildBannerAdd"
    | "guildAfkChannelAdd"
    | "guildVanityURLAdd"
    | "guildVanityURLRemove"
    | "guildVanityURLUpdate"
    | "guildFeaturesUpdate"
    | "guildAcronymUpdate"
    | "guildOwnerUpdate"
    | "guildPartnerAdd"
    | "guildPartnerRemove"
    | "guildVerificationAdd"
    | "guildVerificationRemove"
    | "unhandledGuildUpdate";

export type DLMessageEvents =
    | "messagePinned"
    | "messageContentEdited"
    | "unhandledMessageUpdate";

export type DLPresenceEvents =
    | "guildMemberOffline"
    | "guildMemberOnline"
    | "unhandledPresenceUpdate";

export type DLRoleEvents =
    | "rolePositionUpdate"
    | "rolePermissionsUpdate"
    | "unhandledRoleUpdate";

export type DLThreadChannelEvents =
    | "threadStateUpdate"
    | "threadNameUpdate"
    | "threadLockStateUpdate"
    | "threadRateLimitPerUserUpdate"
    | "threadAutoArchiveDurationUpdate"
    | "unhandledThreadUpdate";

export type DLUserEvents =
    | "userAvatarUpdate"
    | "userUsernameUpdate"
    | "userDiscriminatorUpdate"
    | "userFlagsUpdate"
    | "unhandledUserUpdate";

export type DLVoiceChannelEvents =
    | "voiceChannelJoin"
    | "voiceChannelLeave"
    | "voiceChannelSwitch"
    | "voiceChannelMute"
    | "voiceChannelUnmute"
    | "voiceChannelDeaf"
    | "voiceChannelUndeaf"
    | "voiceStreamingStart"
    | "voiceStreamingStop"
    | "unhandledVoiceChannelUpdate";

export type DLEvents =
    | DLChannelEvents
    | DLGuildMemberEvents
    | DLGuildEvents
    | DLMessageEvents
    | DLPresenceEvents
    | DLRoleEvents
    | DLThreadChannelEvents
    | DLUserEvents
    | DLVoiceChannelEvents;

export type ProcessEvents =
    | "exit"
    | "beforeExit"
    | "disconnect"
    | "message"
    | "uncaughtException"
    | "unhandledRejection"
    | NodeJS.Signals; // Includes "SIGINT", "SIGTERM", etc.

export type ClientEvents = `${DjsEvents}` | `${DLEvents}`;

export type Events =
    | `${ProcessEvents}`
    | `${ClientEvents}`
    | `${GatewayDispatchEvents}`
    | `${RESTEvents}`
    | `${PlayerEvent}`
    | `${GuildQueueEvent}`;

export type Emitters =
    | "client"
    | "rest"
    | "gateway"
    | "process"
    | "music-player"
    | "music-queue";
