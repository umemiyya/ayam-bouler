import 'server-only';
import { Client } from '@notionhq/client';

if (!process.env.NOTION_API_KEY) {
  throw new Error('NOTION_API_KEY belum diset di environment variables.');
}
if (!process.env.NOTION_DATABASE_ID) {
  throw new Error('NOTION_DATABASE_ID belum diset di environment variables.');
}

export const notion = new Client({ auth: process.env.NOTION_API_KEY });

export const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

/**
 * Nama-nama property pada Notion database bisa disesuaikan lewat env
 * jika nama kolom di database Anda berbeda dari default di bawah ini.
 *
 * Kolom yang WAJIB ada di Notion database:
 * - Username   (Title)
 * - Password   (Rich text)   -> menyimpan HASH password (bcrypt), bukan plain text
 * - Role       (Select, opsi: "admin" dan "user")
 * - CreatedAt  (Date)
 */
export const NOTION_PROPS = {
  username: process.env.NOTION_PROP_USERNAME || 'Username',
  password: process.env.NOTION_PROP_PASSWORD || 'Password',
  role: process.env.NOTION_PROP_ROLE || 'Role',
  createdAt: process.env.NOTION_PROP_CREATED_AT || 'CreatedAt',
};