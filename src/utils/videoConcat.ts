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

  await ffmpeg.exec([
    "-i",
    `concat:${inputPaths.join("|")}`,
    "-c",
    "copy",
    "output.webm",
  ]);

  const data = await ffmpeg.readFile("output.webm");
  // The Uint8Array returned by readFile may be a view on a SharedArrayBuffer,
  // which can cause issues with the Blob constructor. Creating a new Uint8Array
  // creates a copy with a regular ArrayBuffer, ensuring compatibility.
  return new Blob([new Uint8Array(data as Uint8Array)], { type: "video/webm" });
};