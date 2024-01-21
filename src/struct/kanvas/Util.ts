import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs().format();
dayjs.extend(duration);

export default class KanvasUtil {
    formatTime(time?: number): string {
        if (!time) return "00:00";
        const format = dayjs.duration(time).format("DD:HH:mm:ss");
        const chunks = format.split(":").filter((c) => c !== "00");

        if (chunks.length < 2) chunks.unshift("00");

        return chunks.join(":");
    }

    rgbToHex(r: number, g: number, b: number) {
        return (
            "#" +
            this.componentToHex(r) +
            this.componentToHex(g) +
            this.componentToHex(b)
        );
    }

    captchaKey(length = 8) {
        if (length < 6) {
            length = 6;
        } else if (length > 20) {
            length = 20;
        }

        let result = "";
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let count = 0;

        while (count < length) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
            count += 1;
        }

        return result;
    }

    componentToHex(c: number) {
        const hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    changeShade(hexColor: string, magnitude: number) {
        hexColor = hexColor.replace(/^#/, "");
        if (hexColor.length === 6) {
            const decimalColor = parseInt(hexColor, 16);
            let r = (decimalColor >> 16) + magnitude;
            r > 255 && (r = 255);
            r < 0 && (r = 0);
            let g = (decimalColor & 0x0000ff) + magnitude;
            g > 255 && (g = 255);
            g < 0 && (g = 0);
            let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
            b > 255 && (b = 255);
            b < 0 && (b = 0);
            return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
        }

        return hexColor;
    }
}
