import Link from "next/link";
import type { ReactNode } from "react";

// Markdown rút gọn cho bài blog (nội dung do mình viết, không nhận từ người dùng):
// ## / ### tiêu đề, đoạn văn, danh sách "- " và "1. ", bảng "| a | b |", hộp mẹo "> ",
// trong dòng: **đậm**, [chữ](link), `mã`.

export type Heading = { id: string; text: string };

/** "Mã QR là gì?" -> "ma-qr-la-gi" (dùng cho id tiêu đề / mục lục) */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

const stripInline = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\((.+?)\)/g, "$1").replace(/`(.+?)`/g, "$1");

function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)|`(.+?)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${m.index}`;
    if (m[1]) out.push(<strong key={k}>{inline(m[1], m.index)}</strong>);
    else if (m[2]) {
      const href = m[3];
      out.push(
        href.startsWith("/") ? (
          <Link key={k} href={href}>
            {inline(m[2], m.index)}
          </Link>
        ) : (
          <a key={k} href={href} target="_blank" rel="noopener">
            {inline(m[2], m.index)}
          </a>
        ),
      );
    } else if (m[4]) out.push(<code key={k}>{m[4]}</code>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (row: string) =>
  row
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

/** Các tiêu đề cấp 2 (mục lục) */
export function headings(md: string): Heading[] {
  return md
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const text = stripInline(l.slice(3).trim());
      return { id: slugify(text), text };
    });
}

export function Markdown({ source }: { source: string }) {
  const lines = source.trim().split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }
    const k = blocks.length;
    if (line.startsWith("### ") || line.startsWith("## ")) {
      const level = line.startsWith("### ") ? 3 : 2;
      const text = line.slice(level + 1).trim();
      const Tag = level === 2 ? "h2" : "h3";
      blocks.push(
        <Tag key={k} id={slugify(stripInline(text))}>
          {inline(text)}
        </Tag>,
      );
      i++;
    } else if (/^(-|\d+\.) /.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\d+\. /.test(lines[i].trim()) : lines[i].trim().startsWith("- "))) {
        items.push(lines[i].trim().replace(/^(-|\d+\.) /, ""));
        i++;
      }
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List key={k}>
          {items.map((it, j) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </List>,
      );
    } else if (line.startsWith("|")) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++].trim());
      const [head, , ...body] = rows;
      blocks.push(
        <div key={k} className="table-wrap">
          <table>
            <thead>
              <tr>
                {cells(head).map((c, j) => (
                  <th key={j}>{inline(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, j) => (
                <tr key={j}>
                  {cells(r).map((c, n) => (
                    <td key={n}>{inline(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else if (line.startsWith("> ")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) parts.push(lines[i++].trim().slice(2));
      blocks.push(<aside key={k}>{inline(parts.join(" "))}</aside>);
    } else {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim() && !/^(#{2,3} |- |\d+\. |\||> )/.test(lines[i].trim())) parts.push(lines[i++].trim());
      blocks.push(<p key={k}>{inline(parts.join(" "))}</p>);
    }
  }
  return <>{blocks}</>;
}
