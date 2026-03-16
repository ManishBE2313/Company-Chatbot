import dotenv from "dotenv";
import path from "path";

let loaded = false;

export function loadEnv() {
  if (loaded) {
    return;
  }

  dotenv.config({
    path: path.resolve(process.cwd(), ".env"),
    quiet: true,
  });

  loaded = true;
}
