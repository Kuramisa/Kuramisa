import { Row, Button } from "@builders";
import { AbstractEvent, Event } from "classes/Event";
import { QueueRepeatMode, useQueue } from "discord-player";
import { ButtonStyle, ComponentType, Interaction } from "discord.js";
import { timedDelete } from "utils";

@Event({
    event: "interactionCreate",
    description: "Player controls buttons.",
})
export default class PlayerControlsButtons extends AbstractEvent {
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
                "player_stop",
                "player_queue",
                "player_lyrics",
                "player_progress",
                "player_loop",
                "player_volume_down",
                "player_volume_mute",
                "player_volume_up",
            ].includes(interaction.customId)
        )
            return;

        if (!interaction.inCachedGuild()) return;

        const {
            kEmojis: emojis,
            systems: { music },
        } = this.client;

        const { guild } = interaction;

        const queue = useQueue<QueueMetadata>(guild);
        if (!queue)
            return interaction
                .reply({
                    content: `${emojis.get("no") ?? "🚫"} There is no music playing in this server`,
                    flags: "Ephemeral",
                })
                .then((i) => timedDelete(i));

        const {
            history,
            metadata: { voiceChannel },
        } = queue;

        const { member } = interaction;

        if (
            !member.voice.channelId ||
            member.voice.channelId !== voiceChannel.id
        )
            return interaction.reply({
                content: `${emojis.get("no") ?? "🚫"} You need to be in the same voice channel as the bot to use the player controls`,
                flags: "Ephemeral",
            });

        switch (interaction.customId) {
            case "player_goback_to": {
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy &&
                    queue.currentTrack.requestedBy.id !== member.id &&
                    voiceChannel.members.get(queue.currentTrack.requestedBy.id)
                )
                    return interaction.reply({
                        content: `${emojis.get("no") ?? "🚫"} You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        flags: "Ephemeral",
                    });

                return music.askForGoBackTo(interaction, queue);
            }
            case "player_skip_to": {
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy &&
                    queue.currentTrack.requestedBy.id !== member.id &&
                    voiceChannel.members.get(queue.currentTrack.requestedBy.id)
                )
                    return interaction.reply({
                        content: `${emojis.get("no") ?? "🚫"} You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        flags: "Ephemeral",
                    });

                return music.askForSkipTo(interaction, queue);
            }
            case "player_previous": {
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy &&
                    queue.currentTrack.requestedBy.id !== member.id &&
                    voiceChannel.members.get(queue.currentTrack.requestedBy.id)
                )
                    return interaction.reply({
                        content: `${emojis.get("no") ?? "🚫"} You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        flags: "Ephemeral",
                    });

                if (queue.repeatMode === QueueRepeatMode.TRACK) {
                    queue.node.seek(0);
                    return interaction
                        .reply({
                            content: `${emojis.get("player_previous") ?? "⏪"} Went back to the beginning of the track, since the track is in repeat mode`,
                            flags: "Ephemeral",
                        })
                        .then((i) => timedDelete(i));
                }

                const previous = await history
                    .previous(true)
                    .then(() => true)
                    .catch(() => false);

                if (!previous)
                    return interaction
                        .reply({
                            content: `${emojis.get("no") ?? "🚫"} There are no previous tracks in the queue`,
                            flags: "Ephemeral",
                        })
                        .then((i) => timedDelete(i));

                return interaction
                    .reply({
                        content: `${emojis.get("player_previous") ?? "⏪"} Went back to the previous track`,
                        flags: "Ephemeral",
                    })
                    .then((i) => timedDelete(i));
            }
            case "player_lyrics":
                return interaction.reply({
                    content: `${emojis.get("no") ?? "🚫"} This feature is not available yet`,
                    flags: "Ephemeral",
                });
            case "player_next": {
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy &&
                    queue.currentTrack.requestedBy.id !== member.id &&
                    voiceChannel.members.get(queue.currentTrack.requestedBy.id)
                )
                    return interaction.reply({
                        content: `${emojis.get("no") ?? "🚫"} You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        flags: "Ephemeral",
                    });

                if (queue.repeatMode === QueueRepeatMode.TRACK) {
                    queue.node.seek(0);
                    return interaction
                        .reply({
                            content: `${emojis.get("player_previous") ?? "⏪"} Went back to the beginning of the track, since the track is in repeat mode`,
                            flags: "Ephemeral",
                        })
                        .then((i) => timedDelete(i));
                }

                if (queue.tracks.size === 0) {
                    const buttons = new Row().setComponents(
                        new Button()
                            .setCustomId("i_am_sure")
                            .setLabel("I am sure")
                            .setStyle(ButtonStyle.Danger),
                        new Button()
                            .setCustomId("cancel")
                            .setLabel("Cancel")
                            .setStyle(ButtonStyle.Secondary)
                    );

                    const nextInteraction = (
                        await interaction.reply({
                            content:
                                "There are no more tracks in the queue, the player will be stopped, are you sure? **(You have 15 seconds to respond)**",
                            withResponse: true,
                            flags: "Ephemeral",
                            components: [buttons],
                        })
                    ).resource?.message;

                    if (!nextInteraction) return;

                    const bInteraction = await nextInteraction
                        .awaitMessageComponent({
                            componentType: ComponentType.Button,
                            filter: (i) => i.user.id === member.id,
                            time: 15000,
                        })
                        .catch(() => null);

                    if (!bInteraction)
                        return nextInteraction
                            .edit({
                                content: `${emojis.get("no") ?? "🚫"} You took too long to respond, the player will continue playing`,
                                components: [],
                            })
                            .then((i) => timedDelete(i));

                    if (bInteraction.customId === "i_am_sure") {
                        queue.node.stop();
                        return bInteraction
                            .update({
                                content: `${emojis.get("no") ?? "🚫"} There are no more tracks in the queue, the player has been stopped`,
                                components: [],
                            })
                            .then((i) => timedDelete(i));
                    }

                    return bInteraction
                        .update({
                            content: `${emojis.get("no") ?? "🚫"} The player will continue playing`,
                            components: [],
                        })
                        .then((i) => timedDelete(i));
                }

                queue.node.skip();
                return interaction
                    .reply({
                        content: `${emojis.get("player_skip") ?? "⏩"} Skipped the current track`,
                        flags: "Ephemeral",
                    })
                    .then((i) => timedDelete(i));
            }
            case "player_playpause": {
                if (!queue.currentTrack)
                    return interaction
                        .reply({
                            content: `${emojis.get("no") ?? "🚫"} There is no track playing in this server`,
                            flags: "Ephemeral",
                        })
                        .then((i) => timedDelete(i));

                queue.node.setPaused(!queue.node.isPaused());
                return interaction
                    .reply({
                        content: `**${
                            queue.node.isPaused()
                                ? `${emojis.get("player_pause") ?? "⏸️"} Paused`
                                : `${emojis.get("player_play") ?? "▶️"} Resumed`
                        }** the player`,
                        flags: "Ephemeral",
                    })
                    .then((i) => timedDelete(i));
            }
            case "player_shuffle":
                queue.tracks.shuffle();
                return interaction
                    .reply({
                        content: `${emojis.get("player_shuffle") ?? "🔀"} Shuffled the queue`,
                        flags: "Ephemeral",
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
                            content: `${emojis.get("no") ?? "🚫"} There is no track playing in this server`,
                            flags: "Ephemeral",
                        })
                        .then((i) => timedDelete(i));

                return interaction
                    .reply({
                        content:
                            queue.node.createProgressBar({ timecodes: true }) ??
                            "",
                        flags: "Ephemeral",
                    })
                    .then((i) => timedDelete(i));
            }
            case "player_volume_down":
                queue.node.setVolume(queue.node.volume - 5);
                return interaction
                    .reply({
                        content: `${music.volumeEmoji(queue.node.volume)} Volume set to **${queue.node.volume}%**`,
                        flags: "Ephemeral",
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
                        flags: "Ephemeral",
                    })
                    .then((i) => timedDelete(i, 2000));
            case "player_volume_up":
                queue.node.setVolume(queue.node.volume + 5);
                return interaction
                    .reply({
                        content: `${music.volumeEmoji(queue.node.volume)} Volume set to **${queue.node.volume}%**`,
                        flags: "Ephemeral",
                    })
                    .then((i) => timedDelete(i, 2000));
            case "player_stop":
                queue.clear();
                queue.node.stop();
                return interaction
                    .reply({
                        content: `${emojis.get("player_stop") ?? "⏹️"} Stopped the player`,
                        flags: "Ephemeral",
                    })
                    .then((i) => timedDelete(i));
        }
    }
}
