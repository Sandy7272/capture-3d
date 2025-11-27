import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null;

export const getFFmpeg = async () => {
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  if (ffmpeg) {
    return ffmpeg;
  }
  ffmpeg = new FFmpeg();
  ffmpeg.on("log", ({ message }) => {
    console.log(message);
  });
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
  return ffmpeg;
};

export const concatVideos = async (blobs: Blob[]): Promise<Blob> => {
  const ffmpeg = await getFFmpeg();
  const inputPaths: string[] = [];
  let i = 0;
  for (const blob of blobs) {
    const path = `input${i}.webm`;
    await ffmpeg.writeFile(path, await fetchFile(blob));
    inputPaths.push(path);
    i++;
  }

  // Convert and merge to high-quality MP4
  await ffmpeg.exec([
    "-i",
    `concat:${inputPaths.join("|")}`,
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-crf",
    "15",
    "-pix_fmt",
    "yuv420p",
    "output.mp4",
  ]);

  const data = await ffmpeg.readFile("output.mp4");
  return new Blob([new Uint8Array(data as Uint8Array)], { type: "video/mp4" });
};