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
    ButtonStyle
} from "discord.js";
import { Stream } from "winston-daily-rotate-file";

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
    constructor() {
        super();
        this.setColor("#f99753");
        this.setTimestamp();
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
    }
}

export class KAttachmentOption extends SlashCommandAttachmentOption {
    constructor() {
        super();
    }
}

export class KUserOption extends SlashCommandUserOption {
    constructor() {
        super();
    }
}

export class KRoleOption extends SlashCommandRoleOption {
    constructor() {
        super();
    }
}

export class KChannelOption extends SlashCommandChannelOption {
    constructor() {
        super();
    }
}

export class KBooleanOption extends SlashCommandBooleanOption {
    constructor() {
        super();
    }
}

export class KIntegerOption extends SlashCommandIntegerOption {
    constructor() {
        super();
    }
}

export class KMentionableOption extends SlashCommandMentionableOption {
    constructor() {
        super();
    }
}

export class KNumberOption extends SlashCommandNumberOption {
    constructor() {
        super();
    }
}
