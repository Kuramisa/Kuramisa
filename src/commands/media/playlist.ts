import { AttachmentOption, StringOption } from "@builders";
import bucket from "AssetManagement";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import { bold, ChatInputCommandInteraction, SnowflakeUtil } from "discord.js";
import { imageToBuffer } from "utils";

@SlashCommand({
    name: "playlist",
    description: "Create/Manage playlists hosted by the bot",
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
    ],
})
export default class PlaylistCommand extends AbstractSlashCommand {
    async slashCreate(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;
        const { managers } = this.client;

        const db = await managers.users.get(user.id);

        let playlistName = options.getString("playlist_name", true);

        const similarNames = db.playlists.filter((p) =>
            p.name.toLowerCase().includes(playlistName.toLowerCase())
        );

        if (similarNames.length > 0)
            playlistName = `${playlistName} (${similarNames.length + 1})`; // Append a number to the name

        const playlist: Playlist = {
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
            const url = await bucket.upload(
                buffer,
                `playlist/${user.id}/${playlist.id}.${mimeType.split("/")[1]}`,
                {},
                mimeType
            );

            playlist.cover = url.publicUrls[0];
        }

        db.playlists.push(playlist);
        await db.save();

        interaction.reply({
            content: `Playlist ${bold(playlist.name)} has been created!`,
            flags: "Ephemeral",
        });
    }
}
