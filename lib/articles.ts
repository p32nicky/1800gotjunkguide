import fs from "fs";
import path from "path";
import { marked } from "marked";

const AFFILIATE = "https://click.linksynergy.com/fs-bin/click?id=EWtL65s2/tg&offerid=1950775.2&type=3&subid=0";
const CTA_HTML = `<a href="${AFFILIATE}" class="cta-link">Get a Free Quote from 1-800-GOT-JUNK? →</a>`;

export interface Article {
  slug: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  body: string;
  generatedAt: string;
  error?: string;
}

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

function processBody(raw: string): string {
  // Strip META/KEYWORDS in all formats Cerebras/Groq might output
  let body = raw
    .replace(/^\*?\*?Meta Description:?\*?\*?.*$/gim, "")
    .replace(/^\*?\*?Keywords?:?\*?\*?.*$/gim, "")
    .replace(/^META:.*$/gim, "")
    .replace(/^KEYWORDS?:.*$/gim, "")
    .replace(/^\*?\*?SEO Meta Description:?\*?\*?.*$/gim, "")
    .replace(/^\*?\*?Focus Keywords?:?\*?\*?.*$/gim, "")
    .trim();

  // Strip closing CTA tags
  body = body.replace(/\[\/CTA\]/gi, "").replace(/\[CTA\/\]/gi, "");

  // Always parse as markdown (handles both HTML and markdown output from AI)
  body = marked.parse(body) as string;

  // Replace all CTA variants: [CTA], [CTA: text], **CTA text**, etc.
  body = body.replace(/\[CTA[^\]]*\]/gi, CTA_HTML);

  // Replace bold CTA patterns like **Get a Free Quote from 1-800-GOT-JUNK?**
  body = body.replace(/<strong>Get a Free Quote from 1-800-GOT-JUNK\?<\/strong>/gi, CTA_HTML);
  body = body.replace(/<strong>Book 1-800-GOT-JUNK\? Now<\/strong>/gi, CTA_HTML);
  body = body.replace(/<p><strong>Get a Free Quote[^<]*<\/strong><\/p>/gi, `<p>${CTA_HTML}</p>`);
  body = body.replace(/<p><strong>Book 1-800-GOT-JUNK[^<]*<\/strong><\/p>/gi, `<p>${CTA_HTML}</p>`);

  return body;
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const a = JSON.parse(fs.readFileSync(path.join(ARTICLES_DIR, f), "utf-8")) as Article;
      return { ...a, body: processBody(a.body) };
    })
    .filter((a) => !a.error)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getArticleBySlug(slug: string): Article | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const a = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Article;
  return { ...a, body: processBody(a.body) };
}

export function getAllSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
}
