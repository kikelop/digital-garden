"use client";

import { useState } from "react";

const tk = {
  bg: "#ffffff",
  bgMuted: "#f9f9f9",
  border: "#e5e5e5",
  accent: "#FF4921",
  textPrimary: "#000000",
  textBody: "#555555",
  textMuted: "#999999",
};

const blocks: Record<string, { title: string; subtitle: string; info: string }> = {
  agentteams: {
    title: "Agent Teams",
    subtitle: "Multiple sessions coordinating in parallel — the highest level",
    info: "Multiple Claude Code sessions running in parallel across separate terminals, coordinating to work on different parts of a task simultaneously. One level above subagents — like a whole department working together.",
  },
  session: {
    title: "Single Session",
    subtitle: "One Claude Code instance (Terminal / VSCode)",
    info: "A single Claude Code instance running in your terminal or VSCode. Everything happens inside a session: context loading, skill matching, hook execution, subagent delegation, and MCP tool access.",
  },
  context: {
    title: "Context Layer — CLAUDE.md",
    subtitle: "The foundation. Always loaded into every conversation.",
    info: "CLAUDE.md files load into every conversation automatically. Three levels like layers: team (shared via repo), personal (.local.md, not shared), and global (~/.claude/CLAUDE.md, follows you everywhere). Always using context window space — it's the constitution of your project.",
  },
  skills: {
    title: "Skills",
    subtitle: "On-demand knowledge — loads when semantically matched",
    info: "Markdown files with specialized knowledge that load on demand. Claude reads the description, decides if it's relevant, and only then loads the full content. Stored in ~/.claude/skills/ (personal) or .claude/skills/ (project). Keep SKILL.md under 500 lines — use progressive disclosure for the rest.",
  },
  hooks: {
    title: "Hooks",
    subtitle: "Scripts that fire automatically on system events",
    info: "Scripts that run automatically on system events. They don't add knowledge — they execute code. Defined in settings.json. exit(0) = proceed, exit(2) = block. Like security guards watching every action, they never forget.",
  },
  subagents: {
    title: "Subagents",
    subtitle: "Delegated workers with isolated context",
    info: "Specialized AI assistants Claude creates within your session. Each has its own isolated context, system prompt, and tool permissions. Built-in: Explorer (read-only) and Plan (research). Custom ones go in .claude/agents/. They don't see skills unless explicitly listed.",
  },
  commands: {
    title: "Slash Commands",
    subtitle: "Manual triggers — you type them, unlike skills",
    info: "Shortcuts you type manually like /review or /commit. They trigger predefined prompts. The key difference: commands require you to type them — skills activate automatically by semantic matching.",
  },
  plugins: {
    title: "Plugins",
    subtitle: "Installed packages — bundle skills + commands + subagents",
    info: "Bundled packages that can contain skills, subagents, and commands together. Distributable via marketplaces. Like an app you install that brings multiple features at once. Lowest priority in skill hierarchy.",
  },
  controls: {
    title: "Session Controls",
    subtitle: "Manage context window and behavior",
    info: "Four levels of reset — from pause to full wipe. Plan Mode for safe read-only exploration (Shift+Tab). Extended Thinking for deeper reasoning (Option+T). Two independent dimensions of control over the same tool.",
  },
  mcp: {
    title: "MCP Servers",
    subtitle: "External tools — add capabilities, not knowledge",
    info: "External connections that give Claude new capabilities. They don't add knowledge — they add tools. Like plugins connecting Claude to the outside world. Add globally: claude mcp add --scope user. Scopes: local, project, user.",
  },
};

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 500,
      background: tk.bgMuted,
      color: tk.textBody,
      border: `1px solid ${tk.border}`,
      lineHeight: "18px",
      marginRight: 4,
      marginTop: 6,
    }}
  >
    {children}
  </span>
);

const Item = ({ name, desc }: { name: string; desc?: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 8,
      padding: "6px 0",
      borderBottom: `1px solid ${tk.border}`,
    }}
  >
    <div
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: tk.accent,
        marginTop: 6,
        flexShrink: 0,
      }}
    />
    <div style={{ fontSize: 14 }}>
      <span style={{ fontWeight: 600, color: tk.textPrimary }}>{name}</span>
      {desc && <span style={{ color: tk.textBody }}> — {desc}</span>}
    </div>
  </div>
);

const StepNum = ({ n }: { n: number | string }) => (
  <div
    style={{
      width: 24,
      height: 24,
      borderRadius: 12,
      background: tk.accent,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      fontWeight: 700,
      color: "#ffffff",
      flexShrink: 0,
    }}
  >
    {n}
  </div>
);

