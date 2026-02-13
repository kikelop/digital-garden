import { getPublishedPosts } from "@/lib/notion";

export default async function DebugPage() {
  const posts = await getPublishedPosts();

  return (
    <main style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>Debug: Propiedades de Notion</h1>
      {posts.map((post: any) => (
        <div key={post.id} style={{ marginBottom: 40, background: "#f5f5f5", padding: 20, borderRadius: 8 }}>
          <h2>{post.properties.Title?.title?.[0]?.plain_text}</h2>
          <pre style={{ overflow: "auto", fontSize: 12 }}>
            {JSON.stringify(post.properties, null, 2)}
          </pre>
        </div>
      ))}
    </main>
  );
}
