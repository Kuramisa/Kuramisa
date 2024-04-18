import { Subcommand } from "@sapphire/plugin-subcommands";

export class MusicCommand extends Subcommand {
    constructor(ctx: Subcommand.LoaderContext, opts: Subcommand.Options) {
        super(ctx, {
            ...opts,
            name: "music",
            description: "Music System for your server",
            subcommands: [
                {
                    name: "play",
                    chatInputRun: "slashPlay"
                }
            ]
        });
    }

    override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) =>
                    command
                        .setName("play")
                        .setDescription("Play a song")
                        .addStringOption((option) =>
                            option
                                .setName("track_or_playlist_url")
                                .setDescription("The track or playlist URL")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
        );
    }
}
