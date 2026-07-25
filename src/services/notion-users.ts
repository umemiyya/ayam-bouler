import 'server-only';
import { notion, NOTION_DATABASE_ID, NOTION_PROPS } from '@/lib/notion';
import type { NotionUserRecord, UserRole } from '@/types/auth';

// Minimal typing untuk hasil query Notion, cukup untuk kebutuhan kita.
type NotionPageResult = {
  id: string;
  properties: Record<string, any>;
};

function mapPageToUser(page: NotionPageResult): NotionUserRecord {
  const props = page.properties;

  const username: string = props[NOTION_PROPS.username]?.title?.[0]?.plain_text ?? '';
  const passwordHash: string = props[NOTION_PROPS.password]?.rich_text?.[0]?.plain_text ?? '';
  const role: UserRole = (props[NOTION_PROPS.role]?.select?.name as UserRole) ?? 'user';
  const createdAt: string =
    props[NOTION_PROPS.createdAt]?.date?.start ?? new Date().toISOString();

  return { id: page.id, username, passwordHash, role, createdAt };
}

export async function findUserByUsername(username: string): Promise<NotionUserRecord | null> {
  const response = await notion.databases.query({
    database_id: NOTION_DATABASE_ID,
    filter: {
      property: NOTION_PROPS.username,
      title: { equals: username },
    },
    page_size: 1,
  });

  const page = response.results[0] as NotionPageResult | undefined;
  if (!page) return null;

  return mapPageToUser(page);
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  role: UserRole;
}): Promise<NotionUserRecord> {
  const createdAt = new Date().toISOString();

  const page = await notion.pages.create({
    parent: { database_id: NOTION_DATABASE_ID },
    properties: {
      [NOTION_PROPS.username]: {
        title: [{ text: { content: input.username } }],
      },
      [NOTION_PROPS.password]: {
        rich_text: [{ text: { content: input.passwordHash } }],
      },
      [NOTION_PROPS.role]: {
        select: { name: input.role },
      },
      [NOTION_PROPS.createdAt]: {
        date: { start: createdAt },
      },
    },
  });

  return mapPageToUser(page as unknown as NotionPageResult);
}