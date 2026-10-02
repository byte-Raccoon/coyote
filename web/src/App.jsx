import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  GraduationCap,
  Code2,
  Lightbulb,
  FileText,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, subtabs: ['Daily', 'Weekly', 'Yearly'] },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'dsa', label: 'DSA', icon: Code2 },
  { id: 'ideas', label: 'Project Ideas', icon: Lightbulb },
  { id: 'notes', label: 'General Notes', icon: FileText },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [taskSubtab, setTaskSubtab] = useState('Daily')
  const [backendStatus, setBackendStatus] = useState({ connected: false, checking: true, message: 'Checking...' })
  const [lastSync, setLastSync] = useState(null)

  // Poll backend health check on port 3335 via proxy
  useEffect(() => {
    checkBackend()
    const interval = setInterval(checkBackend, 10000)
    return () => clearInterval(interval)
  }, [])

  const checkBackend = async () => {
    try {
      const res = await fetch('/api/health')
      if (res.ok) {
        const data = await res.json()
        setBackendStatus({ connected: true, checking: false, message: `Connected (${data.status})` })
        setLastSync(new Date().toLocaleTimeString())
      } else {
        setBackendStatus({ connected: false, checking: false, message: `HTTP ${res.status}` })
      }
    } catch (err) {
      setBackendStatus({ connected: false, checking: false, message: 'Backend offline (port 3335)' })
    }
  }

  return (
    <div className="min-h-screen flex bg-sand-bg text-desert-dark font-body antialiased">
      {/* SIDEBAR */}
      <aside className="w-64 bg-sidebar-bg text-[#FBF5EC] flex flex-col justify-between shadow-2xl border-r border-[#382b22] shrink-0">
        <div>
          {/* Header */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-[#31251e]">
            <div className="w-9 h-9 rounded-full bg-primary/20 ring-2 ring-primary/40 flex items-center justify-center font-headline font-bold text-primary text-xl">
              C
            </div>
            <div>
              <span className="font-headline text-lg tracking-wider uppercase text-[#FBF5EC] font-bold">COYOTE</span>
              <p className="text-[10px] text-desert-muted font-mono tracking-wider">MAC AIR WORKSPACE</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <div key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white font-semibold shadow-md'
                        : 'text-[#D0C0B0] hover:bg-sidebar-surface hover:text-[#FBF5EC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.subtabs && (
                      <span className="text-[10px] opacity-75 font-mono">{taskSubtab}</span>
                    )}
                  </button>

                  {/* Subtabs for Tasks */}
                  {item.id === 'tasks' && isActive && (
                    <div className="ml-7 mt-1 space-y-1 border-l border-[#382b22] pl-2">
                      {item.subtabs.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setTaskSubtab(sub)}
                          className={`w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                            taskSubtab === sub
                              ? 'text-primary font-bold'
                              : 'text-desert-muted hover:text-[#FBF5EC]'
                          }`}
                        >
                          • {sub} Tasks
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Sync & System Status Card */}
        <div className="p-3 border-t border-[#31251e]">
          <div className="bg-sidebar-surface rounded-lg p-3 text-xs space-y-2 border border-[#3e3025]">
            <div className="flex items-center justify-between">
              <span className="text-desert-muted font-mono text-[11px]">SYNC ENGINE</span>
              <button
                onClick={checkBackend}
                title="Check connection"
                className="hover:rotate-180 transition-transform duration-300"
              >
                <RefreshCw className="w-3 h-3 text-desert-muted hover:text-primary" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {backendStatus.connected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-emerald-400 font-medium text-[11px]">Backend online (3335)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-amber-400 text-[11px] truncate">{backendStatus.message}</span>
                </>
              )}
            </div>

            <div className="text-[10px] text-desert-muted font-mono pt-1 border-t border-[#382b22]/60 flex justify-between">
              <span>Client: 3333</span>
              <span>Sync: Local REST</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top bar */}
        <header className="h-16 border-b border-desert-border/60 bg-card-surface/40 backdrop-blur px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-headline font-bold text-2xl text-desert-dark capitalize">
              {activeTab === 'tasks' ? `${taskSubtab} Tasks` : activeTab}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-medium">
              macOS
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-desert-muted">
            {lastSync && <span>Last sync: {lastSync}</span>}
            <div className="h-4 w-[1px] bg-desert-border"></div>
            <span>OnePlus Sync: Standby</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="bg-card-surface rounded-xl p-6 border border-desert-border shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-xl font-bold text-desert-dark">
                    Welcome to Coyote
                  </h2>
                  <p className="text-sm text-desert-muted mt-1">
                    Your central command for tasks, academic goals, DSA practice, and reflections.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-sand-bg border border-desert-border text-xs font-mono">
                    Port 3333
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-mono font-medium">
                    FastAPI :3335
                  </span>
                </div>
              </div>

              {/* Stat Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card-surface p-4 rounded-xl border border-desert-border shadow-sm">
                  <span className="text-xs font-mono text-desert-muted uppercase">Today's Tasks</span>
                  <div className="text-2xl font-headline font-bold text-primary mt-1">0</div>
                  <span className="text-[11px] text-desert-muted">Ready for planning</span>
                </div>
                <div className="bg-card-surface p-4 rounded-xl border border-desert-border shadow-sm">
                  <span className="text-xs font-mono text-desert-muted uppercase">DSA Targets</span>
                  <div className="text-2xl font-headline font-bold text-sage mt-1">0 / 0</div>
                  <span className="text-[11px] text-desert-muted">Problems tracked</span>
                </div>
                <div className="bg-card-surface p-4 rounded-xl border border-desert-border shadow-sm">
                  <span className="text-xs font-mono text-desert-muted uppercase">Academic Items</span>
                  <div className="text-2xl font-headline font-bold text-desert-dark mt-1">0</div>
                  <span className="text-[11px] text-desert-muted">Semesters & milestones</span>
                </div>
                <div className="bg-card-surface p-4 rounded-xl border border-desert-border shadow-sm">
                  <span className="text-xs font-mono text-desert-muted uppercase">Vault Entries</span>
                  <div className="text-2xl font-headline font-bold text-secondary mt-1">0</div>
                  <span className="text-[11px] text-desert-muted">Notes & ideas</span>
                </div>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card-surface p-6 rounded-xl border border-desert-border shadow-sm">
                  <h3 className="font-headline font-bold text-lg mb-3 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Platform Status
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-desert-border/50">
                      <span className="text-desert-muted">macOS Web UI</span>
                      <span className="font-mono text-emerald-600 font-semibold">Active (3333)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-desert-border/50">
                      <span className="text-desert-muted">FastAPI Service</span>
                      <span className={`font-mono font-semibold ${backendStatus.connected ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {backendStatus.connected ? 'Active (3335)' : 'Starting...'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-desert-border/50">
                      <span className="text-desert-muted">Local Database</span>
                      <span className="font-mono text-desert-dark">SQLite (WAL enabled)</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-desert-muted">OnePlus Android App</span>
                      <span className="font-mono text-desert-muted">React Native (Ready to build)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card-surface p-6 rounded-xl border border-desert-border shadow-sm">
                  <h3 className="font-headline font-bold text-lg mb-3 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-terracotta" />
                    Hotspot & Wi-Fi Sync Guide
                  </h3>
                  <p className="text-sm text-desert-muted mb-4">
                    To sync with your OnePlus phone over local Wi-Fi or mobile hotspot:
                  </p>
                  <ol className="text-xs space-y-2 list-decimal list-inside text-desert-dark bg-sand-bg/60 p-3 rounded-lg border border-desert-border">
                    <li>Connect Mac and OnePlus to the same Wi-Fi or turn on phone Hotspot.</li>
                    <li>Ensure FastAPI is running bound to <code className="font-mono text-primary">0.0.0.0:3335</code>.</li>
                    <li>The mobile app connects to the Mac's LAN IP address on port 3335.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="bg-card-surface rounded-xl p-8 border border-desert-border text-center shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold capitalize text-desert-dark">
                  {activeTab} Management
                </h3>
                <p className="text-sm text-desert-muted mt-1 max-w-md mx-auto">
                  Domain workspace for {activeTab}. Connected to the local SQLite storage engine.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
