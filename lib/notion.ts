import { Client } from "@notionhq/client";
import { unstable_cache } from "next/cache";

const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;

if (!token) throw new Error("Falta NOTION_TOKEN en .env.local");
if (!databaseId) throw new Error("Falta NOTION_DATABASE_ID en .env.local");

export const notion = new Client({ auth: token });
export const DATABASE_ID = databaseId;

// Obtener posts publicados (con caché de 60s)
export const getPublishedPosts = unstable_cache(
  async () => {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "Status",
        status: {
          equals: "Published",
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });
    return response.results;
  },
  ["published-posts"],
  { revalidate: 60 }
);

// Obtener un post por slug o ID (con caché)
export const getPostBySlug = unstable_cache(
  async (slug: string) => {
    const isUUID = slug.match(/^[0-9a-f-]{36}$/i);

    if (isUUID) {
      try {
        const page = await notion.pages.retrieve({ page_id: slug });
        return page;
      } catch {
        return null;
      }
    }

    try {
      const response = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
          and: [
            {
              property: "Slug",
              rich_text: {
                equals: slug,
              },
            },
            {
              property: "Status",
              status: {
                equals: "Published",
              },
            },
          ],
        },
      });
      return response.results[0] || null;
    } catch {
      return null;
    }
  },
  ["post-by-slug"],
  { revalidate: 60 }
);

// Obtener bloques (contenido) de una página (con caché)
export const getPageContent = unstable_cache(
  async (pageId: string) => {
    const blocks = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    return blocks.results;
  },
  ["page-content"],
  { revalidate: 60 }
);

// Renderizar un bloque a HTML simple
export function renderBlock(block: any): string {
  const { type } = block;

  switch (type) {
    case "paragraph":
      return `<p>${renderRichText(block.paragraph.rich_text)}</p>`;

    case "heading_1":
      return `<h1>${renderRichText(block.heading_1.rich_text)}</h1>`;

    case "heading_2":
      return `<h2>${renderRichText(block.heading_2.rich_text)}</h2>`;

    case "heading_3":
      return `<h3>${renderRichText(block.heading_3.rich_text)}</h3>`;

    case "bulleted_list_item":
      return `<li>${renderRichText(block.bulleted_list_item.rich_text)}</li>`;

    case "numbered_list_item":
      return `<li>${renderRichText(block.numbered_list_item.rich_text)}</li>`;

    case "quote":
      return `<blockquote>${renderRichText(block.quote.rich_text)}</blockquote>`;

    case "code":
      return `<pre><code>${renderRichText(block.code.rich_text)}</code></pre>`;

    case "divider":
      return `<hr />`;

    case "image": {
      const url = block.image.type === "external"
        ? block.image.external.url
        : block.image.file.url;
      const caption = block.image.caption?.[0]?.plain_text || "";
      return `<figure><img src="${url}" alt="${caption}" />${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;
    }

    case "callout": {
      const icon = block.callout.icon?.emoji || "";
      return `<div class="callout">${icon} ${renderRichText(block.callout.rich_text)}</div>`;
    }

    default:
      return `<!-- Bloque no soportado: ${type} -->`;
  }
}

// Renderizar rich text a HTML
function renderRichText(richText: any[]): string {
  if (!richText || richText.length === 0) return "";

  return richText
    .map((text) => {
      let content = text.plain_text;

      if (text.annotations.bold) content = `<strong>${content}</strong>`;
      if (text.annotations.italic) content = `<em>${content}</em>`;
      if (text.annotations.strikethrough) content = `<del>${content}</del>`;
      if (text.annotations.code) content = `<code>${content}</code>`;
      if (text.href) content = `<a href="${text.href}">${content}</a>`;

      return content;
    })
    .join("");
}
