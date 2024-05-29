import Jimp from "jimp";
import { JSX, Builder } from "canvacord";
import { GuildMember } from "discord.js";

interface IProps {
    member: GuildMember;
    background: string | Buffer;
    textColor: string;
    outlinesColor: string;
    oldLevel: number;
    newLevel: number;
}

export default class LevelUpCard extends Builder<IProps> {
    constructor({
        member,
        background,
        textColor,
        outlinesColor,
        oldLevel,
        newLevel
    }: IProps) {
        super(540, 100);
        this.bootstrap({
            member,
            background,
            textColor,
            outlinesColor,
            oldLevel,
            newLevel
        });
    }

    setMember(member: GuildMember) {
        this.options.set("member", member);
        return this;
    }

    setBackground(background: string | Buffer) {
        this.options.set("background", background);
        return this;
    }

    setTextColor(color: string) {
        this.options.set("textColor", color);
        return this;
    }

    setOutlinesColor(color: string) {
        this.options.set("outlinesColor", color);
        return this;
    }

    setOldLevel(level: number) {
        this.options.set("oldLevel", level);
        return this;
    }

    setNewLevel(level: number) {
        this.options.set("newLevel", level);
        return this;
    }

    async render() {
        if (!this.options.get("member")) throw new Error("No member provided");
        if (!this.options.get("background"))
            throw new Error("No background provided");
        if (!this.options.get("textColor"))
            throw new Error("No text color provided");
        if (!this.options.get("outlinesColor"))
            throw new Error("No outlines color provided");
        if (!this.options.get("oldLevel"))
            throw new Error("No old level provided");
        if (!this.options.get("newLevel"))
            throw new Error("No new level provided");
        const member = this.options.get("member");

        let background = this.options.get("background");
        const textColor = this.options.get("textColor");
        const outlinesColor = this.options.get("outlinesColor");
        const oldLevel = this.options.get("oldLevel");
        const newLevel = this.options.get("newLevel");

        const boxShadow = `0 0 5px 3px ${outlinesColor}`;
        const textShadow = `1px 0 0 ${outlinesColor}, 0 1px 0 ${outlinesColor}, -1px 0 0 ${outlinesColor}, 0 -1px 0 ${outlinesColor}`;

        let isImage = false;
        if (background instanceof Buffer) {
            background = await (await Jimp.read(background))
                .resize(this.width, this.height)
                .blur(3)
                .getBase64Async(Jimp.MIME_PNG);
            isImage = true;
        }

        const bg = isImage
            ? { backgroundImage: `url(${background})` }
            : { background };
        const levelStyles = {
            border: `${outlinesColor} 2px solid`,
            boxShadow,
            borderRadius: "50%",
            width: "60px",
            height: "60px"
        };

        /** Tint (Not neccessary as of right now) */
        //const tint = hexToRgba(outlinesColor, 35);

        return (
            <div
                style={{
                    textShadow,
                    color: textColor,
                    border: `${outlinesColor} 4px`,
                    borderRadius: "40px",
                    ...bg
                }}
                className="flex font-bold justify-center items-center w-full h-full"
            >
                {/** Small Container */}
                <div
                    className="flex justify-around items-center"
                    style={{
                        width: this.width - 50,
                        height: this.height - 20,
                        borderRadius: "40px"
                    }}
                >
                    {/** Avatar */}
                    <div className="flex">
                        <img
                            src={member.displayAvatarURL({
                                extension: "png",
                                size: 512
                            })}
                            alt="Avatar"
                            style={{
                                width: "85px",
                                height: "85px",
                                borderRadius: "50%",
                                border: `${outlinesColor} 3px`,
                                boxShadow
                            }}
                        />
                    </div>
                    {/** Level up text */}
                    <div className="flex">
                        <h3>You leveled up!</h3>
                    </div>
                    {/** Levels */}
                    <div
                        className="flex justify-between items-center"
                        style={{ gap: 10 }}
                    >
                        <div
                            className="flex justify-center items-center"
                            style={levelStyles}
                        >
                            <h2>{oldLevel}</h2>
                        </div>
                        {/** Arrow */}
                        <div className="flex">
                            <h2>&gt;&gt;</h2>
                        </div>
                        <div
                            className="flex justify-center items-center"
                            style={levelStyles}
                        >
                            <h2>{newLevel}</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
