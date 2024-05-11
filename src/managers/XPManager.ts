import kuramisa from "@kuramisa";
import { IUser } from "@schemas/User";

import type { User } from "discord.js";

export default class XPManager {
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
        const { database } = kuramisa;

        const db = await database.users.fetch(user.id);

        db.xp += xp;
        await db.save();
    }

    getXP = async (user: User) =>
        (await kuramisa.database.users.fetch(user.id)).xp;

    getLevel = async (user: User) =>
        (await kuramisa.database.users.fetch(user.id)).level;

    async setLevel(user: User, level: number) {
        const { database } = kuramisa;

        const db = await database.users.fetch(user.id);

        db.level = level;
        await db.save();
    }

    async setXP(user: User, xp: number) {
        const { database } = kuramisa;

        const db = await database.users.fetch(user.id);

        db.xp = xp;
        await db.save();
    }

    async levelUp(user: User) {
        const { database } = kuramisa;

        const db = await database.users.fetch(user.id);

        db.level += 1;
        await db.save();
    }

    async getCardData(user: IUser) {
        const neededXP = this.calculateReqXP(user.level);

        const rank = await this.getRank(user);

        return {
            rank,
            card: user.card,
            level: user.level,
            currentXP: user.xp,
            neededXP
        };
    }

    async getRanks() {
        const users = await kuramisa.database.users.fetchAll();
        const sorted = users.sort((a, b) => b.xp - a.xp);

        return sorted.map((u, i) => ({
            id: u.id,
            xp: u.xp,
            rank: i + 1
        }));
    }

    async getRank(user: IUser) {
        return (await this.getRanks()).find((u) => u.id === user.id)?.rank;
    }
}
