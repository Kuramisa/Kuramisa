import { AbstractKEvent, KEvent } from "@classes/KEvent";

@KEvent({
    event: "unhandledRejection",
    description: "Emits when an unhandled promise rejection occurs",
    emitter: process
})
export default class UnhandledRejectionEvent extends AbstractKEvent {
    async run(error: Error) {
        if (!error) return;
        const { botLogs } = this.client;
        if (!botLogs) return;

        botLogs.send({
            content: `\`Unhandled promise rejection\` \`\`\`js\n${error.stack}\`\`\``,
            allowedMentions: { parse: [] }
        });
    }
}
