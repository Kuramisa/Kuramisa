import kuramisa from "@kuramisa";
import type Kanvas from "./";

import { createCanvas, loadImage } from "@napi-rs/canvas";
import { type GuildMember } from "discord.js";

const imageUrl = `${process.cwd()}/assets/images`;

import { randEl, statusColor } from "@utils";

export default class KanvasImages {
    private readonly kanvas: Kanvas;

    constructor(kanvas: Kanvas) {
        this.kanvas = kanvas;
    }

    async affect(_image: string) {
        const image = await loadImage(_image);

        const bg = await loadImage(`${imageUrl}/affect.png`);
        const canvas = createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(bg, 0, 0);
        ctx.drawImage(image, 180, 383, 200, 157);

        return canvas.toBuffer("image/png");
    }

    async ship(member1: GuildMember, member2: GuildMember) {
        const { logger, managers } = kuramisa;

        const canvas = createCanvas(700, 350);
        const ctx = canvas.getContext("2d");

        const user1 = await managers.users.get(member1.id);
        const user2 = await managers.users.get(member2.id);

        const { card: card1 } = user1;
        const { card: card2 } = user2;

        let background1;
        let background2;

        let strokeStyle1 = "";
        let backgroundFill1 = "";

        let strokeStyle2 = "";
        let fillStyle2 = "";
        let backgroundFill2 = "";

        switch (card1.background.type) {
            case "banner": {
                background1 = user1.bannerURL({
                    extension: "png",
                    size: 512
                });
                break;
            }
            case "color": {
                backgroundFill1 = card1.background.color;
                break;
            }
            case "image": {
                background1 = card1.background.image;
                break;
            }
        }

        switch (card1.outlines.type) {
            case "banner": {
                const colors = await this.kanvas.popularColor(
                    user1.bannerURL({
                        extension: "png"
                    })
                );
                if (colors) strokeStyle1 = randEl(colors);
                else strokeStyle1 = "#FFA500";
                break;
            }
            case "status": {
                strokeStyle1 = statusColor(member1.presence?.status);
                break;
            }
            case "avatar": {
                strokeStyle1 = user1.hexAccentColor
                    ? user1.hexAccentColor
                    : "#808080";
                break;
            }
            case "color": {
                strokeStyle1 = card1.outlines.color;
                break;
            }
        }

        switch (card2.background.type) {
            case "banner": {
                background2 = user2.bannerURL({
                    extension: "png",
                    size: 512
                });
                break;
            }
            case "color": {
                backgroundFill2 = card2.background.color;
                break;
            }
            case "image": {
                background2 = card2.background.image;
                break;
            }
        }

        switch (card2.text.type) {
            case "banner": {
                const colors = await this.kanvas.popularColor(
                    user2.bannerURL({ extension: "png" })
                );
                if (colors) fillStyle2 = randEl(colors);
                else fillStyle2 = "#808080";
                break;
            }
            case "avatar": {
                fillStyle2 = user2.hexAccentColor
                    ? user2.hexAccentColor
                    : "#808080";
                break;
            }
            case "color": {
                fillStyle2 = card2.text.color;
                break;
            }
        }

        switch (card2.outlines.type) {
            case "banner": {
                const colors = await this.kanvas.popularColor(
                    user2.bannerURL({
                        extension: "png"
                    })
                );
                if (colors) strokeStyle2 = randEl(colors);
                else strokeStyle2 = "#FFA500";
                break;
            }
            case "status": {
                strokeStyle2 = statusColor(member2.presence?.status);
                break;
            }
            case "avatar": {
                strokeStyle2 = user2.hexAccentColor
                    ? user2.hexAccentColor
                    : "#808080";
                break;
            }
            case "color": {
                strokeStyle2 = card2.outlines.color;
                break;
            }
        }

        ctx.strokeStyle = strokeStyle1;
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.moveTo(55, 15);
        ctx.lineTo(canvas.width / 2, 15);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = strokeStyle2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 15);
        ctx.lineTo(canvas.width - 55, 15);
        ctx.quadraticCurveTo(canvas.width - 20, 20, canvas.width - 15, 55);
        ctx.lineTo(canvas.width - 15, canvas.height - 55);
        ctx.quadraticCurveTo(
            canvas.width - 20,
            canvas.height - 20,
            canvas.width - 55,
            canvas.height - 15
        );
        ctx.lineTo(canvas.width / 2, canvas.height - 15);
        ctx.stroke();
        ctx.closePath();
        ctx.strokeStyle = strokeStyle1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height - 15);
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
        ctx.filter = "blur(2.5px)";

        ctx.fillStyle = backgroundFill1;

        if (background1) {
            try {
                const bgImage = await loadImage(background1);
                ctx.drawImage(
                    bgImage,
                    0,
                    0,
                    bgImage.width / 2,
                    bgImage.height,
                    10,
                    10,
                    canvas.width / 2 - 10,
                    canvas.height - 25
                );
            } catch (err: any) {
                logger.error(err.message, err);
                ctx.fillRect(10, 10, canvas.width / 2 - 10, canvas.height - 25);
            }
        } else ctx.fillRect(10, 10, canvas.width / 2 - 10, canvas.height - 25);

        ctx.fillStyle = backgroundFill2;

        if (background2) {
            try {
                const bgImage = await loadImage(background2);
                ctx.drawImage(
                    bgImage,
                    0,
                    0,
                    bgImage.width / 2,
                    bgImage.height,
                    canvas.width / 2,
                    10,
                    canvas.width - 10,
                    canvas.height - 25
                );
            } catch (err: any) {
                logger.error(err.message, err);
                ctx.fillRect(10, 10, canvas.width / 2 - 10, canvas.height - 25);
            }
        } else
            ctx.fillRect(
                canvas.width / 2,
                10,
                canvas.width - 10,
                canvas.height - 25
            );

        ctx.fillStyle = fillStyle2;

        ctx.filter = "none";

        ctx.globalAlpha = 0.25;
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

        const x = 700 / 2 - 150 / 2;
        const y = 350 / 2 - 150 / 2;

        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.moveTo(x + 75, y + 30);
        ctx.bezierCurveTo(x + 30, y, x, y + 30, x, y + 75);
        ctx.bezierCurveTo(x, y + 120, x + 75, y + 150, x + 75, y + 150);
        ctx.bezierCurveTo(x + 75, y + 150, x + 150, y + 120, x + 150, y + 75);
        ctx.bezierCurveTo(x + 150, y + 30, x + 120, y, x + 75, y + 30);
        ctx.closePath();

        let number = Math.floor(Math.random() * 101);

        let love = 399;
        if (number >= 100) number = 101;
        if (number >= 90 && number < 100) love = 130;
        if (number >= 80 && number < 90) love = 160;
        if (number >= 70 && number < 80) love = 190;
        if (number >= 60 && number < 70) love = 220;
        if (number >= 50 && number < 60) love = 250;
        if (number >= 40 && number < 50) love = 280;
        if (number >= 30 && number < 40) love = 310;
        if (number >= 20 && number < 30) love = 340;
        if (number >= 10 && number < 20) love = 370;
        if (number >= 5 && number < 10) love = 385;
        if (number >= 0 && number < 5) love = 399;

        ctx.globalAlpha = 0.6;
        const gradient = ctx.createLinearGradient(0, y, 0, love);
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.5, "#ffffff");
        gradient.addColorStop(0.5, "#ff0000");
        gradient.addColorStop(0.1, "#ff0000");
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 9;
        ctx.shadowColor = "#ff0000";
        ctx.shadowOffsetY = 0;
        ctx.shadowOffsetX = 0;
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "36px Poppins Bold";
        ctx.shadowBlur = 9;
        ctx.shadowColor = "#0a0a0a";
        ctx.shadowOffsetY = 8;
        ctx.shadowOffsetX = -6;
        ctx.globalAlpha = 1;
        ctx.textAlign = "center";
        ctx.fillText(`%${number}`, 350, 190);
        ctx.beginPath();
        ctx.lineWidth = 8;
        ctx.fill();
        ctx.lineWidth = 8;

        const avatarUrl1 = user1.avatar
            ? user1.avatarURL({
                  forceStatic: true,
                  size: 512
              })!
            : `${user1.defaultAvatarURL}?size=512`;

        const avatarUrl2 = user2.avatar
            ? user2.avatarURL({
                  forceStatic: true,
                  size: 512
              })!
            : `${user2.defaultAvatarURL}?size=512`;

        const avatar1 = await loadImage(avatarUrl1);
        const avatar2 = await loadImage(avatarUrl2);

        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.fill();
        ctx.lineWidth = 8;
        ctx.arc(160, 175, 90, 0, 2 * Math.PI);
        ctx.arc(540, 175, 90, 0, 2 * Math.PI);
        ctx.clip();
        ctx.drawImage(avatar1, 60, 75, 200, 200);
        ctx.drawImage(avatar2, 440, 75, 200, 200);

        return canvas.toBuffer("image/png");
    }

    async batslap(_image1: string, _image2: string) {
        const image1 = await loadImage(_image1);
        const image2 = await loadImage(_image2);

        const bg = await loadImage(
            `${process.cwd()}/assets/images/batslap.png`
        );
        const canvas = createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(bg, 0, 0);
        ctx.drawImage(image1, 470, 100, 290, 290);
        ctx.drawImage(image2, 820, 350, 270, 270);

        return canvas.toBuffer("image/png");
    }

    async beautiful(_image: string) {
        const image = await loadImage(_image);

        const bg = await loadImage(
            `${process.cwd()}/assets/images/beautiful.png`
        );
        const canvas = createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(bg, 0, 0);
        ctx.drawImage(image, 258, 28, 84, 95);
        ctx.drawImage(image, 258, 229, 84, 95);

        return canvas.toBuffer("image/png");
    }

    async delete(_image: string) {
        const image = await loadImage(_image);

        const bg = await loadImage(`${process.cwd()}/assets/images/delete.png`);
        const canvas = createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(bg, 0, 0);
        ctx.drawImage(image, 120, 135, 195, 195);

        return canvas.toBuffer("image/png");
    }

    async gay(_image: string) {
        const image = await loadImage(_image);

        const bg = await loadImage(`${process.cwd()}/assets/images/gay.png`);
        const canvas = createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(bg, 0, 0);

        return canvas.toBuffer("image/png");
    }

    async kiss(_image1: string, _image2: string) {
        const image1 = await loadImage(_image1);
        const image2 = await loadImage(_image2);

        const canvas = createCanvas(768, 574);
        const ctx = canvas.getContext("2d");

        const bg = await loadImage(
            "https://runkit-packages-raw.com/18.x.x/1680269029438/kojiro-image-generation/src/assets/kiss.png"
        );

        ctx.drawImage(bg, 0, 0, canvas.height, canvas.width);

        ctx.drawImage(image1, 370, 25, 200, 200);
        ctx.drawImage(image2, 150, 25, 200, 200);

        return canvas.toBuffer("image/png");
    }
}
