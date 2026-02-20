'use client';

import { useState, useEffect } from 'react';

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  searchTerm: string;
  lastChecked: string;
  jobsFound: number;
  isActive: boolean;
}

interface RSSJob {
  id: string;
  title: string;
  budget?: string;
  description: string;
  link: string;
  publishedAt: string;
  score: number;
  reasons: string[];
  status: 'new' | 'viewed' | 'pursuing' | 'skipped';
}

const DEFAULT_FEEDS: RSSFeed[] = [
  {
    id: '1',
    name: 'AI Automation',
    url: '',
    searchTerm: 'automation AI workflow',
    lastChecked: 'Never',
    jobsFound: 0,
    isActive: false,
  },
  {
    id: '2',
    name: 'Virtual Assistant Replacement',
    url: '',
    searchTerm: 'virtual assistant VA replacement',
    lastChecked: 'Never',
    jobsFound: 0,
    isActive: false,
  },
  {
    id: '3',
    name: 'Zapier/Make Workflows',
    url: '',
    searchTerm: 'zapier make.com automation',
    lastChecked: 'Never',
    jobsFound: 0,
    isActive: false,
  },
  {
    id: '4',
    name: 'CRM & Lead Management',
    url: '',
    searchTerm: 'CRM automation lead nurture',
    lastChecked: 'Never',
    jobsFound: 0,
    isActive: false,
  },
  {
    id: '5',
    name: 'Airtable Databases',
    url: '',
    searchTerm: 'airtable automation database',
    lastChecked: 'Never',
    jobsFound: 0,
    isActive: false,
  },
];

export default function RSSFeedManagerPage() {
  const [feeds, setFeeds] = useState<RSSFeed[]>(DEFAULT_FEEDS);
  const [jobs, setJobs] = useState<RSSJob[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');

  // Calculate stats
  const activeFeeds = feeds.filter(f => f.isActive && f.url).length;
  const totalJobs = jobs.length;
  const highScoreJobs = jobs.filter(j => j.score >= 70).length;
  const pursuingJobs = jobs.filter(j => j.status === 'pursuing').length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">RSS Feed Manager</h1>
          <p className="text-sm text-gray-400">
            Legal Upwork job sourcing via RSS feeds
          </p>
        </div>
        <button 
          onClick={() => setShowSetup(true)}
          className="btn-primary"
        >
          + Add RSS Feed
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="text-xs text-gray-500 mb-1">Active Feeds</div>
          <div className="text-2xl font-semibold text-emerald-400">{activeFeeds}</div>
        </div>
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
          <div className="text-xs text-gray-500 mb-1">Total Jobs</div>
          <div className="text-2xl font-semibold text-blue-400">{totalJobs}</div>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
          <div className="text-xs text-gray-500 mb-1">High Score (70+)</div>
          <div className="text-2xl font-semibold text-purple-400">{highScoreJobs}</div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <div className="text-xs text-gray-500 mb-1">Pursuing</div>
          <div className="text-2xl font-semibold text-amber-400">{pursuingJobs}</div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">?</span>
          How to Get Your RSS Feed URL (60 seconds)
        </h3>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="text-blue-400 font-bold">1</span>
              <span>Go to Upwork.com and search for "automation"</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400 font-bold">2</span>
              <span>Click "Save search" button</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400 font-bold">3</span>
              <span>Name it "AI Automation Jobs"</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="text-blue-400 font-bold">4</span>
              <span>Toggle ON "RSS feed" option</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400 font-bold">5</span>
              <span>Copy the RSS URL (starts with https://www.upwork.com/ab/feed/)</span>
            </div>
            <div className="flex gap-2">
              <span className="text-blue-400 font-bold">6</span>
              <span>Paste it below and click "Activate"</span>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-white/5 text-xs text-gray-500">
          <strong className="text-gray-300">Why RSS?</strong> Official Upwork feature, no bot detection, updates every 15 minutes, completely legal. Your account stays safe.
        </div>
      </div>

      {/* Feeds List */}
      <h2 className="text-lg font-medium text-white mb-4">Your RSS Feeds</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {feeds.map(feed => (
          <div 
            key={feed.id}
            className={`p-4 rounded-2xl border transition-all ${
              feed.isActive && feed.url
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-white/[0.02] border-white/[0.06]'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-medium">{feed.name}</h3>
                <p className="text-xs text-gray-500">Search: {feed.searchTerm}</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                feed.isActive && feed.url ? 'bg-emerald-500' : 'bg-gray-600'
              }`} />
            </div>

            {feed.url ? (
              <div className="space-y-2">
                <div className="text-xs text-gray-500 truncate">
                  {feed.url.substring(0, 50)}...
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Last checked: {feed.lastChecked}</span>
                  <span className="text-emerald-400">{feed.jobsFound} jobs</span>
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost text-xs py-1">
                    Check Now
                  </button>
                  <button className="btn-danger text-xs py-1">
                    Deactivate
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-amber-400/70">Not configured</div>
                <button 
                  onClick={() => setShowSetup(true)}
                  className="btn-primary text-xs py-1 w-full"
                >
                  Add RSS URL
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      {jobs.length > 0 && (
        <>
          <h2 className="text-lg font-medium text-white mb-4">Recent Jobs</h2>
          <div className="space-y-3">
            {jobs.slice(0, 5).map(job => (
              <div key={job.id} className="card-hover p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{job.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        job.score >= 70 ? 'bg-emerald-500/20 text-emerald-300' :
                        job.score >= 50 ? 'bg-amber-500/20 text-amber-300' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        Score: {job.score}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{job.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      {job.budget && (
                        <span className="text-emerald-400">{job.budget}</span>
                      )}
                      <span className="text-gray-500">{job.publishedAt}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-ghost text-xs py-1 px-2">
                      View
                    </button>
                    <button className="btn-primary text-xs py-1 px-2">
                      Pursue
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Feed Modal */}
      {showSetup && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowSetup(false)}
        >
          <div 
            className="w-full max-w-md p-6 rounded-2xl bg-[#0f1117] border border-white/[0.08]"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Add RSS Feed</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Feed Name</label>
                <input 
                  type="text"
                  value={newFeedName}
                  onChange={e => setNewFeedName(e.target.value)}
                  placeholder="e.g., AI Automation Jobs"
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">RSS Feed URL</label>
                <textarea
                  value={newFeedUrl}
                  onChange={e => setNewFeedUrl(e.target.value)}
                  placeholder="https://www.upwork.com/ab/feed/topics/rss?securityToken=..."
                  className="input min-h-[100px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full RSS URL from your Upwork saved search
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-300">
                  <strong>Need help finding the URL?</strong> Follow the 6-step guide at the top of this page.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowSetup(false)}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newFeedUrl && newFeedName) {
                    setFeeds(prev => [...prev, {
                      id: Date.now().toString(),
                      name: newFeedName,
                      url: newFeedUrl,
                      searchTerm: newFeedName,
                      lastChecked: 'Never',
                      jobsFound: 0,
                      isActive: true,
                    }]);
                    setNewFeedUrl('');
                    setNewFeedName('');
                    setShowSetup(false);
                  }
                }}
                className="btn-primary flex-1"
              >
                Activate Feed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
