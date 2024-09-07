import {
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    ModalActionRowComponentBuilder,
    AttachmentBuilder,
    BufferResolvable,
    AttachmentData,
    EmbedBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    MentionableSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    SlashCommandBooleanOption,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
    SlashCommandAttachmentOption,
    TextInputStyle,
    ButtonStyle,
    GuildMember,
    User
} from "discord.js";
import { Stream } from "stream";

export class KRow extends ActionRowBuilder<MessageActionRowComponentBuilder> {
    constructor() {
        super();
    }
}

export class KModalRow extends ActionRowBuilder<ModalActionRowComponentBuilder> {
    constructor() {
        super();
    }
}

export class KAttachment extends AttachmentBuilder {
    constructor(attachment: BufferResolvable | Stream, data?: AttachmentData) {
        super(attachment, data);
    }
}

export class KEmbed extends EmbedBuilder {
    constructor(user?: GuildMember | User) {
        super();
        this.setColor("#f99753");
        this.setTimestamp();

        if (user) {
            this.setAuthor({
                name: user.displayName,
                iconURL: user.displayAvatarURL()
            });
        }
    }
}

export class KButton extends ButtonBuilder {
    constructor() {
        super();
        this.setStyle(ButtonStyle.Secondary);
    }
}

export class KStringDropdown extends StringSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class KUserDropdown extends UserSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class KRoleMenu extends RoleSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class KChannelDropdown extends ChannelSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class KMentionableDropdown extends MentionableSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class KModal extends ModalBuilder {
    constructor() {
        super();
    }
}

export class KTextInput extends TextInputBuilder {
    constructor() {
        super();
        this.setStyle(TextInputStyle.Short);
    }
}

export class KStringOption extends SlashCommandStringOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class KAttachmentOption extends SlashCommandAttachmentOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class KUserOption extends SlashCommandUserOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class KRoleOption extends SlashCommandRoleOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class KChannelOption extends SlashCommandChannelOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class KBooleanOption extends SlashCommandBooleanOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class KIntegerOption extends SlashCommandIntegerOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class KMentionableOption extends SlashCommandMentionableOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class KNumberOption extends SlashCommandNumberOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}
