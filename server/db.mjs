import fs from 'node:fs';import path from 'node:path';import {Pool} from 'pg';
let pool,sqlite;
export async function initDB(){if(process.env.DATABASE_URL){pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:true}:undefined});await pool.query('SELECT 1');}else{if(process.env.NODE_ENV==='production')throw Error('DATABASE_URL is required in production.');const {DatabaseSync}=await import('node:sqlite');const dir=process.env.DATA_DIR||path.resolve('private-data');fs.mkdirSync(dir,{recursive:true});sqlite=new DatabaseSync(path.join(dir,'form.sqlite'));sqlite.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');}
 await query('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,email TEXT NOT NULL,password_hash TEXT,firebase_uid TEXT UNIQUE,display_name TEXT NOT NULL,phone TEXT,created_at TEXT NOT NULL)');
 try{await query('ALTER TABLE users ADD COLUMN phone TEXT')}catch{}
 await query('CREATE UNIQUE INDEX IF NOT EXISTS password_email ON users(email) WHERE firebase_uid IS NULL');
 await query('CREATE TABLE IF NOT EXISTS user_state (user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,document TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 0)');
 await query('CREATE TABLE IF NOT EXISTS password_resets (id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,code_hash TEXT NOT NULL,expires_at TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL)');
 await query(`CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,mime TEXT NOT NULL,data ${pool?'BYTEA':'BLOB'} NOT NULL,created_at TEXT NOT NULL)`);
}
export async function query(sql,params=[]){if(pool){const r=await pool.query(sql,params);return {rows:r.rows,changes:r.rowCount};}const ordered=[];const converted=sql.replace(/\$(\d+)/g,(_,n)=>{ordered.push(params[Number(n)-1]);return '?'});const stmt=sqlite.prepare(converted);if(/^\s*(SELECT|WITH)/i.test(sql)||/RETURNING\s/i.test(sql))return {rows:stmt.all(...ordered)};return {rows:[],changes:stmt.run(...ordered).changes};}
