import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Interaction } from "discord.js";
import { capitalize } from "lodash";

@KEvent({
    event: "interactionCreate",
    description: "Manage autocomplete for vote polls"
})
export default class Event extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "vote") return;
        if (!interaction.guildId) return;

        const { managers } = this.client;
        const { guildId, options } = interaction;

        const guild = await managers.guilds.get(guildId);
        const focused = options.getFocused(true);

        if (focused.name === "vote_poll") {
            let votePolls = [];

            for (const poll of guild.votePolls) {
                const member = await guild.members.fetch(poll.memberId);
                const channel = await guild.channels.fetch(poll.channelId);
                if (!channel) continue;
                if (!channel.isTextBased()) continue;

                votePolls.push({
                    name: `(${capitalize(poll.voteType)}) ${member.displayName} in channel ${channel.name}`,
                    value: poll.messageId
                });
            }

            if (focused.value.length > 0)
                votePolls = votePolls.filter((poll) =>
                    poll.name
                        .toLowerCase()
                        .includes(focused.value.toLowerCase())
                );

            votePolls = votePolls.slice(0, 25);

            return interaction.respond(votePolls);
        }
    }
}
