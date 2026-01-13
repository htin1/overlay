import fs from "fs";
import path from "path";

const MEDIA_DIR = path.join(process.cwd(), "tmp/media");
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Ensure directory exists
fs.mkdirSync(MEDIA_DIR, { recursive: true });

export const storage = {
  async upload(file: Buffer, filename: string): Promise<string> {
    fs.writeFileSync(path.join(MEDIA_DIR, filename), file);
    return `${BASE_URL}/api/media/${filename}`;
  },

  read(filename: string): Buffer | null {
    const filepath = path.join(MEDIA_DIR, filename);
    return fs.existsSync(filepath) ? fs.readFileSync(filepath) : null;
  },

  async delete(filename: string): Promise<void> {
    const filepath = path.join(MEDIA_DIR, filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  },
};
