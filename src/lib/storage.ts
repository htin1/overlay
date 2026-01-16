// In-memory storage for Vercel serverless compatibility
// Files persist within a session but are lost on cold starts (acceptable for prototyping)
const memoryStore = new Map<string, Buffer>();

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const storage = {
  async upload(file: Buffer, filename: string): Promise<string> {
    memoryStore.set(filename, file);
    return `${BASE_URL}/api/media/${filename}`;
  },

  read(filename: string): Buffer | null {
    return memoryStore.get(filename) ?? null;
  },

  async delete(filename: string): Promise<void> {
    memoryStore.delete(filename);
  },
};
