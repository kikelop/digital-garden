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
