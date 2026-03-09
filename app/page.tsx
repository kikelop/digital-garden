import { getPublishedPosts } from "@/lib/notion";
import FilterPanel from "@/components/FilterPanel";
import PostList from "@/components/PostList";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ tag?: string; sort?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const { tag: selectedTag, sort = "newest" } = await searchParams;
  const allPosts = await getPublishedPosts();

  // Count posts per tag
  const tagCounts: Record<string, number> = {};
  allPosts.forEach((post: any) => {
    const tags = post.properties.Tags?.multi_select || [];
    tags.forEach((t: any) => {
      tagCounts[t.name] = (tagCounts[t.name] || 0) + 1;
    });
  });

  const allTags = Object.keys(tagCounts).sort();

  // Filter posts by tag if one is selected
  let posts = selectedTag
    ? allPosts.filter((post: any) =>
        post.properties.Tags?.multi_select?.some((t: any) => t.name === selectedTag)
      )
    : [...allPosts];

  // Sort posts by date, pinned posts always first
  posts = posts.sort((a: any, b: any) => {
    const aPinned = a.properties.Select?.select?.name === "Pin";
    const bPinned = b.properties.Select?.select?.name === "Pin";
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    const dateA = a.properties.Date?.date?.start ?? "";
    const dateB = b.properties.Date?.date?.start ?? "";
    if (sort === "oldest") {
      return dateA.localeCompare(dateB);
    }
    return dateB.localeCompare(dateA);
  });

  // Format date as YYYY.MM.DD
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.replace(/-/g, ".");
  };

  return (
    <div className="page-layout">
      {/* Sidebar */}
      <aside className="page-sidebar">
        <div className="sidebar-description">
          <span className="sidebar-description__label">/ DIGITAL GARDEN</span>
          <p className="sidebar-description__title">Building, creating and thinking in public.</p>
          <p className="sidebar-description__text">Experiments, design projects, notes on whatever I like. Always evolving.</p>
        </div>
        <FilterPanel
          allTags={allTags}
          tagCounts={tagCounts}
          selectedTag={selectedTag}
          sort={sort}
        />
      </aside>

      {/* Main content */}
      <main className="page-main">
        {/* Table header - desktop only */}
        <div className="table-header">
          <span className="table-header__col">/ DATE</span>
          <span className="table-header__col">/ NAME</span>
        </div>

        {/* Posts list */}
        <PostList
          posts={posts.map((post: any) => {
            const title = post.properties.Title?.title?.[0]?.plain_text ?? "Sin título";
            const slug = post.properties.Slug?.rich_text?.[0]?.plain_text || post.id;
            const date = formatDate(post.properties.Date?.date?.start ?? "");
            const externalUrl = post.properties.url?.url;
            const href = externalUrl || `/garden/${slug}`;
            const isExternal = !!externalUrl;
            const isPinned = post.properties.Select?.select?.name === "Pin";
            const files = post.properties["Files & media"]?.files ?? [];
            const imageUrl = files.length > 0
              ? (files[0].type === "external" ? files[0].external.url : files[0].file?.url ?? null)
              : null;

            return { id: post.id, title, slug, date, href, isExternal, isPinned, imageUrl };
          })}
        />

        {posts.length === 0 && (
          <p style={{ color: "#666", padding: "40px 0" }}>
            No hay posts {selectedTag ? `con el tag "${selectedTag}"` : "publicados"}.
          </p>
        )}
      </main>
    </div>
  );
}
