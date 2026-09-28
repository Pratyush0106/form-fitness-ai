import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = path.resolve('.');
const sourcePath = path.resolve(root, '..', '..', 'work', 'test-database', 'form.sqlite');
const targetPath = path.resolve(root, 'private-data', 'form.sqlite');

if (!fs.existsSync(sourcePath)) {
  throw new Error(`No legacy local database found at ${sourcePath}`);
}

const source = new DatabaseSync(sourcePath);
const target = new DatabaseSync(targetPath);
target.exec('PRAGMA foreign_keys=ON;');

const users = source.prepare("SELECT * FROM users WHERE email NOT LIKE '%@example.test'").all();
const states = source.prepare("SELECT * FROM user_state WHERE user_id IN (SELECT id FROM users WHERE email NOT LIKE '%@example.test')").all();
const photos = source.prepare("SELECT * FROM photos WHERE user_id IN (SELECT id FROM users WHERE email NOT LIKE '%@example.test')").all();

const insertUser = target.prepare('INSERT OR IGNORE INTO users (id,email,password_hash,firebase_uid,display_name,created_at) VALUES (?,?,?,?,?,?)');
const insertState = target.prepare('INSERT OR IGNORE INTO user_state (user_id,document,revision) VALUES (?,?,?)');
const insertPhoto = target.prepare('INSERT OR IGNORE INTO photos (id,user_id,mime,data,created_at) VALUES (?,?,?,?,?)');

target.exec('BEGIN IMMEDIATE');
try {
  for (const user of users) insertUser.run(user.id, user.email, user.password_hash, user.firebase_uid, user.display_name, user.created_at);
  for (const state of states) insertState.run(state.user_id, state.document, state.revision);
  for (const photo of photos) insertPhoto.run(photo.id, photo.user_id, photo.mime, photo.data, photo.created_at);
  target.exec('COMMIT');
} catch (error) {
  target.exec('ROLLBACK');
  throw error;
}

console.log(`Migrated ${users.length} local account(s), ${states.length} saved state document(s), and ${photos.length} photo(s).`);