const Block = ({
  id,
  num,
  children,
  active,
  onToggle,
  bg = tk.bg,
  style: s = {},
}: {
  id: string;
  num?: number | string;
  children?: React.ReactNode;
  active: boolean;
  onToggle: (id: string) => void;
  bg?: string;
  style?: React.CSSProperties;
}) => {
  const [hovered, setHovered] = useState(false);
  const { title, subtitle, info } = blocks[id];

  return (
    <div
      id={id}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(id);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        border: `0.5px solid ${active ? tk.accent : hovered ? tk.textPrimary : tk.border}`,
        borderRadius: 12,
        padding: "16px 18px",
        cursor: "pointer",
        transition: "border-color 0.15s ease",
        ...s,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        {num !== undefined && <StepNum n={num} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: tk.textPrimary, lineHeight: 1.3 }}>
            {title}
          </div>
          <div style={{ fontSize: 13, color: tk.textBody, marginTop: 3, lineHeight: 1.4 }}>
            {subtitle}
          </div>
        </div>
        <span
          style={{
            fontSize: 20,
            color: tk.accent,
            transition: "transform 0.15s",
            transform: active ? "rotate(45deg)" : "none",
            fontWeight: 300,
            lineHeight: 1,
            marginTop: -2,
            marginRight: -2,
            flexShrink: 0,
          }}
        >
          +
        </span>
      </div>
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
      {active && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 14px",
            background: tk.bg,
            borderRadius: 8,
            fontSize: 13,
            color: tk.textBody,
            lineHeight: 1.75,
            border: `0.5px solid ${tk.border}`,
          }}
        >
          {info}
        </div>
      )}
    </div>
  );
};

