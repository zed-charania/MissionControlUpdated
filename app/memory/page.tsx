'use client';

import { useCallback, useEffect, useState } from 'react';

interface MemoryFile {
  name: string;
  date: string | null;
}

interface SearchResult {
  source: string;
  snippets: string[];
}

function groupFilesByPeriod(files: MemoryFile[]) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10);

  const groups: { label: string; files: MemoryFile[] }[] = [];
  const special = files.filter(f => !f.date);
  const dated = files.filter(f => f.date).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  if (special.length > 0) groups.push({ label: 'Core', files: special });

  const thisWeek = dated.filter(f => f.date! >= weekAgo && f.date! <= today);
  const lastWeek = dated.filter(f => f.date! >= twoWeeksAgo && f.date! < weekAgo);
  const older = dated.filter(f => f.date! < twoWeeksAgo);

  if (thisWeek.length > 0) groups.push({ label: 'This Week', files: thisWeek });
  if (lastWeek.length > 0) groups.push({ label: 'Last Week', files: lastWeek });
  if (older.length > 0) groups.push({ label: 'Older', files: older });

  return groups;
}

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadFiles = useCallback(async () => {
    const res = await fetch('/api/memory').then(r => r.json());
    if (res.ok) setFiles(res.data.files);
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

  const doSearch = async () => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    setSelectedFile(null);
    setFileContent(null);
    const res = await fetch(`/api/memory?q=${encodeURIComponent(query)}`).then(r => r.json());
    if (res.ok) setResults(res.data.results);
    setLoading(false);
  };

  const viewFile = async (name: string) => {
    setSelectedFile(name);
    setResults([]);
    setLoading(true);
    const res = await fetch(`/api/memory?file=${encodeURIComponent(name)}`).then(r => r.json());
    if (res.ok) setFileContent(res.data.content);
    else setFileContent('Could not load file.');
    setLoading(false);
  };

  const groups = groupFilesByPeriod(files);

  return (
    <div>
      <h1 className="page-title">Memory</h1>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Search memory files..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
          />
          <button onClick={doSearch} className="btn-primary">Search</button>
        </div>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-6">
        <div className="flex flex-col gap-4">
          {groups.map(group => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                {group.label}
              </h3>
              <div className="flex flex-col gap-0.5">
                {group.files.map(f => (
                  <button
                    key={f.name}
                    onClick={() => viewFile(f.name)}
                    className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                      selectedFile === f.name
                        ? 'bg-white/[0.08] text-white'
                        : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div className="text-xs text-gray-500 px-2">No memory files found.</div>
          )}
        </div>

        <div className="min-h-[400px]">
          {loading && (
            <div className="card text-center text-sm text-gray-500 py-8">Loading...</div>
          )}

          {!loading && selectedFile && fileContent && (
            <div className="card">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.06]">
                <h2 className="text-base font-semibold text-white">{selectedFile}</h2>
                <button
                  onClick={() => { setSelectedFile(null); setFileContent(null); }}
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  Close
                </button>
              </div>
              <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans overflow-auto max-h-[600px]">
                {fileContent}
              </pre>
            </div>
          )}

          {!loading && results.length > 0 && !selectedFile && (
            <div className="flex flex-col gap-4">
              <div className="text-sm text-gray-400">
                Found matches in {results.length} file{results.length !== 1 ? 's' : ''}
              </div>
              {results.map(r => (
                <div key={r.source} className="card">
                  <button
                    className="text-sm font-semibold text-accent hover:underline mb-3"
                    onClick={() => viewFile(r.source)}
                  >
                    {r.source}
                  </button>
                  {r.snippets.map((snippet, i) => (
                    <pre
                      key={i}
                      className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap font-sans border-l-2 border-accent/30 pl-3 mb-2"
                    >
                      {snippet}
                    </pre>
                  ))}
                </div>
              ))}
            </div>
          )}

          {!loading && !selectedFile && results.length === 0 && query && (
            <div className="card text-center text-sm text-gray-500 py-8">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && !selectedFile && results.length === 0 && !query && (
            <div className="card text-center text-sm text-gray-500 py-8">
              Select a file from the sidebar or search to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
