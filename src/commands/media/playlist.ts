import {
    Attachment,
    AttachmentOption,
    IntegerOption,
    Modal,
    ModalRow,
    StringOption,
    TextInput,
} from "@builders";
import bucket from "AssetManagement";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ApplicationIntegrationType,
    bold,
    ChatInputCommandInteraction,
    InteractionContextType,
    SnowflakeUtil,
} from "discord.js";
import { capitalize } from "lodash";
import { imageToBuffer } from "utils";

// TODO: Finish working on the playlist system
@SlashCommand({
    name: "playlist",
    description: "Create/Manage playlists hosted by the bot",
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    contexts: [
        InteractionContextType.BotDM,
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ],
    subcommands: [
        {
            name: "create",
            description: "Create a new playlist",
            options: [
                new StringOption()
                    .setName("playlist_name")
                    .setDescription("The name of the playlist"),
                new StringOption()
                    .setName("playlist_description")
                    .setDescription("The description of the playlist")
                    .setRequired(false),
                new AttachmentOption()
                    .setName("playlist_cover")
                    .setDescription("The cover image of the playlist")
                    .setRequired(false),
            ],
        },
        {
            name: "delete",
            description: "Delete a playlist",
            options: [
                new StringOption()
                    .setName("playlist_name")
                    .setDescription("The name of the playlist")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "edit",
            description: "Edit a playlist metadata",
            options: [
                new StringOption()
                    .setName("playlist_name")
                    .setDescription("The name of the playlist")
                    .setAutocomplete(true),
                new StringOption()
                    .setName("playlist_description")
                    .setDescription("The description of the playlist")
                    .setRequired(false),
                new AttachmentOption()
                    .setName("playlist_cover")
                    .setDescription("The cover image of the playlist")
                    .setRequired(false),
                new StringOption()
                    .setName("new_playlist_name")
                    .setDescription("The new name of the playlist")
                    .setRequired(false),
            ],
        },
        {
            name: "import",
            description: "Import a playlist from a URL",
            options: [
                new StringOption()
                    .setName("playlist_url")
                    .setDescription("The URL of the playlist")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "import-combine",
            description:
                "Import a playlist and combine it with an existing playlist",
            options: [
                new StringOption()
                    .setName("playlist_name")
                    .setDescription("The name of the playlist to combine with")
                    .setAutocomplete(true),
                new StringOption()
                    .setName("playlist_url")
                    .setDescription("The URL of the playlist")
                    .setAutocomplete(true),
            ],
        },
        {
            name: "import-multiple",
            description: "Import multiple playlists from URLs",
            options: [
                new IntegerOption()
                    .setName("playlist_count")
                    .setDescription("The number of playlists to import (max 5)")
                    .setMinValue(1)
                    .setMaxValue(5),
            ],
        },
        {
            name: "import-multiple-combine",
            description: "Import multiple playlists and combine them",
            options: [
                new StringOption()
                    .setName("playlist_name")
                    .setDescription("The name of the playlist to combine with")
                    .setAutocomplete(true),
                new IntegerOption()
                    .setName("playlist_count")
                    .setDescription("The number of playlists to import (max 5)")
                    .setMinValue(1)
                    .setMaxValue(5),
            ],
        },
    ],
})
export default class PlaylistCommand extends AbstractSlashCommand {
    async slashCreate(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const db = await this.client.managers.users.get(user.id);

        let playlistName = options.getString("playlist_name", true);

        const similarNames = db.playlists.filter((p) =>
            p.name.toLowerCase().includes(playlistName.toLowerCase())
        );

        if (similarNames.length > 0)
            playlistName = `${playlistName} (${similarNames.length + 1})`; // Append a number to the name

        const playlist: UserPlaylist = {
            id: SnowflakeUtil.generate().toString(),
            name: playlistName,
            tracks: [],
        };

        const playlistDescription = options.getString("playlist_description");
        if (playlistDescription) playlist.description = playlistDescription;

        const playlistCover = options.getAttachment("playlist_cover");
        if (playlistCover) {
            if (!playlistCover.contentType?.includes("image"))
                return interaction.reply({
                    content: bold("The cover image must be an image file"),
                    flags: "Ephemeral",
                });

            const allowedMimeTypes = [
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/gif",
            ];

            if (!allowedMimeTypes.includes(playlistCover.contentType))
                return interaction.reply({
                    content: bold(
                        "The cover image must be a PNG, JPEG, JPG or GIF file"
                    ),
                    flags: "Ephemeral",
                });

            const buffer = await imageToBuffer(playlistCover.url);
            const mimeType = playlistCover.contentType;

            const objectKey = `playlist/${user.id}/${playlist.id}.${mimeType.split("/")[1]}`;

            const url = await bucket.upload(buffer, objectKey, {}, mimeType);

            playlist.cover = {
                url: url.publicUrls[0],
                key: objectKey,
            };
        }

        db.playlists.push(playlist);
        await db.save();

        interaction.reply({
            content: `Playlist ${bold(playlist.name)} has been created!${playlist.description ? `\n**Description**: ${playlist.description}` : ""}`,
            flags: "Ephemeral",
            files:
                playlist.cover && playlist.cover.url
                    ? [
                          new Attachment(playlist.cover.url, {
                              name: "cover.png",
                          }),
                      ]
                    : [],
        });
    }

    async slashDelete(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;
        const { managers } = this.client;

        const db = await managers.users.get(user.id);

        const playlistIdOrName = options.getString("playlist_name", true);

        const playlist = db.playlists.find(
            (p) =>
                p.name.toLowerCase() === playlistIdOrName.toLowerCase() ||
                p.id === playlistIdOrName
        );

        if (!playlist)
            return interaction.reply({
                content: bold("Playlist not found"),
                flags: "Ephemeral",
            });

        if (playlist.cover?.key) await bucket.deleteObject(playlist.cover.key);

        db.playlists = db.playlists.filter((p) => p.id !== playlist.id);

        await db.save();

        interaction.reply({
            content: `Playlist ${bold(playlist.name)} has been deleted!`,
            flags: "Ephemeral",
        });
    }

    async slashEdit(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const db = await this.client.managers.users.get(user.id);

        const playlistIdOrName = options.getString("playlist_name", true);

        const playlist = db.playlists.find(
            (p) =>
                p.name.toLowerCase() === playlistIdOrName.toLowerCase() ||
                p.id === playlistIdOrName
        );

        if (!playlist)
            return interaction.reply({
                content: bold("Playlist not found"),
                flags: "Ephemeral",
            });

        const newPlaylistName = options.getString("new_playlist_name");
        const newPlaylistDescription = options.getString(
            "playlist_description"
        );
        const newPlaylistCover = options.getAttachment("playlist_cover");

        if (!newPlaylistName && !newPlaylistDescription && !newPlaylistCover)
            return interaction.reply({
                content: bold("No changes detected"),
                flags: "Ephemeral",
            });

        if (newPlaylistName) {
            const similarNames = db.playlists.filter((p) =>
                p.name.toLowerCase().includes(newPlaylistName.toLowerCase())
            );

            if (similarNames.length > 0)
                playlist.name = `${newPlaylistName} (${similarNames.length + 1})`; // Append a number to the name
            else playlist.name = newPlaylistName;
        }

        if (newPlaylistDescription)
            playlist.description = newPlaylistDescription;

        if (newPlaylistCover) {
            if (!newPlaylistCover.contentType?.includes("image"))
                return interaction.reply({
                    content: bold("The cover image must be an image file"),
                    flags: "Ephemeral",
                });

            const allowedMimeTypes = [
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/gif",
            ];

            if (!allowedMimeTypes.includes(newPlaylistCover.contentType))
                return interaction.reply({
                    content: bold(
                        "The cover image must be a PNG, JPEG, JPG or GIF file"
                    ),
                    flags: "Ephemeral",
                });

            if (playlist.cover?.key)
                await bucket.deleteObject(playlist.cover.key);

            const buffer = await imageToBuffer(newPlaylistCover.url);
            const mimeType = newPlaylistCover.contentType;

            const objectKey = `playlist/${user.id}/${playlist.id}.${mimeType.split("/")[1]}`;

            const url = await bucket.upload(buffer, objectKey, {}, mimeType);

            playlist.cover = {
                url: url.publicUrls[0],
                key: objectKey,
            };
        }

        db.markModified("playlists");
        await db.save();

        interaction.reply({
            content: `Playlist ${bold(playlist.name)} has been updated!${playlist.description ? `\n**Description**: ${playlist.description}` : ""}`,
            flags: "Ephemeral",
            files:
                playlist.cover && playlist.cover.url
                    ? [
                          new Attachment(playlist.cover.url, {
                              name: "cover.png",
                          }),
                      ]
                    : [],
        });
    }

    async slashImport(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;
        const {
            managers,
            systems: { music },
        } = this.client;

        const url = options.getString("playlist_url", true);

        const result = await music.search(url);

        if (!result.playlist)
            return interaction.reply({
                content: bold("No playlist found"),
                flags: "Ephemeral",
            });

        const { playlist } = result;

        const db = await managers.users.get(user.id);

        const { playlists } = db;

        const similarNames = playlists.filter((p) =>
            p.name.toLowerCase().includes(playlist.title.toLowerCase())
        );

        let playlistName = playlist.title;

        if (similarNames.length > 0)
            playlistName = `${playlist.title} (${similarNames.length + 1})`; // Append a number to the name

        const tracks: PlaylistTrack[] = playlist
            .toJSON()
            .tracks.map((track) => ({
                id: track.id,
                title: track.title,
                description: track.description,
                author: track.author,
                url: track.url,
                thumbnail: track.thumbnail,
                duration: track.duration,
                durationMS: track.durationMS,
                views: track.views,
            }));

        const newPlaylist: UserPlaylist = {
            id: SnowflakeUtil.generate().toString(),
            name: playlistName,
            tracks,
            description:
                playlist.description && playlist.description !== playlist.title
                    ? playlist.description
                    : undefined,
            cover: {
                url: playlist.thumbnail,
            },
        };

        db.playlists.push(newPlaylist);
        db.markModified("playlists");
        await db.save();

        interaction.reply({
            content: `${capitalize(playlist.type)} ${bold(newPlaylist.name)} has been imported from ${capitalize(playlist.source)}!${playlist.description && playlist.description !== playlist.title ? `\n**Description**: ${newPlaylist.description}` : ""}`,
            flags: "Ephemeral",
            files:
                newPlaylist.cover && newPlaylist.cover.url
                    ? [
                          new Attachment(newPlaylist.cover.url, {
                              name: "cover.png",
                          }),
                      ]
                    : [],
        });
    }

    async slashImportCombine(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;
        const {
            managers,
            systems: { music },
        } = this.client;

        const db = await managers.users.get(user.id);

        const playlistIdOrName = options.getString("playlist_name", true);

        const playlist = db.playlists.find(
            (p) =>
                p.name.toLowerCase() === playlistIdOrName.toLowerCase() ||
                p.id === playlistIdOrName
        );

        if (!playlist)
            return interaction.reply({
                content: bold("Playlist not found"),
                flags: "Ephemeral",
            });

        const url = options.getString("playlist_url", true);

        const result = await music.search(url);

        if (!result.playlist)
            return interaction.reply({
                content: bold("No playlist found"),
                flags: "Ephemeral",
            });

        const { playlist: resultPlaylist } = result;

        const tracks: PlaylistTrack[] = resultPlaylist
            .toJSON()
            .tracks.map((track) => ({
                id: track.id,
                title: track.title,
                description: track.description,
                author: track.author,
                url: track.url,
                thumbnail: track.thumbnail,
                duration: track.duration,
                durationMS: track.durationMS,
                views: track.views,
            }));

        playlist.tracks.push(...tracks);

        db.markModified("playlists");
        await db.save();

        interaction.reply({
            content: `Playlist ${bold(playlist.name)} has been combined with ${capitalize(resultPlaylist.type)} ${bold(resultPlaylist.title)}!`,
            flags: "Ephemeral",
            files:
                playlist.cover && playlist.cover.url
                    ? [
                          new Attachment(playlist.cover.url, {
                              name: "cover.png",
                          }),
                      ]
                    : [],
        });
    }

    async slashImportMultiple(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const playlistCount = options.getInteger("playlist_count", true);

        const rows = [];

        for (let i = 1; i <= playlistCount; i++) {
            const row = new ModalRow().setComponents(
                new TextInput()
                    .setLabel(`Playlist ${i} URL`)
                    .setPlaceholder("Enter the URL of the playlist to import")
                    .setCustomId(`playlist_url_${i}`)
            );

            rows.push(row);
        }

        const modal = new Modal()
            .setCustomId("import_multiple_playlists")
            .setTitle(`Importing ${playlistCount} Playlists`)
            .setComponents(rows);

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({
            time: 0,
        });

        await mInteraction.reply({
            content: bold("Working on it... Don't dismiss the message yet!"),
            flags: "Ephemeral",
        });

        const { fields } = mInteraction.fields;

        let allArePlaylists = true;

        const searchedPlaylists = [];

        for (const field of fields.values()) {
            const url = field.value;
            const result = await this.client.systems.music.search(url);

            if (!result.playlist) {
                allArePlaylists = false;
                break;
            }

            searchedPlaylists.push(result.playlist);
        }

        if (!allArePlaylists)
            return mInteraction.editReply({
                content: bold(
                    "Uh oh, Some of the URLs provided are not playlists"
                ),
            });

        const { user } = interaction;

        const db = await this.client.managers.users.get(user.id);

        const { playlists } = db;

        for (const playlist of searchedPlaylists) {
            const similarNames = playlists.filter((p) =>
                p.name.toLowerCase().includes(playlist.title.toLowerCase())
            );

            let playlistName = playlist.title;

            if (similarNames.length > 0)
                playlistName = `${playlist.title} (${similarNames.length + 1})`; // Append a number to the name

            const tracks: PlaylistTrack[] = playlist
                .toJSON()
                .tracks.map((track) => ({
                    id: track.id,
                    title: track.title,
                    description: track.description,
                    author: track.author,
                    url: track.url,
                    thumbnail: track.thumbnail,
                    duration: track.duration,
                    durationMS: track.durationMS,
                    views: track.views,
                }));

            const newPlaylist: UserPlaylist = {
                id: SnowflakeUtil.generate().toString(),
                name: playlistName,
                tracks,
                description:
                    playlist.description &&
                    playlist.description !== playlist.title
                        ? playlist.description
                        : undefined,
                cover: {
                    url: playlist.thumbnail,
                },
            };

            db.playlists.push(newPlaylist);
        }

        db.markModified("playlists");
        await db.save();

        mInteraction.editReply({
            content: `**${playlistCount}** playlists have been imported!\n\n${searchedPlaylists
                .map(
                    (p) =>
                        `• ${capitalize(p.type)} ${bold(p.title)} from ${capitalize(p.source)}`
                )
                .join("\n")}`,
        });
    }

    async slashImportMultipleCombine(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;
        const {
            managers,
            systems: { music },
        } = this.client;

        const db = await managers.users.get(user.id);

        const playlistIdOrName = options.getString("playlist_name", true);

        const playlist = db.playlists.find(
            (p) =>
                p.name.toLowerCase() === playlistIdOrName.toLowerCase() ||
                p.id === playlistIdOrName
        );

        if (!playlist)
            return interaction.reply({
                content: bold("Playlist not found"),
                flags: "Ephemeral",
            });

        const playlistCount = options.getInteger("playlist_count", true);

        const rows = [];

        for (let i = 1; i <= playlistCount; i++) {
            const row = new ModalRow().setComponents(
                new TextInput()
                    .setLabel(`Playlist ${i} URL`)
                    .setPlaceholder("Enter the URL of the playlist to import")
                    .setCustomId(`playlist_url_${i}`)
            );

            rows.push(row);
        }

        const modal = new Modal()
            .setCustomId("import_multiple_playlists_combine")
            .setTitle(`Importing ${playlistCount} Playlists`)
            .setComponents(rows);

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({
            time: 0,
        });

        await mInteraction.reply({
            content: bold("Working on it... Don't dismiss the message yet!"),
            flags: "Ephemeral",
        });

        const { fields } = mInteraction.fields;

        let allArePlaylists = true;

        const searchedPlaylists = [];

        for (const field of fields.values()) {
            const url = field.value;
            const result = await music.search(url);

            if (!result.playlist) {
                allArePlaylists = false;
                break;
            }

            searchedPlaylists.push(result.playlist);
        }

        if (!allArePlaylists)
            return mInteraction.editReply({
                content: bold(
                    "Uh oh, Some of the URLs provided are not playlists"
                ),
            });

        for (const searchedPlaylist of searchedPlaylists) {
            const tracks: PlaylistTrack[] = searchedPlaylist
                .toJSON()
                .tracks.map((track) => ({
                    id: track.id,
                    title: track.title,
                    description: track.description,
                    author: track.author,
                    url: track.url,
                    thumbnail: track.thumbnail,
                    duration: track.duration,
                    durationMS: track.durationMS,
                    views: track.views,
                }));

            playlist.tracks.push(...tracks);
        }

        db.markModified("playlists");
        await db.save();

        mInteraction.editReply({
            content: `**${playlistCount}** playlists have been combined with ${bold(playlist.name)}!`,
            files:
                playlist.cover && playlist.cover.url
                    ? [
                          new Attachment(playlist.cover.url, {
                              name: "cover.png",
                          }),
                      ]
                    : [],
        });
    }
}
