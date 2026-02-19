import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

const WORKSPACE_ROOT = path.resolve(process.cwd(), '..');

function safeReadFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function listMemoryFiles(): { name: string; path: string; date: string | null }[] {
  const memoryDir = path.join(WORKSPACE_ROOT, 'memory');
  const results: { name: string; path: string; date: string | null }[] = [];

  try {
    const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md')).sort().reverse();
    for (const file of files) {
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
      results.push({
        name: file,
        path: path.join(memoryDir, file),
        date: dateMatch?.[1] ?? null,
      });
    }
  } catch {
    // memory dir may not exist
  }

  return results;
}

function searchInContent(content: string, query: string): string[] {
  const lines = content.split('\n');
  const lower = query.toLowerCase();
  const snippets: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(lower)) {
      const start = Math.max(0, i - 1);
      const end = Math.min(lines.length, i + 2);
      snippets.push(lines.slice(start, end).join('\n'));
    }
  }

  return snippets;
}

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
    const file = req.nextUrl.searchParams.get('file')?.trim() ?? '';

    if (file) {
      const memoryFiles = listMemoryFiles();
      const memoryFile = memoryFiles.find(f => f.name === file);

      if (file === 'MEMORY.md') {
        const content = safeReadFile(path.join(WORKSPACE_ROOT, 'MEMORY.md'));
        return NextResponse.json({
          ok: true,
          data: { file: 'MEMORY.md', content: content ?? 'File not found.' },
        });
      }

      if (memoryFile) {
        const content = safeReadFile(memoryFile.path);
        return NextResponse.json({
          ok: true,
          data: { file: memoryFile.name, content: content ?? 'File not found.' },
        });
      }

      return NextResponse.json({ ok: false, error: 'file not found' }, { status: 404 });
    }

    const files = listMemoryFiles();
    const memoryMdContent = safeReadFile(path.join(WORKSPACE_ROOT, 'MEMORY.md'));

    if (!q) {
      return NextResponse.json({
        ok: true,
        data: {
          files: [
            { name: 'MEMORY.md', date: null },
            ...files.map(f => ({ name: f.name, date: f.date })),
          ],
          results: [],
        },
      });
    }

    const results: { source: string; snippets: string[] }[] = [];

    if (memoryMdContent) {
      const snippets = searchInContent(memoryMdContent, q);
      if (snippets.length > 0) {
        results.push({ source: 'MEMORY.md', snippets });
      }
    }

    for (const f of files) {
      const content = safeReadFile(f.path);
      if (!content) continue;
      const snippets = searchInContent(content, q);
      if (snippets.length > 0) {
        results.push({ source: f.name, snippets });
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        files: [
          { name: 'MEMORY.md', date: null },
          ...files.map(f => ({ name: f.name, date: f.date })),
        ],
        results,
        query: q,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