const VConn = ({ label }: { label: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px 0",
      gap: 10,
    }}
  >
    <div style={{ height: 1, flex: 1, background: tk.border }} />
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 1, height: 10, background: tk.border }} />
      <div
        style={{
          padding: "3px 12px",
          borderRadius: 20,
          background: tk.bg,
          border: `1px solid ${tk.accent}44`,
          fontSize: 11,
          fontWeight: 600,
          color: tk.accent,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div style={{ width: 1, height: 10, background: tk.border }} />
    </div>
    <div style={{ height: 1, flex: 1, background: tk.border }} />
  </div>
);


export default function ClaudeEcosystemPage() {
  const [active, setActive] = useState<string | null>(null);
  const toggle = (id: string) => setActive(active === id ? null : id);

  return (
    <main style={{ background: tk.bg, minHeight: "100vh", padding: "40px 20px 80px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Back link */}
          <div style={{ marginBottom: 32 }}>
            <a href="/" style={{ fontSize: 14, color: tk.textMuted, textDecoration: "none" }}>
              &larr; Back
            </a>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <span
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 600,
                color: tk.accent,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 10,
              }}
            >
              Interactive map
            </span>
            <h1
              style={{
                fontSize: 32,
                fontWeight: 800,
                margin: 0,
                color: tk.textPrimary,
                lineHeight: 1.1,
              }}
            >
              Claude Code Ecosystem
            </h1>
            <p style={{ fontSize: 16, color: tk.textBody, margin: "10px 0 0", lineHeight: 1.6 }}>
              All building blocks and how they work together — click any block for details
            </p>
          </div>

          {/* 1. Agent Teams */}
          <Block id="agentteams" num="1" active={active === "agentteams"} onToggle={toggle}>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    background: tk.bg,
                    borderRadius: 10,
                    padding: "10px 12px",
                    border: `0.5px solid ${tk.border}`,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: tk.accent, marginBottom: 6 }}>
                    Session {i}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {["CLAUDE.md", "Skills", "Hooks", "Subagents", "MCP"].map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: tk.bgMuted,
                          color: tk.textBody,
                          border: `0.5px solid ${tk.border}`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Block>

          <VConn label="each session = all of this ↓" />

          {/* 2. Single Session container */}
          <div
            style={{
              border: `0.5px solid ${tk.border}`,
              borderRadius: 16,
              padding: 18,
              background: tk.bg,
            }}
          >
            {/* Session header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: active === "session" ? 0 : 16,
                cursor: "pointer",
                padding: "0 2px",
              }}
              onClick={() => toggle("session")}
            >
              <StepNum n="2" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: tk.textPrimary }}>
                  Single Session
                </span>
                <span style={{ fontSize: 14, color: tk.textBody }}>
                  {" "}— one Claude Code instance (Terminal / VSCode)
                </span>
              </div>
              <span
                style={{
                  fontSize: 20,
                  color: tk.accent,
                  transition: "transform 0.15s",
                  transform: active === "session" ? "rotate(45deg)" : "none",
                  fontWeight: 300,
                  lineHeight: 1,
                  marginTop: -2,
                  marginRight: -2,
                }}
              >
                +
              </span>
            </div>

            {active === "session" && (
              <div
                style={{
                  margin: "12px 0 16px",
                  padding: "12px 14px",
                  background: tk.bg,
                  borderRadius: 8,
                  fontSize: 13,
                  color: tk.textBody,
                  lineHeight: 1.75,
                  border: `0.5px solid ${tk.border}`,
                }}
              >
                {blocks.session.info}
              </div>
            )}

            {/* Context Layer */}
            <Block id="context" active={active === "context"} onToggle={toggle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { n: "CLAUDE.md", d: "Team rules — shared via repo" },
                  { n: "CLAUDE.local.md", d: "Personal tweaks — not shared" },
                  { n: "~/.claude/CLAUDE.md", d: "Global — all your projects" },
                ].map((x, i) => (
                  <div
                    key={i}
                    style={{
                      background: tk.bg,
                      borderRadius: 8,
                      padding: "10px 12px",
                      border: `0.5px solid ${tk.border}`,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: tk.accent, marginBottom: 3 }}>
                      {x.n}
                    </div>
                    <div style={{ fontSize: 12, color: tk.textBody }}>{x.d}</div>
                  </div>
                ))}
              </div>
            </Block>

            <VConn label="feeds context to everything below ↓" />

            {/* Skills + Hooks */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <Block id="skills" active={active === "skills"} onToggle={toggle}>
                <Item name="Personal" desc="~/.claude/skills/" />
                <Item name="Project" desc=".claude/skills/ — shared via repo" />
                <Item name="Enterprise" desc="Managed, highest priority" />
                <div style={{ marginTop: 6 }}>
                  <Pill>SKILL.md &lt; 500 lines</Pill>
                  <Pill>Request-driven</Pill>
                </div>
              </Block>

              <Block id="hooks" active={active === "hooks"} onToggle={toggle}>
                <Item name="PreToolUse" desc="Before actions — validate, block" />
                <Item name="PostToolUse" desc="After actions — format, lint" />
                <Item name="Stop" desc="When Claude finishes responding" />
                <Item name="Notification" desc="On alerts, custom triggers" />
                <div style={{ marginTop: 6 }}>
                  <Pill>exit(0) proceed</Pill>
                  <Pill>exit(2) block</Pill>
                </div>
              </Block>
            </div>

            {/* Subagents + Commands */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <Block id="subagents" active={active === "subagents"} onToggle={toggle}>
                <Item name="Explorer" desc="Built-in, read-only codebase search" />
                <Item name="Plan" desc="Built-in, research + planning" />
                <Item name="Custom" desc=".claude/agents/ — your specialists" />
                <div style={{ marginTop: 6 }}>
                  <Pill>{"Don't see skills unless listed"}</Pill>
                </div>
              </Block>

              <Block id="commands" active={active === "commands"} onToggle={toggle}>
                <Item name="/review" desc="Predefined review prompt" />
                <Item name="/commit" desc="Commit message generation" />
                <Item name="Custom" desc="Your own slash commands" />
                <div style={{ marginTop: 6 }}>
                  <Pill>{"Manual ≠ Skills (automatic)"}</Pill>
                </div>
              </Block>
            </div>

            {/* Plugins + Controls */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Block id="plugins" active={active === "plugins"} onToggle={toggle}>
                <Item name="Bundled Skills" desc="Task-specific knowledge" />
                <Item name="Bundled Commands" desc="Custom slash commands" />
                <Item name="Bundled Subagents" desc="Specialized workers" />
                <div style={{ marginTop: 6 }}>
                  <Pill>Distributable via marketplaces</Pill>
                  <Pill>Lowest skill priority</Pill>
                </div>
              </Block>

              <Block id="controls" active={active === "controls"} onToggle={toggle}>
                <Item name="Plan Mode" desc="Read-only — Shift+Tab" />
                <Item name="Extended Thinking" desc="Deeper — Option+T" />
                <Item name="Escape / Double Escape" desc="Interrupt / Rewind" />
                <Item name="/compact · /clear" desc="Summarize / Full reset" />
              </Block>
            </div>
          </div>

          <VConn label="↑ sends requests — returns data ↓" />

          {/* 3. MCP */}
          <Block id="mcp" num="3" active={active === "mcp"} onToggle={toggle}>
            <Item name="Figma" desc="Design context, screenshots, metadata" />
            <Item name="Notion" desc="Pages, databases, search" />
            <Item name="Playwright" desc="Browser automation, testing" />
            <Item name="GitHub" desc="Repos, PRs, issues" />
            <div style={{ marginTop: 6 }}>
              <Pill>claude mcp add --scope user</Pill>
              <Pill>Scopes: local / project / user</Pill>
            </div>
          </Block>

          {/* Legend */}
          <div
            style={{
              marginTop: 16,
              padding: "14px 18px",
              background: tk.bg,
              border: `0.5px solid ${tk.border}`,
              borderRadius: 10,
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
            }}
          >
            {[
              "Skills → request-driven (automatic)",
              "Hooks → event-driven (always fire)",
              "CLAUDE.md → always loaded",
              "MCP → tools, not knowledge",
              "Priority: Enterprise > Personal > Project > Plugin",
            ].map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{ width: 5, height: 5, borderRadius: "50%", background: tk.accent }}
                />
                <span style={{ fontSize: 12, color: tk.textBody }}>{label}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: tk.textMuted }}>
            Based on Anthropic Academy + Claude Code docs — by{" "}
            <a
              href="https://kikelopez.es"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: tk.accent,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Kike López
            </a>
          </div>
        </div>
      </main>
  );
}
