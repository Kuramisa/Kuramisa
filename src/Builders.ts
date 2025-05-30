import type { Stream } from "stream";

import {
    ActionRowBuilder,
    AttachmentBuilder,
    type AttachmentData,
    type BufferResolvable,
    ButtonBuilder,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    EmbedBuilder,
    MentionableSelectMenuBuilder,
    type MessageActionRowComponentBuilder,
    type ModalActionRowComponentBuilder,
    ModalBuilder,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle,
    UserSelectMenuBuilder,
} from "discord.js";

import {
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from "@discordjs/builders";

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
            style === "short" ? TextInputStyle.Short : TextInputStyle.Paragraph,
        );
        this.setRequired(true);
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
