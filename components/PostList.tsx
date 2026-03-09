"use client";

import { useState, useCallback, useRef, useEffect } from "react";

type Post = {
  id: string;
  title: string;
  slug: string;
  date: string;
  href: string;
  isExternal: boolean;
  isPinned: boolean;
  imageUrl: string | null;
};

const canHover = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export default function PostList({ posts }: { posts: Post[] }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canHover) return;
    posts.forEach((post) => {
      if (post.imageUrl) {
        const img = new Image();
        img.src = post.imageUrl;
      }
    });
  }, [posts]);

  const PREVIEW_W = 300;
  const OFFSET = 20;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const previewH = previewRef.current?.offsetHeight ?? 220;
    const x = e.clientX + OFFSET + PREVIEW_W > vw
      ? e.clientX - PREVIEW_W - OFFSET
      : e.clientX + OFFSET;
    const y = e.clientY + OFFSET + previewH > vh
      ? e.clientY - previewH - OFFSET
      : e.clientY + OFFSET;
    setPos({ x, y });
  }, []);

  return (
    <>
      <div>
        {posts.map((post) => (
          <div
            key={post.id}
            className={`post-item ${post.isPinned ? "post-item--pinned" : ""}`}
            onClick={() => post.isExternal ? window.open(post.href, "_blank", "noopener,noreferrer") : window.location.href = post.href}
            onMouseEnter={() => { if (canHover && post.imageUrl) { setImgLoaded(false); setPreviewUrl(post.imageUrl); } }}
            onMouseLeave={() => { if (canHover) { setPreviewUrl(null); setImgLoaded(false); } }}
            onMouseMove={canHover && post.imageUrl ? handleMouseMove : undefined}
          >
            <span className="post-date">{post.date}</span>
            <a
              href={post.href}
              target={post.isExternal ? "_blank" : undefined}
              rel={post.isExternal ? "noopener noreferrer" : undefined}
              className="post-title"
            >
              {post.title}
              {post.isExternal && " ↗"}
            </a>
            {post.isPinned && (
              <svg className="post-pin-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" fill="currentColor"/>
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Floating image preview — desktop only, follows cursor */}
      <div
        ref={previewRef}
        className={`post-preview-float ${previewUrl ? "post-preview-float--visible" : ""} ${imgLoaded ? "post-preview-float--loaded" : ""}`}
        style={{ left: pos.x, top: pos.y }}
      >
        {previewUrl && <img src={previewUrl} alt="Post preview" onLoad={() => setImgLoaded(true)} />}
      </div>
    </>
  );
}
