import { container } from "@sapphire/framework";
import type { User } from "discord.js";

export default class XP {
    calculateLevel = (xp: number) => Math.floor(0.1 * Math.sqrt(xp));
    calculateReqXP = (level: number) => level * level * 100 + 100;

    calculateXPForLevel(level: number) {
        let xp = 0;
        let currentLevel = 0;

        while (currentLevel !== level) {
            xp++;
            currentLevel = this.calculateLevel(xp);
        }

        return xp;
    }

    async giveXP(user: User, xp = 1) {
        const { database } = container;

        const db = await database.users.fetch(user.id);

        db.xp += xp;
        await db.save();
    }

    getXP = async (user: User) =>
        (await container.database.users.fetch(user.id)).xp;

    getLevel = async (user: User) =>
        (await container.database.users.fetch(user.id)).level;

    async setLevel(user: User, level: number) {
        const { database } = container;

        const db = await database.users.fetch(user.id);

        db.level = level;
        await db.save();
    }

    async setXP(user: User, xp: number) {
        const { database } = container;

        const db = await database.users.fetch(user.id);

        db.xp = xp;
        await db.save();
    }

    async levelUp(user: User) {
        const { database } = container;

        const db = await database.users.fetch(user.id);

        db.level += 1;
        await db.save();
    }
}
