import { spawn } from "child_process";
import { Readable } from "stream";

export type ProgressHandler = (
    percent: number,
    raw?: Record<string, string>,
) => void;

export const transcodeToMp4Stream = (
    input: string,
    {
        width = 1280,
        height = 720,
        vcodec = "libx264",
        extra = [],
    }: {
        width?: number;
        height?: number;
        vcodec?: string;
        extra?: string[];
    } = {},
    onProgress?: ProgressHandler,
): Readable => {
    const args = [
        "-hide_banner",
        "-progress",
        "pipe:2",
        "-i",
        input,

        // preserve AR without stretching; replace with pad(...) if you want letterboxing
        "-vf",
        `scale=${width}:${height}:force_original_aspect_ratio=decrease`,

        "-c:v",
        vcodec,
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",

        // reasonable default audio
        "-c:a",
        "aac",
        "-b:a",
        "192k",

        // fragmented MP4 for streaming + Discord preview
        "-movflags",
        "frag_keyframe+empty_moov",

        "-f",
        "mp4",
        "pipe:1",
        ...extra,
    ];

    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });

    if (onProgress) {
        let lastPct = -1;
        proc.stderr.on("data", (buf) => {
            const lines = buf.toString().split(/\r?\n/);
            const kv: Record<string, string> = {};
            for (const line of lines) {
                const [k, v] = line.split("=");
                if (k && v) kv[k] = v;
            }
            if (kv.out_time_ms) {
                const ms = Number(kv.out_time_ms);
                if (Number.isFinite(ms)) {
                    const pct = Math.min(
                        99,
                        Math.max(0, Math.floor((ms % 100000) / 1000)),
                    );
                    if (pct !== lastPct) {
                        lastPct = pct;
                        onProgress(pct, kv);
                    }
                }
            } else if (kv.progress === "end") {
                onProgress(100, kv);
            }
        });
    }

    proc.on("close", (code) => {
        if (code !== 0)
            (proc.stdout as Readable).emit(
                "error",
                new Error(`ffmpeg exited with ${code}`),
            );
    });

    return proc.stdout;
};
