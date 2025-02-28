import {
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
    type ModalActionRowComponentBuilder,
    AttachmentBuilder,
    type BufferResolvable,
    type AttachmentData,
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
} from "discord.js";
import { Stream } from "stream";

export class Row extends ActionRowBuilder<MessageActionRowComponentBuilder> {
    constructor() {
        super();
    }
}

export class ModalRow extends ActionRowBuilder<ModalActionRowComponentBuilder> {
    constructor() {
        super();
    }
}

export class Attachment extends AttachmentBuilder {
    constructor(attachment: BufferResolvable | Stream, data?: AttachmentData) {
        super(attachment, data);
    }
}

export class Embed extends EmbedBuilder {
    constructor() {
        super();
        this.setColor("#f99753");
        this.setTimestamp();
    }
}

export class Button extends ButtonBuilder {
    constructor() {
        super();
        this.setStyle(ButtonStyle.Secondary);
    }
}

export class StringDropdown extends StringSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class UserDropdown extends UserSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class RoleMenu extends RoleSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class ChannelDropdown extends ChannelSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class MentionableDropdown extends MentionableSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class Modal extends ModalBuilder {
    constructor() {
        super();
    }
}

export class TextInput extends TextInputBuilder {
    constructor(style: "short" | "long" = "short") {
        super();
        this.setStyle(
            style === "short" ? TextInputStyle.Short : TextInputStyle.Paragraph
        );
    }
}

export class StringOption extends SlashCommandStringOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class AttachmentOption extends SlashCommandAttachmentOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class UserOption extends SlashCommandUserOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class RoleOption extends SlashCommandRoleOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class ChannelOption extends SlashCommandChannelOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class BooleanOption extends SlashCommandBooleanOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class IntegerOption extends SlashCommandIntegerOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class MentionableOption extends SlashCommandMentionableOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}

export class NumberOption extends SlashCommandNumberOption {
    constructor() {
        super();
        this.setRequired(true);
    }
}
