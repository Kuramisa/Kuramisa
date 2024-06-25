import { KButton, KRow } from "@builders";
import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { timedDelete } from "@utils";
import { QueueRepeatMode, useQueue } from "discord-player";
import { ButtonStyle, ComponentType, Interaction } from "discord.js";

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
                "player_lyrics",
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

                if (queue.repeatMode === QueueRepeatMode.TRACK) {
                    queue.node.seek(0);
                    return interaction
                        .reply({
                            content: `${kEmojis.get("player_previous") ?? "⏪"} Went back to the beginning of the track, since the track is in repeat mode`,
                            ephemeral: true
                        })
                        .then((i) => timedDelete(i));
                }

                const previous = await history
                    .previous(true)
                    .then(() => true)
                    .catch(() => false);

                // TODO: Make sure to take repeat mode into account

                if (!previous)
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
            case "player_lyrics":
                return interaction.reply({
                    content: `${kEmojis.get("no") ?? "🚫"} This feature is not available yet`,
                    ephemeral: true
                });
            case "player_next": {
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy?.id !== interaction.user.id
                )
                    return interaction.reply({
                        content: `${kEmojis.get("no") ?? "🚫"} You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        ephemeral: true
                    });

                if (queue.repeatMode === QueueRepeatMode.TRACK) {
                    queue.node.seek(0);
                    return interaction
                        .reply({
                            content: `${kEmojis.get("player_previous") ?? "⏪"} Went back to the beginning of the track, since the track is in repeat mode`,
                            ephemeral: true
                        })
                        .then((i) => timedDelete(i));
                }

                if (queue.tracks.size === 0) {
                    const buttons = new KRow().setComponents(
                        new KButton()
                            .setCustomId("i_am_sure")
                            .setLabel("I am sure")
                            .setStyle(ButtonStyle.Danger),
                        new KButton()
                            .setCustomId("cancel")
                            .setLabel("Cancel")
                            .setStyle(ButtonStyle.Secondary)
                    );
                    const nextInteraction = await interaction.reply({
                        content:
                            "There are no more tracks in the queue, the player will be stopped, are you sure? **(You have 15 seconds to respond)**",
                        ephemeral: true,
                        fetchReply: true,
                        components: [buttons]
                    });

                    const bInteraction = await nextInteraction
                        .awaitMessageComponent({
                            componentType: ComponentType.Button,
                            filter: (i) => i.user.id === interaction.user.id,
                            time: 15000
                        })
                        .catch(() => null);

                    if (!bInteraction)
                        return nextInteraction
                            .edit({
                                content: `${kEmojis.get("no") ?? "🚫"} You took too long to respond, the player will continue playing`,
                                components: []
                            })
                            .then((i) => timedDelete(i));

                    if (bInteraction.customId === "i_am_sure") {
                        queue.node.stop();
                        return bInteraction
                            .update({
                                content: `${kEmojis.get("no") ?? "🚫"} There are no more tracks in the queue, the player has been stopped`,
                                components: []
                            })
                            .then((i) => timedDelete(i));
                    }

                    return bInteraction
                        .update({
                            content: `${kEmojis.get("no") ?? "🚫"} The player will continue playing`,
                            components: []
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
