import { container } from "@sapphire/pieces";
import Kanvas from "../Kanvas";

import { ActivityType, GuildMember } from "discord.js";
import { createCanvas, loadImage, type SKRSContext2D } from "@napi-rs/canvas";

import badgesOrder from "../../data/badgesOrder.json";
import {
    nitroBadges,
    otherBadges,
    otherImgs,
} from "../../data/profileFunc.json";
import moment from "moment";

export default class KanvasMember {
    private readonly kanvas: Kanvas;

    constructor(kanvas: Kanvas) {
        this.kanvas = kanvas;
    }

    async levelUpCard(iMember: GuildMember) {
        const {
            database,
            util,
            systems: { xp },
        } = container;

        const member = await iMember.fetch();
        const { user } = member;

        const canvas = createCanvas(600, 150);
        const ctx = canvas.getContext("2d");

        const db = await database.users.fetch(user.id);

        const { card } = db;

        let background;
        let strokeStyle = "";
        let fillStyle = "";
        let backgroundFill = "";

        switch (card.background.type) {
            case "banner": {
                background = user.bannerURL({ extension: "png" });
                break;
            }
            case "color": {
                backgroundFill = card.background.color;
                break;
            }
            case "image": {
                background = card.background.image;
                break;
            }
        }

        switch (card.text.type) {
            case "banner": {
                const colors = await this.kanvas.popularColor(
                    user.bannerURL({ extension: "png" })
                );
                if (colors) fillStyle = util.randomElement(colors);
                else fillStyle = "#808080";
                break;
            }
            case "avatar": {
                fillStyle = user.hexAccentColor
                    ? user.hexAccentColor
                    : "#808080";
                break;
            }
            case "color": {
                strokeStyle = card.text.color;
                break;
            }
        }

        switch (card.outlines.type) {
            case "banner": {
                const colors = await this.kanvas.popularColor(
                    user.bannerURL({
                        extension: "png",
                    })
                );
                if (colors) strokeStyle = util.randomElement(colors);
                else strokeStyle = "#FFA500";
                break;
            }
            case "status": {
                strokeStyle = util.member.statusColor(member.presence?.status);
                break;
            }
            case "avatar": {
                strokeStyle = user.hexAccentColor
                    ? user.hexAccentColor
                    : "#808080";
                break;
            }
            case "color": {
                strokeStyle = card.outlines.color;
                break;
            }
        }

        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        ctx.shadowColor = strokeStyle;

        ctx.globalAlpha = 0.5;

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(55, 15);
        ctx.lineTo(canvas.width - 55, 15);
        ctx.quadraticCurveTo(canvas.width - 20, 20, canvas.width - 15, 55);
        ctx.lineTo(canvas.width - 15, canvas.height - 55);
        ctx.quadraticCurveTo(
            canvas.width - 20,
            canvas.height - 20,
            canvas.width - 55,
            canvas.height - 15
        );
        ctx.lineTo(55, canvas.height - 15);
        ctx.quadraticCurveTo(20, canvas.height - 20, 15, canvas.height - 55);
        ctx.lineTo(15, 55);
        ctx.quadraticCurveTo(20, 20, 55, 15);
        ctx.lineTo(56, 15);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(65, 25);
        ctx.lineTo(canvas.width - 65, 25);
        ctx.quadraticCurveTo(canvas.width - 25, 25, canvas.width - 25, 65);
        ctx.lineTo(canvas.width - 25, canvas.height - 65);
        ctx.quadraticCurveTo(
            canvas.width - 25,
            canvas.height - 25,
            canvas.width - 65,
            canvas.height - 25
        );
        ctx.lineTo(65, canvas.height - 25);
        ctx.quadraticCurveTo(25, canvas.height - 25, 25, canvas.height - 65);
        ctx.lineTo(25, 65);
        ctx.quadraticCurveTo(25, 25, 65, 25);
        ctx.lineTo(66, 25);
        ctx.closePath();
        ctx.clip();

        ctx.globalAlpha = 1;

        ctx.filter = "blur(2px)";

        ctx.fillStyle = backgroundFill;
        if (background)
            ctx.drawImage(
                await loadImage(background),
                10,
                10,
                canvas.width - 20,
                canvas.height - 20
            );
        else ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);

