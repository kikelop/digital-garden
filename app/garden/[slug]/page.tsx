import { notFound } from "next/navigation";
import { getPostBySlug, getPageContent, renderBlock } from "@/lib/notion";

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
  const contentHtml = blocks.map(renderBlock).join("");

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 40, fontFamily: "system-ui" }}>
      <div className="post-back-bar">
        <a href="/" className="post-back-link">&larr; Back</a>
      </div>

      <article style={{ marginTop: 24 }}>
        <h1 style={{ marginBottom: 8 }}>{title}</h1>

        <div style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
          {date && <span>{date}</span>}
          {tags.length > 0 && (
            <span style={{ marginLeft: 16 }}>
              {tags.map((tag: any) => (
                <span
                  key={tag.id}
                  style={{
                    background: "#eee",
                    padding: "2px 8px",
                    borderRadius: 4,
                    marginRight: 8,
                    fontSize: 12,
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </span>
          )}
        </div>

        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
          style={{ lineHeight: 1.7 }}
        />
      </article>

      <style>{`
        .content h1, .content h2, .content h3 { margin-top: 1.5em; }
        .content p { margin: 1em 0; }
        .content blockquote { border-left: 3px solid #ccc; padding-left: 1em; color: #555; margin: 1em 0; }
        .content pre { background: #f5f5f5; padding: 1em; overflow-x: auto; border-radius: 4px; }
        .content code { background: #f0f0f0; padding: 2px 4px; border-radius: 2px; }
        .content pre code { background: none; padding: 0; }
        .content img { max-width: 100%; height: auto; border-radius: 8px; }
        .content figure { margin: 1.5em 0; }
        .content figcaption { text-align: center; color: #666; font-size: 14px; margin-top: 8px; }
        .content .callout { background: #f9f9f9; padding: 1em; border-radius: 4px; margin: 1em 0; }
        .content a { color: #0066cc; }
        .content ul, .content ol { padding-left: 1.5em; }
        .content li { margin: 0.5em 0; }
        .content hr { border: none; border-top: 1px solid #eee; margin: 2em 0; }
      `}</style>
    </main>
  );
}
