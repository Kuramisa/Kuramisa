import { createCanvas, loadImage } from "@napi-rs/canvas";

export default class KanvasModify {
    async darkness(_image: string, amount: number) {
        const image = await loadImage(_image);

        const canvas = await createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] -= amount;
            imageData.data[i + 1] -= amount;
            imageData.data[i + 2] -= amount;
        }

        ctx.putImageData(imageData, 0, 0);

        return canvas.toBuffer("image/png");
    }

    async greyscale(_image: string) {
        const image = await loadImage(_image);

        const canvas = await createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            const brightness =
                0.34 * imageData.data[i] +
                0.5 * imageData.data[i + 1] +
                0.16 * imageData.data[i + 2];
            imageData.data[i] = brightness;
            imageData.data[i + 1] = brightness;
            imageData.data[i + 2] = brightness;
        }

        ctx.putImageData(imageData, 0, 0);

        return canvas.toBuffer("image/png");
    }

    async invert(_image: string) {
        const image = await loadImage(_image);

        const canvas = await createCanvas(image.width, image.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = 255 - imageData.data[i];
            imageData.data[i + 1] = 255 - imageData.data[i + 1];
            imageData.data[i + 2] = 255 - imageData.data[i + 2];
        }

        ctx.putImageData(imageData, 0, 0);

        return canvas.toBuffer("image/png");
    }
}
