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
    SlashCommandUserOption
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
    }
}

export class KButton extends ButtonBuilder {
    constructor() {
        super();
    }
}

export class KStringSelectMenu extends StringSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class KUserSelectMenu extends UserSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class KRoleSelectMenu extends RoleSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class KChannelSelectMenu extends ChannelSelectMenuBuilder {
    constructor() {
        super();
    }
}

export class KMentionableSelectMenu extends MentionableSelectMenuBuilder {
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
    }
}

export class KSlashStringOption extends SlashCommandStringOption {
    constructor() {
        super();
    }
}

export class KSlashAttachmentOption extends SlashCommandStringOption {
    constructor() {
        super();
    }
}

export class KSlashUserOption extends SlashCommandUserOption {
    constructor() {
        super();
    }
}

export class KSlashRoleOption extends SlashCommandRoleOption {
    constructor() {
        super();
    }
}

export class KSlashChannelOption extends SlashCommandChannelOption {
    constructor() {
        super();
    }
}

export class KSlashBooleanOption extends SlashCommandBooleanOption {
    constructor() {
        super();
    }
}

export class KSlashIntegerOption extends SlashCommandIntegerOption {
    constructor() {
        super();
    }
}

export class KSlashMentionableOption extends SlashCommandMentionableOption {
    constructor() {
        super();
    }
}

export class KSlashNumberOption extends SlashCommandNumberOption {
    constructor() {
        super();
    }
}
