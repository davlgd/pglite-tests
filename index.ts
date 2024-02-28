import { PGlite } from "@electric-sql/pglite";
import { init_file } from './file_tools.ts';
import * as path from 'path';
import { mkdir } from "node:fs/promises";

const db_path = ".db/pglite";
console.log("Hello from Bun pglite demo!");

async function main() {
    //await init_file(db_path);
    await mkdir(path.dirname(db_path), { recursive: true });
    const db = new PGlite(db_path);
    console.log(path.dirname(db_path));
    await db.query("select 'Hello world' as message;");
    console.log("Hello via Bun pglite demo!");
}

main().catch(console.error);