import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Message } from "discord.js";

@KEvent({
    event: "messageCreate",
    description: "Give xp to users"
})
export default class GiveXPEvent extends AbstractKEvent {
    async run(message: Message) {
        if (message.author.bot) return;
        if (!message.member) return;

        const {
            kanvas,
            managers: { xp, users }
        } = this.client;

        if (!this.client.isReady()) return;

        const { author, member, channel, guild } = message;
        const dbUser = await users.get(author.id);

        const today = new Date();
        const ifWeekend = today.getDay() === 0 || today.getDay() === 6;

        const give = ifWeekend
            ? Math.floor(Math.random() * 75) * 2
            : Math.floor(Math.random() * 75);
        const rand = ifWeekend
            ? Math.round(Math.random() * 3)
            : Math.round(Math.random() * 4);

        if (rand === 0) {
            const currentLevel = await xp.getLevel(author);
            const currentXP = await xp.getXP(author);
            const requiredXP = xp.calculateReqXP(currentLevel);
            await xp.giveXP(author, give);

            if (!currentXP || !requiredXP) return;
            if (currentXP + give >= requiredXP) {
                await xp.levelUp(author);
                if (!guild) return;
                if (channel.isDMBased()) return;
                if (
                    !guild.members.me
                        ?.permissionsIn(channel)
                        .has("SendMessages")
                )
                    return;

                if (!dbUser.botNotifications.levelUp) return;

                if (
                    !guild.members.me?.permissionsIn(channel).has("AttachFiles")
                ) {
                    let content = `${author}, You have leveled up to **Level ${await xp.getLevel(
                        author
                    )}**`;

                    if (ifWeekend)
                        content = `${content} *It's a weekend so you get double xp :>*`;

                    return channel
                        .send({
                            content,
                            allowedMentions: { repliedUser: false }
                        })
                        .then((msg) =>
                            setTimeout(
                                () => msg.delete().catch(() => null),
                                5000
                            )
                        );
                }

                const levelUpCard = await kanvas.member.levelUpCard(member);

                return channel
                    .send({
                        files: [
                            {
                                attachment: levelUpCard,
                                name: `levelup-${member.id}.png`
                            }
                        ],
                        allowedMentions: { repliedUser: false }
                    })
                    .then((msg) =>
                        setTimeout(() => msg.delete().catch(() => null), 5000)
                    );
            }
        }
    }
}
