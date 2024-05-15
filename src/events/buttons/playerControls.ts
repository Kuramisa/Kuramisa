import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { timedDelete } from "@utils";
import { useQueue } from "discord-player";
import { Interaction } from "discord.js";

@KEvent({
    event: "interactionCreate",
    description: "Manage player controls."
})
export default class PlayerControlsButtons extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isButton()) return;
        if (
            ![
                "player_goback_to",
                "player_previous",
                "player_next",
                "player_skip_to",
                "player_playpause",
                "player_shuffle",
                "player_queue",
                "player_progress",
                "player_loop",
                "player_volume_down",
                "player_volume_mute",
                "player_volume_up"
            ].includes(interaction.customId)
        )
            return;

        if (!interaction.guildId) return;

        const {
            kEmojis,
            systems: { music }
        } = this.client;

        const queue = useQueue(interaction.guildId);
        if (!queue)
            return interaction
                .reply({
                    content: `${kEmojis.get("no") ?? "🚫"} There is no music playing in this server`,
                    ephemeral: true
                })
                .then((i) => timedDelete(i));

        const { history } = queue;

        switch (interaction.customId) {
            case "player_goback_to": {
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy?.id !== interaction.user.id
                )
                    return interaction.reply({
                        content: `${kEmojis.get("no") ?? "🚫"} You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        ephemeral: true
                    });

                return music.askForGoBackTo(interaction, queue);
            }
            case "player_skip_to": {
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy?.id !== interaction.user.id
                )
                    return interaction.reply({
                        content: `${kEmojis.get("no") ?? "🚫"} You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        ephemeral: true
                    });

                return music.askForSkipTo(interaction, queue);
            }
            case "player_previous": {
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy?.id !== interaction.user.id
                )
                    return interaction.reply({
                        content: `${kEmojis.get("no") ?? "🚫"} You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        ephemeral: true
                    });

                const back = history
                    .back()
                    .then(() => true)
                    .catch(() => false);

                // TODO: Make sure to take repeat mode into account

                if (!back)
                    return interaction
                        .reply({
                            content: `${kEmojis.get("no") ?? "🚫"} There are no previous tracks in the queue`,
                            ephemeral: true
                        })
                        .then((i) => timedDelete(i));

                return interaction
                    .reply({
                        content: `${kEmojis.get("player_previous") ?? "⏪"} Went back to the previous track`,
                        ephemeral: true
                    })
                    .then((i) => timedDelete(i));
            }
            case "player_next": {
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy?.id !== interaction.user.id
                )
                    return interaction.reply({
                        content: `${kEmojis.get("no") ?? "🚫"} You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        ephemeral: true
                    });

                // TODO: Make sure to take repeat mode into account

                if (queue.tracks.size === 0) {
                    queue.node.stop();
                    return interaction
                        .reply({
                            content: `${kEmojis.get("no") ?? "🚫"} There are no more tracks in the queue, the player has been stopped`,
                            ephemeral: true
                        })
                        .then((i) => timedDelete(i));
                }

                queue.node.skip();
                return interaction
                    .reply({
                        content: `${kEmojis.get("player_skip") ?? "⏩"} Skipped the current track`,
                        ephemeral: true
                    })
                    .then((i) => timedDelete(i));
            }
            case "player_playpause": {
                if (!queue.currentTrack)
                    return interaction
                        .reply({
                            content: `${kEmojis.get("no") ?? "🚫"} There is no track playing in this server`,
                            ephemeral: true
                        })
                        .then((i) => timedDelete(i));

                queue.node.setPaused(!queue.node.isPaused());
                return interaction
                    .reply({
                        content: `**${
                            queue.node.isPaused()
                                ? `${kEmojis.get("player_pause") ?? "⏸️"} Paused`
                                : `${kEmojis.get("player_play") ?? "▶️"} Resumed`
                        }** the player`,
                        ephemeral: true
                    })
                    .then((i) => timedDelete(i));
            }
            case "player_shuffle":
                queue.tracks.shuffle();
                return interaction
                    .reply({
                        content: `${kEmojis.get("player_shuffle") ?? "🔀"} Shuffled the queue`,
                        ephemeral: true
                    })
                    .then((i) => timedDelete(i));
            case "player_queue":
                music.showQueue(interaction, queue);
                break;
            case "player_loop":
                music.askForLoopMode(interaction, queue);
                break;
            case "player_progress": {
                if (!queue.currentTrack)
                    return interaction
                        .reply({
                            content: `${kEmojis.get("no") ?? "🚫"}There is no track playing in this server`,
                            ephemeral: true
                        })
                        .then((i) => timedDelete(i));

                return interaction
                    .reply({
                        content:
                            queue.node.createProgressBar({ timecodes: true }) ??
                            "",
                        ephemeral: true
                    })
                    .then((i) => timedDelete(i));
            }
            case "player_volume_down":
                queue.node.setVolume(queue.node.volume - 5);
                return interaction
                    .reply({
                        content: `${music.volumeEmoji(queue.node.volume)} Volume set to **${queue.node.volume}%**`,
                        ephemeral: true
                    })
                    .then((i) => timedDelete(i, 2000));
            case "player_volume_mute":
                if (queue.node.volume === 0) queue.node.setVolume(50);
                else queue.node.setVolume(0);
                return interaction
                    .reply({
                        content: `**${music.volumeEmoji(queue.node.volume)} ${
                            queue.node.volume === 0 ? "Muted" : "Unmuted"
                        }** the player`,
                        ephemeral: true
                    })
                    .then((i) => timedDelete(i, 2000));
            case "player_volume_up":
                queue.node.setVolume(queue.node.volume + 5);
                return interaction
                    .reply({
                        content: `${music.volumeEmoji(queue.node.volume)} Volume set to **${queue.node.volume}%**`,
                        ephemeral: true
                    })
                    .then((i) => timedDelete(i, 2000));
        }
    }
}
