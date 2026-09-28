import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
const dbPath=path.resolve('private-data','form.sqlite');
const db=new DatabaseSync(dbPath);
console.log('Database:',dbPath);
console.table(db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all());
for(const table of ['users','user_state','photos']) console.log(`${table}:`,db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count);
console.table(db.prepare('SELECT id, email, firebase_uid IS NOT NULL AS google_account, display_name, created_at FROM users ORDER BY created_at DESC').all());