        ctx.fillStyle = fillStyle;

        ctx.filter = "none";

        // Not necessary, but just in case
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(65, 35);
        ctx.lineTo(canvas.width - 65, 35);
        ctx.quadraticCurveTo(canvas.width - 35, 35, canvas.width - 35, 65);
        ctx.lineTo(canvas.width - 35, canvas.height - 65);
        ctx.quadraticCurveTo(
            canvas.width - 35,
            canvas.height - 35,
            canvas.width - 65,
            canvas.height - 35
        );
        ctx.lineTo(65, canvas.height - 35);
        ctx.quadraticCurveTo(35, canvas.height - 35, 35, canvas.height - 65);
        ctx.lineTo(35, 65);
        ctx.quadraticCurveTo(35, 35, 65, 35);
        ctx.fill();
        ctx.closePath();

        ctx.shadowBlur = 9;
        ctx.shadowOffsetX = -2;
        ctx.shadowOffsetY = 2;

        ctx.font = "18px Poppins";
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
        ctx.lineWidth = 2;

        const levelUpText = "Congrats! You leveled up!";

        ctx.strokeText(levelUpText, 133, 83);
        ctx.fillText(levelUpText, 133, 83);

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 5;
        ctx.arc(410, 75, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 5;
        ctx.arc(520, 75, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();

        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.strokeText(">>", 465, 83);
        ctx.fillText(">>", 465, 83);

        const newLevel = await xp.getLevel(user);
        const oldLevel = newLevel - 1;

        ctx.font = "30px Poppins";

        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.strokeText(`${oldLevel}`, 410, 87.5);
        ctx.fillText(`${oldLevel}`, 410, 87.5);

        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.strokeText(`${newLevel}`, 520, 87.5);
        ctx.fillText(`${newLevel}`, 520, 87.5);

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 5;
        ctx.arc(80, 75, 37, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
            await loadImage(
                user.displayAvatarURL({ extension: "png", size: 512 })
            ),
            93 - 55,
            32,
            85,
            85
        );

        return canvas.toBuffer("image/png");
    }

    async profile(iMember: GuildMember) {
        const { database, logger, util, owners } = container;
        const { japi } = util;

        const member = await iMember.fetch();
        const { user } = member;

        const userJson = await japi.discord.getUser(user.id);

        const canvas = createCanvas(378, 536);
        const ctx = canvas.getContext("2d");

        const db = await database.users.fetch(user.id);

        const { card } = db;

        let background;
        let strokeStyle = "";
        let fillStyle = "";
        let backgroundFill = "";

        switch (card.background.type) {
            case "banner": {
                background = user.bannerURL({ extension: "png", size: 512 });
                break;
            }
            case "color": {
                backgroundFill = card.background.color;
                break;
            }
            case "image": {
                background = card.background.image;
                break;
            }
        }

        switch (card.text.type) {
            case "banner": {
                const colors = await this.kanvas.popularColor(
                    user.bannerURL({ extension: "png" })
                );
                if (colors) fillStyle = util.randomElement(colors);
                else fillStyle = "#808080";
                break;
            }
            case "avatar": {
                fillStyle = user.hexAccentColor
                    ? user.hexAccentColor
                    : "#808080";
                break;
            }
            case "color": {
                fillStyle = card.text.color;
                break;
            }
        }

        switch (card.outlines.type) {
            case "banner": {
                const colors = await this.kanvas.popularColor(
                    user.bannerURL({
                        extension: "png",
                    })
                );
                if (colors) strokeStyle = util.randomElement(colors);
                else strokeStyle = "#FFA500";
                break;
            }
            case "status": {
                strokeStyle = util.member.statusColor(member.presence?.status);
                break;
            }
            case "avatar": {
                strokeStyle = user.hexAccentColor
                    ? user.hexAccentColor
                    : "#808080";
                break;
            }
            case "color": {
                strokeStyle = card.outlines.color;
                break;
            }
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        ctx.shadowColor = strokeStyle;

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(55, 15);
        ctx.lineTo(canvas.width - 55, 15);
        ctx.quadraticCurveTo(canvas.width - 20, 20, canvas.width - 15, 55);
        ctx.lineTo(canvas.width - 15, canvas.height - 55);
        ctx.quadraticCurveTo(
            canvas.width - 20,
            canvas.height - 20,
            canvas.width - 55,
            canvas.height - 15
        );
        ctx.lineTo(55, canvas.height - 15);
        ctx.quadraticCurveTo(20, canvas.height - 20, 15, canvas.height - 55);
        ctx.lineTo(15, 55);
        ctx.quadraticCurveTo(20, 20, 55, 15);
        ctx.lineTo(56, 15);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(65, 25);
        ctx.lineTo(canvas.width - 65, 25);
        ctx.quadraticCurveTo(canvas.width - 25, 25, canvas.width - 25, 65);
        ctx.lineTo(canvas.width - 25, canvas.height - 65);
        ctx.quadraticCurveTo(
            canvas.width - 25,
            canvas.height - 25,
            canvas.width - 65,
            canvas.height - 25
        );
        ctx.lineTo(65, canvas.height - 25);
        ctx.quadraticCurveTo(25, canvas.height - 25, 25, canvas.height - 65);
        ctx.lineTo(25, 65);
        ctx.quadraticCurveTo(25, 25, 65, 25);
        ctx.lineTo(66, 25);
        ctx.clip();
        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = "#232328";
        ctx.fillRect(0, 0, canvas.width - 5, canvas.height - 5);
        ctx.closePath();

        ctx.fillStyle = backgroundFill;

        try {
            if (background)
                ctx.drawImage(await loadImage(background), 10, 10, 378, 140);
            else ctx.fillRect(10, 10, 378, 140);
        } catch (err) {
            logger.error(err);
            ctx.fillRect(10, 10, 378, 140);
        }

        ctx.fillStyle = fillStyle;

        ctx.beginPath();
        ctx.fillStyle = "#111113";
        ctx.moveTo(75, 200);
        ctx.lineTo(canvas.width - 75, 200);
        ctx.quadraticCurveTo(canvas.width - 45, 200, canvas.width - 45, 200);
        ctx.lineTo(canvas.width - 45, 535 - 75);
        ctx.quadraticCurveTo(
            canvas.width - 45,
            535 - 45,
            canvas.width - 75,
            535 - 45
        );
        ctx.lineTo(75, 535 - 45);
        ctx.quadraticCurveTo(45, 535 - 45, 45, 535 - 75);
        ctx.lineTo(45, 200);
        ctx.quadraticCurveTo(200, 200, 75, 200);
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = fillStyle;

        try {
            const badges = [];
            const flagsUser = userJson.publicFlagsArray.sort(
                (a, b) =>
                    badgesOrder[b as keyof typeof badgesOrder] -
                    badgesOrder[a as keyof typeof badgesOrder]
            );
            if (owners.find((owner) => user.id === owner.id))
                flagsUser.push("OWNER");

            for (let i = 0; i < flagsUser.length; i++) {
                const flag = flagsUser[i];

                if (flag.startsWith("OWNER")) {
                    badges.push(
                        await loadImage(
                            Buffer.from(otherImgs["owner"], "base64")
                        )
                    );
                } else if (flag.startsWith("BOOSTER")) {
                    badges.push(
                        await loadImage(
                            Buffer.from(
                                nitroBadges[flag as keyof typeof nitroBadges],
                                "base64"
                            )
                        )
                    );
                } else if (flag.startsWith("NITRO")) {
                    badges.push(
                        await loadImage(
                            Buffer.from(
                                otherBadges[flag as keyof typeof otherBadges],
                                "base64"
                            )
                        )
                    );
                } else {
                    badges.push(
                        await loadImage(
                            Buffer.from(
                                otherBadges[flag as keyof typeof otherBadges],
                                "base64"
                            )
                        )
                    );
                }
            }

            let x = 300;
            for (const badge of badges) {
                ctx.drawImage(badge, x, 165, 30, 30);
                x -= 30;
            }

            const globalName = user.globalName
                ? user.globalName
                : user.username;

            ctx.font = "20px Poppins Bold";
            ctx.fillText(
                `${
                    globalName.length > 16
                        ? globalName.slice(0, 16) + "..."
                        : globalName
                }`,
                65,
                235
            );

            ctx.font = "15px Poppins";
            ctx.fillText(
                `${
                    user.username.length > 18
                        ? user.username.slice(0, 18) + "..."
                        : user.username
                }`,
                65,
                255
            );

            const activity = member.presence?.activities[0];
            if (activity && activity.type !== ActivityType.Custom) {
                ctx.font = "12px Poppins Bold";
                ctx.fillText(
                    `${
                        activity.type === 0
                            ? "Playing a Game"
                            : activity.type === 2
                            ? `Listening to ${
                                  activity.name.length > 8
                                      ? activity.name.slice(0, 11)
                                      : activity.name
                              }`
                            : activity.type === 3
                            ? `Watching ${
                                  activity.name.length > 8
                                      ? activity.name.slice(0, 11)
                                      : activity.name
                              }`
                            : activity.type === 1
                            ? "Live On Stream"
                            : "Playing a Game"
                    }`,
                    65,
                    310
                );

                ctx.font = "10px Poppins Bold";
                ctx.fillText(
                    `${activity.name ? activity.name : "Anything"}`,
                    110,
                    333
                );

                ctx.font = "10px Poppins";
                ctx.fillText(
                    `${activity.details ? `${activity.details}` : ""}`,
                    110,
                    345
                );
                ctx.fillText(
                    `${activity.state ? `${activity.state}` : ""}`,
                    110,
                    358
                );

                try {
                    const largeImage = activity.assets
                        ? activity.assets.largeImageURL()
                            ? activity.assets.largeImageURL()!
                            : "https://cdn.discordapp.com/attachments/1106235099743264768/1109156957182505010/2023-05-19_19-33-08.png"
                        : "https://cdn.discordapp.com/attachments/1106235099743264768/1109156957182505010/2023-05-19_19-33-08.png";

                    ctx.drawImage(await loadImage(largeImage), 60, 320, 45, 45);
                } catch (error) {
                    ctx.drawImage(
                        await loadImage(
                            "https://cdn.discordapp.com/attachments/1106235099743264768/1109156957182505010/2023-05-19_19-33-08.png"
                        ),
                        60,
                        320,
                        45,
                        45
                    );
                }
            }

            ctx.font = "14px Poppins Bold";
            ctx.fillText("Discord Member Since", 65, 420);

            ctx.font = "12px Poppins";
            const createdAt = moment(user.createdTimestamp).fromNow();
            ctx.fillText(createdAt, 65, 445);

            const avatar = user.avatar
                ? user.avatarURL({
                      size: 512,
                      forceStatic: true,
                  })!
                : `${user.defaultAvatarURL}?size=512`;

            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.arc(90, 120, 50, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.fill();
            ctx.lineWidth = 8;
            ctx.arc(90, 120, 50, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(await loadImage(avatar), 40, 70, 100, 100);
            ctx.closePath();
        } catch (err) {
            logger.error(err);
        }

        return canvas.toBuffer("image/png");
    }

    async rank(iMember: GuildMember) {
        const member = await iMember.fetch();
        const { user } = member;

        const {
            database,
            logger,
            systems: { xp },
            util,
        } = container;

        const db = await database.users.fetch(user.id);

        const currentXp = await xp.getXP(user);
        const currentLevel = await xp.getLevel(user);
        const currentRank = await util.member.getRank(db);
        const reqXp = xp.calculateReqXP(currentLevel);

        const canvas = createCanvas(850, 300);
        const ctx = canvas.getContext("2d");

        const { card } = db;

        let background;
        let strokeStyle = "";
        let fillStyle = "";
        let backgroundFill = "";

        switch (card.background.type) {
            case "banner": {
                background = user.bannerURL({ extension: "png", size: 512 });
                break;
            }
            case "color": {
                backgroundFill = card.background.color;
                break;
            }
            case "image": {
                background = card.background.image;
                break;
            }
        }

        switch (card.text.type) {
            case "banner": {
                const colors = await this.kanvas.popularColor(
                    user.bannerURL({ extension: "png" })
                );
                if (colors) fillStyle = util.randomElement(colors);
                else fillStyle = "#808080";
                break;
            }
            case "avatar": {
                fillStyle = user.hexAccentColor
                    ? user.hexAccentColor
                    : "#808080";
                break;
            }
            case "color": {
                fillStyle = card.text.color;
                break;
            }
        }

        switch (card.outlines.type) {
            case "banner": {
                const colors = await this.kanvas.popularColor(
                    user.bannerURL({
                        extension: "png",
                    })
                );
                if (colors) strokeStyle = util.randomElement(colors);
                else strokeStyle = "#FFA500";
                break;
            }
            case "status": {
                strokeStyle = util.member.statusColor(member.presence?.status);
                break;
            }
            case "avatar": {
                strokeStyle = user.hexAccentColor
                    ? user.hexAccentColor
                    : "#808080";
                break;
            }
            case "color": {
                strokeStyle = card.outlines.color;
                break;
            }
        }

        ctx.globalAlpha = 1;
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        ctx.shadowColor = strokeStyle;

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(55, 15);
        ctx.lineTo(canvas.width - 55, 15);
        ctx.quadraticCurveTo(canvas.width - 20, 20, canvas.width - 15, 55);
        ctx.lineTo(canvas.width - 15, canvas.height - 55);
        ctx.quadraticCurveTo(
            canvas.width - 20,
            canvas.height - 20,
            canvas.width - 55,
            canvas.height - 15
        );
        ctx.lineTo(55, canvas.height - 15);
        ctx.quadraticCurveTo(20, canvas.height - 20, 15, canvas.height - 55);
        ctx.lineTo(15, 55);
        ctx.quadraticCurveTo(20, 20, 55, 15);
        ctx.lineTo(56, 15);
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(65, 25);
        ctx.lineTo(canvas.width - 65, 25);
        ctx.quadraticCurveTo(canvas.width - 25, 25, canvas.width - 25, 65);
        ctx.lineTo(canvas.width - 25, canvas.height - 65);
        ctx.quadraticCurveTo(
            canvas.width - 25,
            canvas.height - 25,
            canvas.width - 65,
            canvas.height - 25
        );
        ctx.lineTo(65, canvas.height - 25);
        ctx.quadraticCurveTo(25, canvas.height - 25, 25, canvas.height - 65);
        ctx.lineTo(25, 65);
        ctx.quadraticCurveTo(25, 25, 65, 25);
        ctx.lineTo(66, 25);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = backgroundFill;

        try {
            if (background)
                ctx.drawImage(
                    await loadImage(background),
                    10,
                    10,
                    canvas.width - 20,
                    canvas.height - 20
                );
            else ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
        } catch (err) {
            logger.error(err);
            ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
        }

        ctx.fillStyle = fillStyle;

        ctx.globalAlpha = 0.35;
        ctx.fillStyle = "#111113";
        ctx.beginPath();
        ctx.moveTo(75, 45);
        ctx.lineTo(canvas.width - 75, 45);
        ctx.quadraticCurveTo(canvas.width - 45, 45, canvas.width - 45, 75);
        ctx.lineTo(canvas.width - 45, canvas.height - 75);
        ctx.quadraticCurveTo(
            canvas.width - 45,
            canvas.height - 45,
            canvas.width - 75,
            canvas.height - 45
        );
        ctx.lineTo(75, canvas.height - 45);
        ctx.quadraticCurveTo(45, canvas.height - 45, 45, canvas.height - 75);
        ctx.lineTo(45, 75);
        ctx.quadraticCurveTo(45, 45, 75, 45);
        ctx.fill();
        ctx.closePath();

        ctx.globalAlpha = 1;
        ctx.fillStyle = fillStyle;

        ctx.font = "28px Poppins Bold";
        ctx.textAlign = "start";
        const username =
            user.username.length > 15
                ? user.username.slice(0, 15) + "..."
                : user.username;
        ctx.fillText(username, 258, 125);

        const maxXpBarWidth = 500;
        const xpBar = Math.floor((currentXp / reqXp) * maxXpBarWidth);

        ctx.textAlign = "end";
        ctx.font = "40px Poppins Bold";

        ctx.fillText(`${currentLevel}`, 250 + maxXpBarWidth, 90);

        const levelWidth = ctx.measureText(`${currentLevel}`).width + 5;

        ctx.font = "20px Poppins Bold";
        ctx.fillText("Level", 250 + maxXpBarWidth - levelWidth, 90);

        const levelTextWidth = ctx.measureText("Level").width + 30;

        ctx.textAlign = "end";
        ctx.font = "40px Poppins Bold";
        ctx.fillText(
            `${currentRank}`,
            200 + maxXpBarWidth - levelTextWidth - levelWidth,
            90
        );

        const rankWidth = ctx.measureText(`${currentRank}`).width + 5;

        ctx.font = "20px Poppins Bold";
        ctx.fillText(
            "Rank",
            200 + maxXpBarWidth - levelTextWidth - levelWidth - rankWidth,
            90
        );

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2;
        ctx.moveTo(220, 135);
        ctx.lineTo(200 + maxXpBarWidth, 135);
        ctx.quadraticCurveTo(
            220 + maxXpBarWidth,
            135,
            220 + maxXpBarWidth,
            152.5
        );
        ctx.quadraticCurveTo(
            220 + maxXpBarWidth,
            170,
            200 + maxXpBarWidth,
            170
        );
        ctx.lineTo(220, 170);
        ctx.lineTo(220, 135);
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = strokeStyle;
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2;
        ctx.moveTo(220, 135);
        ctx.lineTo(200 + xpBar, 135);
        ctx.quadraticCurveTo(220 + xpBar, 135, 220 + xpBar, 152.5);
        ctx.quadraticCurveTo(220 + xpBar, 170, 200 + xpBar, 170);
        ctx.lineTo(220, 170);
        ctx.lineTo(220, 135);
        ctx.fill();

        ctx.fillStyle = fillStyle;
        ctx.textAlign = "start";
        ctx.font = "23px Poppins Bold";
        ctx.fillText(`${currentXp}`, 400, 161.5);

        ctx.fillText(
            ` / ${reqXp}`,
            400 + ctx.measureText(`${currentXp}`).width,
            161.5
        );

        ctx.closePath();

        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(150, 150, 90, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
        ctx.clip();

        const avatar = user.avatar
            ? user.avatarURL({
                  forceStatic: true,
                  size: 512,
              })!
            : `${user.defaultAvatarURL}?size=512`;

        ctx.drawImage(await loadImage(avatar), 60, 60, 180, 180);

        return canvas.toBuffer("image/png");
    }

    async leaderboard(usersCount: number = 10) {
        const { client, database, logger, util } = container;

        const dbUsers = (
            await database.users.fetchAll().limit(usersCount)
        ).sort((a, b) => b.xp - a.xp);

        if (dbUsers.length < usersCount) usersCount = dbUsers.length;

        const fillRoundRect = (
            ctx: SKRSContext2D,
            x: number,
            y: number,
            w: number,
            h: number,
            r: any,
            f: boolean,
            s: boolean
        ) => {
            r = { tl: r, tr: r, br: r, bl: r };
            ctx.beginPath();
            ctx.moveTo(x + r.tl, y);
            ctx.lineTo(x + w - r.tr, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
            ctx.lineTo(x + w, y + h - r.br);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
            ctx.lineTo(x + r.bl, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
            ctx.lineTo(x, y + r.tl);
            ctx.quadraticCurveTo(x, y, x + r.tl, y);
            ctx.closePath();
            if (f) ctx.fill();
            if (s) ctx.stroke();
        };

        const maxHeight = usersCount * 74.5;

        const canvas = createCanvas(680, maxHeight);
        const ctx = canvas.getContext("2d");

        let boxY = 0,
            avatarY = 0,
            tagY = 45,
            xpY = 45,
            rankY = 45;

        for (let i = 0; i <= dbUsers.length; i++) {
            const dbUser = dbUsers[i];
            if (!dbUser) continue;
            let user = client.users.cache.get(dbUser.id);
            if (!user)
                user = await client.users
                    .fetch(dbUser.id)
                    .catch(() => undefined);
            if (!user) continue;

            ctx.save();

            const { card } = dbUser;

            let background;
            let strokeStyle = "";
            let fillStyle = "";
            let backgroundFill = "";

            switch (card.background.type) {
                case "banner": {
                    background = user.bannerURL({
                        extension: "png",
                        size: 512,
                    });
                    break;
                }
                case "color": {
                    backgroundFill = card.background.color;
                    break;
                }
                case "image": {
                    background = card.background.image;
                    break;
                }
            }

            switch (card.text.type) {
                case "banner": {
                    const colors = await this.kanvas.popularColor(
                        user.bannerURL({ extension: "png" })
                    );
                    if (colors) fillStyle = util.randomElement(colors);
                    else fillStyle = "#808080";
                    break;
                }
                case "avatar": {
                    fillStyle = user.hexAccentColor
                        ? user.hexAccentColor
                        : "#808080";
                    break;
                }
                case "color": {
                    fillStyle = card.text.color;
                    break;
                }
            }

            switch (card.outlines.type) {
                case "banner": {
                    const colors = await this.kanvas.popularColor(
                        user.bannerURL({
                            extension: "png",
                        })
                    );
                    if (colors) strokeStyle = util.randomElement(colors);
                    else strokeStyle = "#FFA500";
                    break;
                }
                case "status": {
                    strokeStyle = user.hexAccentColor
                        ? user.hexAccentColor
                        : "#808080";
                    break;
                }
                case "avatar": {
                    strokeStyle = user.hexAccentColor
                        ? user.hexAccentColor
                        : "#808080";
                    break;
                }
                case "color": {
                    strokeStyle = card.outlines.color;
                    break;
                }
            }

            ctx.globalAlpha = 1;
            ctx.fillStyle = backgroundFill;
            ctx.strokeStyle = strokeStyle;
            ctx.shadowColor = strokeStyle;

            if (background) {
                try {
                    ctx.drawImage(
                        await loadImage(background),
                        0,
                        boxY,
                        canvas.width,
                        70
                    );
                    fillRoundRect(
                        ctx,
                        0,
                        boxY,
                        canvas.width,
                        70,
                        15,
                        false,
                        true
                    );
                } catch (err) {
                    logger.error(err);
                    fillRoundRect(
                        ctx,
                        0,
                        boxY,
                        canvas.width,
                        70,
                        15,
                        true,
                        false
                    );
                }
            } else
                fillRoundRect(ctx, 0, boxY, canvas.width, 70, 15, true, false);

            ctx.fillStyle = fillStyle;

            const avatar = await loadImage(
                user.avatar
                    ? user.avatarURL({
                          forceStatic: true,
                          size: 512,
                      })!
                    : `${user.defaultAvatarURL}?size=512`
            );

            const currentRank = await util.member.getRank(dbUser);

            ctx.clip();
            ctx.drawImage(avatar, 0, avatarY, 70, 70);
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 8;
            ctx.shadowOffsetY = 6;
            ctx.shadowColor = "#0a0a0a";

            ctx.font = "25px Poppins Bold";
            ctx.textAlign = "left";
            if (user.globalName)
                ctx.fillText(
                    `${user.globalName} (${user.username})`,
                    80,
                    tagY,
                    260
                );
            else ctx.fillText(`${user.username}`, 80, tagY, 260);

            ctx.font = "20px Poppins Bold";
            ctx.textAlign = "right";
            ctx.fillText(`Level: ${dbUser.level}`, 560, xpY, 200);

            switch (currentRank) {
                case 1:
                    ctx.fillStyle = "#f7c716";
                    break;
                case 2:
                    ctx.fillStyle = "#9e9e9e";
                    break;
                case 3:
                    ctx.fillStyle = "#3f2c05";
                    break;
                default:
                    ctx.fillStyle = "#fff";
                    break;
            }

            ctx.font = "30px Poppins Bold";
            ctx.textAlign = "right";
            ctx.fillText(`#${i + 1}`, 660, rankY, 75);

            boxY += 75;
            avatarY += 75;
            tagY += 75;
            xpY += 75;
            rankY += 75;
            ctx.restore();
        }

        return canvas.toBuffer("image/png");
    }
}
