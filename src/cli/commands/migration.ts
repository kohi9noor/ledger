import { getConfig } from "../../config/get-config";
import { getDB } from "../../helper/get-db";

export async function migration() {
  try {
    const config = getConfig();
    const db = getDB(config);
    return await db.migrate();
  } catch (error) {
    throw error;
  }
}

await migration();
