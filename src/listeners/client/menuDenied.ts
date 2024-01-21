import {
    type ContextMenuCommandDeniedPayload,
    Listener,
    UserError,
} from "@sapphire/framework";

export class MenuDeniedListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Context Command Denied",
            event: "contextMenuCommandDenied",
        });
    }

    async run(
        error: UserError,
        { interaction }: ContextMenuCommandDeniedPayload
    ) {
        const { initialized } = this.container;

        if (!initialized)
            return interaction.reply({
                content:
                    "Kuramisa is not ready yet, please wait a few seconds.",
                ephemeral: true,
            });

        if (Reflect.get(Object(error.context), "silent")) return;
        return interaction.reply({ content: error.message, ephemeral: true });
    }
}
