import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Message } from "discord.js";

@KEvent({
    event: "messageUpdate",
    description: "Fires when a vote poll ends"
})
export default class VotePollEndEvent extends AbstractKEvent {
    async run(_: any, message: Message) {
        if (!message.poll) return;
        if (!message.guild) return;
        message = await message.fetch();

        // Needed since the message is fetched
        if (!message.poll) return;
        if (!message.guild) return;

        const { guild } = message;
        const { database } = this.client;

        const db = await database.guilds.fetch(guild.id);

        const dbPoll = db.votePolls.find((p) => p.messageId === message.id);
        if (!dbPoll) return;

        const member = await guild.members.fetch(dbPoll.memberId);
        if (!member) return;

        const channel = await guild.channels.fetch(dbPoll.channelId);
        if (!channel) return;
        if (!channel.isTextBased()) return;

        const { poll } = message;

        db.votePolls = db.votePolls.filter((p) => p.messageId !== message.id);

        await db.save();

        const yes = poll.answers.get(1);
        const no = poll.answers.get(2);
        if (!yes || !no) return;

        if (no.voteCount === 0 && yes.voteCount === 0) {
            await message.reply(
                `The vote has ended and no one voted. ${member.toString()} will not be **${dbPoll.voteType}ed**`
            );
            return;
        }

        if (no.voteCount === yes.voteCount) {
            await message.reply(
                `The vote has ended and the votes are tied. ${member.toString()} will not be **${dbPoll.voteType}ed**`
            );
            return;
        }

        if (no.voteCount > yes.voteCount) {
            await message.reply(
                `The vote has ended and the majority voted no. ${member.toString()} will not be **${dbPoll.voteType}ed**`
            );
            return;
        }

        await message.reply(
            `The vote has ended and the majority voted yes. ${member.toString()} will be **${dbPoll.voteType}ed**`
        );

        switch (dbPoll.voteType) {
            case "timeout": {
                await member.timeout(dbPoll.duration, dbPoll.reason);
                break;
            }
            case "kick": {
                await member.kick(dbPoll.reason);
                break;
            }
            case "ban": {
                await member.ban({
                    reason: dbPoll.reason
                });
                break;
            }
        }
    }
}
