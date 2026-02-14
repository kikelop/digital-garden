import { notFound } from "next/navigation";
import { getPostBySlug, getPageContent, renderBlock } from "@/lib/notion";

function wrapListItems(html: string, blocks: any[]): string {
  // Build an array of HTML segments paired with their block types
  const segments: { html: string; type: string }[] = blocks.map((block) => ({
    html: renderBlock(block),
    type: block.type,
  }));

  let result = "";
  let i = 0;

  while (i < segments.length) {
    if (segments[i].type === "bulleted_list_item") {
      result += "<ul>";
      while (i < segments.length && segments[i].type === "bulleted_list_item") {
        result += segments[i].html;
        i++;
      }
      result += "</ul>";
    } else if (segments[i].type === "numbered_list_item") {
      result += "<ol>";
      while (i < segments.length && segments[i].type === "numbered_list_item") {
        result += segments[i].html;
        i++;
      }
      result += "</ol>";
    } else {
      result += segments[i].html;
      i++;
    }
  }

  return result;
}

type Props = {
  params: Promise<{ slug: string }>;
};

// Revalidar cada 60 segundos (ISR) - actualiza el contenido sin rebuild
export const revalidate = 60;

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const page = post as any;
  const title = page.properties.Title?.title?.[0]?.plain_text || "Sin título";
  const date = page.properties.Date?.date?.start || "";
  const tags = page.properties.Tags?.multi_select || [];

  // Obtener el contenido de la página
  const blocks = await getPageContent(post.id);

  // Wrap consecutive list items in <ul> or <ol> tags
  const rawHtml = blocks.map(renderBlock).join("");
  const contentHtml = wrapListItems(rawHtml, blocks);

  return (
    <main className="post-main">
      <div className="post-back-bar">
        <a href="/" className="post-back-link">&larr; Back</a>
      </div>

      <article className="post-article">
        <h1 className="article-title">{title}</h1>

        <div className="post-meta">
          {date && <span>{date}</span>}
          {tags.length > 0 && (
            <span className="post-tags">
              {tags.map((tag: any) => (
                <span key={tag.id} className="post-tag">
                  {tag.name}
                </span>
              ))}
            </span>
          )}
        </div>

        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </main>
  );
}
