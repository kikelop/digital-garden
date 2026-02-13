"use client";

import { useState } from "react";
import Link from "next/link";

type FilterPanelProps = {
  allTags: string[];
  tagCounts: Record<string, number>;
  selectedTag?: string;
  sort: string;
};

export default function FilterPanel({
  allTags,
  tagCounts,
  selectedTag,
  sort,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Build URL with current params
  const buildUrl = (params: { tag?: string; sort?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.tag) searchParams.set("tag", params.tag);
    if (params.sort && params.sort !== "newest") searchParams.set("sort", params.sort);
    const query = searchParams.toString();
    return query ? `/?${query}` : "/";
  };

  return (
    <>
      {/* Mobile filter toggle */}
      <button
        className="filter-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>/ FILTER</span>
        <svg
          className={`filter-toggle__icon ${isOpen ? "filter-toggle__icon--open" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Filter content */}
      <div className={`filter-content ${isOpen ? "filter-content--open" : ""}`}>
        <span className="sidebar-description__label">/ FILTER</span>

        {/* Tags filter */}
        <div style={{ marginBottom: 32 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 12,
              color: "#333",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 20C3.45 20 2.97933 19.8043 2.588 19.413C2.19667 19.0217 2.00067 18.5507 2 18V6C2 5.45 2.196 4.97933 2.588 4.588C2.98 4.19667 3.45067 4.00067 4 4H10L12 6H20C20.55 6 21.021 6.196 21.413 6.588C21.805 6.98 22.0007 7.45067 22 8V18C22 18.55 21.8043 19.021 21.413 19.413C21.0217 19.805 20.5507 20.0007 20 20H4ZM4 18H20V8H11.175L9.175 6H4V18Z"
                fill="currentColor"
              />
            </svg>
            Topic
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginLeft: 22,
            }}
          >
            {allTags.map((tag) => (
              <Link
                key={tag}
                href={
                  selectedTag === tag
                    ? buildUrl({ sort })
                    : buildUrl({ tag, sort })
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#333",
                  textDecoration: "none",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    background: selectedTag === tag ? "#000" : "transparent",
                    color: selectedTag === tag ? "#fff" : "transparent",
                  }}
                >
                  {selectedTag === tag && "✓"}
                </span>
                {tag} ({tagCounts[tag]})
              </Link>
            ))}
          </div>
        </div>

        {/* Sort filter */}
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 12,
              color: "#333",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 19.88C15.04 20.18 14.94 20.5 14.71 20.71C14.6175 20.8027 14.5076 20.8763 14.3866 20.9264C14.2657 20.9766 14.136 21.0024 14.005 21.0024C13.874 21.0024 13.7444 20.9766 13.6234 20.9264C13.5024 20.8763 13.3925 20.8027 13.3 20.71L9.29001 16.7C9.18101 16.5933 9.09812 16.4629 9.04782 16.319C8.99751 16.175 8.98115 16.0213 9.00001 15.87V10.75L4.21001 4.62C4.04762 4.41153 3.97434 4.14726 4.0062 3.88493C4.03805 3.6226 4.17244 3.38355 4.38001 3.22C4.57001 3.08 4.78001 3 5.00001 3H19C19.22 3 19.43 3.08 19.62 3.22C19.8276 3.38355 19.962 3.6226 19.9938 3.88493C20.0257 4.14726 19.9524 4.41153 19.79 4.62L15 10.75V19.88ZM7.04001 5L11 10.06V15.58L13 17.58V10.05L16.96 5H7.04001Z"
                fill="currentColor"
              />
            </svg>
            Order by
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginLeft: 22,
            }}
          >
            <Link
              href={buildUrl({ tag: selectedTag, sort: "newest" })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#333",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  background: sort === "newest" ? "#000" : "transparent",
                  color: sort === "newest" ? "#fff" : "transparent",
                }}
              >
                {sort === "newest" && "✓"}
              </span>
              Most recent
            </Link>
            <Link
              href={buildUrl({ tag: selectedTag, sort: "oldest" })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#333",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  background: sort === "oldest" ? "#000" : "transparent",
                  color: sort === "oldest" ? "#fff" : "transparent",
                }}
              >
                {sort === "oldest" && "✓"}
              </span>
              Oldest first
            </Link>
          </div>
        </div>

        {(selectedTag || sort !== "newest") && (
          <div style={{ marginTop: 24 }}>
            <Link href="/" className="filter-clear">
              CLEAR FILTERS
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
