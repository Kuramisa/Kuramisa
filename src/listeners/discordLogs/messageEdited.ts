import { Listener } from "@sapphire/framework";
import { ChannelType, type Message } from "discord.js";

export class MessageEditedLogListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Logs when a message is edited",
            event: "messageUpdate"
        });
    }

    async run(oldMessage: Message, newMessage: Message) {
        if (!newMessage.inGuild()) return;
        if (!newMessage.author) return;
        if (newMessage.author.bot) return;
        if (oldMessage.content === newMessage.content) return;
        if (newMessage.channel.type === ChannelType.PrivateThread) return;
        const { database, util } = this.container;

        const { guild } = newMessage;

        const db = await database.guilds.fetch(guild.id);
        if (!db || !db.logs.channel || !db.logs.types.messageEdited) return;

        const channel = guild.channels.cache.get(db.logs.channel);
        if (!channel || !channel.isTextBased()) return;

        if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
            return;

        const embed = util
            .embed()
            .setAuthor({
                name: `${guild.name} Message Logs`,
                iconURL: guild.iconURL() as string
            })
            .setTitle(`${newMessage.author.username} edited a message`)
            .setThumbnail(
                newMessage.author.avatarURL({ extension: "gif" }) as string
            )
            .setDescription(
                `
                ***From***
                ${oldMessage.content ? `\`\`\`${oldMessage.content}\`\`\`` : ""}
                ***To***
                ${newMessage.content ? `\`\`\`${newMessage.content}\`\`\`` : ""}
            `
            )
            .setFooter({ text: `ID: ${newMessage.id}` });

        return channel.send({ embeds: [embed] });
    }
}
