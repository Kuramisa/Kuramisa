import { AbstractKEvent, KEvent } from "@classes/KEvent";

@KEvent({
    event: "uncaughtException",
    description: "Emits when an uncaught exception occurs",
    emitter: process
})
export default class UncaughtExceptionEvent extends AbstractKEvent {
    async run(error: Error, origin: string) {
        if (!error) return;
        const { botLogs } = this.client;
        if (!botLogs) return;

        botLogs.send({
            content: `\`Unhandled exception\` \`\`\`js\n${error.stack}\nOrigin: ${origin}\`\`\``,
            allowedMentions: { parse: [] }
        });
    }
}
