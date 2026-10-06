import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  GraduationCap,
  Code2,
  Lightbulb,
  FileText,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Layers,
  Sparkles,
  Tag,
  Clock,
  HardDrive
} from 'lucide-react'
import { api } from './api'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, subtabs: ['daily', 'weekly', 'yearly'] },
  { id: 'journal', label: 'Journal', icon: BookOpen, folder: 'journal' },
  { id: 'academic', label: 'Academic', icon: GraduationCap, folder: 'academic' },
  { id: 'dsa', label: 'DSA', icon: Code2, folder: 'dsa' },
  { id: 'ideas', label: 'Project Ideas', icon: Lightbulb, folder: 'ideas' },
  { id: 'notes', label: 'General Notes', icon: FileText, folder: 'general' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [taskSubtab, setTaskSubtab] = useState('daily')
  const [backendStatus, setBackendStatus] = useState({ connected: false, checking: true, message: 'Checking...' })
  const [lastSync, setLastSync] = useState(null)

  // Data states
  const [tasks, setTasks] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')

  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteTags, setNewNoteTags] = useState('')

  // Load backend status and data
  useEffect(() => {
    checkHealth()
    fetchData()
    const interval = setInterval(checkHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    try {
      const data = await api.getHealth()
      setBackendStatus({ connected: true, checking: false, message: `Connected (port ${data.port})` })
      setLastSync(new Date().toLocaleTimeString())
    } catch (err) {
      setBackendStatus({ connected: false, checking: false, message: 'Backend offline (port 3335)' })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tData, nData] = await Promise.all([
        api.getTasks(),
        api.getNotes()
      ])
      setTasks(tData)
      setNotes(nData)
    } catch (err) {
      console.warn('Could not load data from backend:', err)
    } finally {
      setLoading(false)
    }
  }

  // Task actions
  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    try {
      const created = await api.createTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || null,
        category: taskSubtab,
        due_date: newTaskDueDate || null
      })
      setTasks([created, ...tasks])
      setNewTaskTitle('')
      setNewTaskDesc('')
      setNewTaskDueDate('')
    } catch (err) {
      alert('Error creating task: ' + err.message)
    }
  }

  const handleToggleTask = async (task) => {
    try {
      const updated = await api.updateTask(task.id, {
        is_completed: !task.is_completed
      })
      setTasks(tasks.map(t => t.id === task.id ? updated : t))
    } catch (err) {
      alert('Error updating task: ' + err.message)
    }
  }

  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id)
      setTasks(tasks.filter(t => t.id !== id))
    } catch (err) {
      alert('Error deleting task: ' + err.message)
    }
  }

  // Note actions
  const getCurrentFolder = () => {
    const item = NAV_ITEMS.find(n => n.id === activeTab)
    return item?.folder || 'general'
  }

  const handleCreateNote = async (e) => {
    e.preventDefault()
    if (!newNoteTitle.trim()) return
    try {
      const folder = getCurrentFolder()
      const created = await api.createNote({
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        folder: folder,
        tags: newNoteTags.trim() || null
      })
      setNotes([created, ...notes])
      setNewNoteTitle('')
      setNewNoteContent('')
      setNewNoteTags('')
    } catch (err) {
      alert('Error creating note: ' + err.message)
    }
  }

  const handleDeleteNote = async (id) => {
    try {
      await api.deleteNote(id)
      setNotes(notes.filter(n => n.id !== id))
    } catch (err) {
      alert('Error deleting note: ' + err.message)
    }
  }

  // Filtered lists
  const currentTasks = tasks.filter(t => t.category === taskSubtab)
  const currentNotes = notes.filter(n => n.folder === getCurrentFolder())

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.is_completed).length
  const dailyPending = tasks.filter(t => t.category === 'daily' && !t.is_completed).length

  return (
    <div className="min-h-screen flex bg-sand-bg text-desert-dark font-body antialiased">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-sidebar-bg text-[#FBF5EC] flex flex-col justify-between shadow-2xl border-r border-[#382b22] shrink-0">
        <div>
          {/* Brand */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-[#31251e]">
            <div className="w-9 h-9 rounded-full bg-primary/20 ring-2 ring-primary/40 flex items-center justify-center font-headline font-bold text-primary text-xl">
              C
            </div>
            <div>
              <span className="font-headline text-lg tracking-wider uppercase text-[#FBF5EC] font-bold">COYOTE</span>
              <p className="text-[10px] text-desert-muted font-mono tracking-wider">MAC AIR WORKSPACE</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              const count = item.folder 
                ? notes.filter(n => n.folder === item.folder).length
                : item.id === 'tasks' 
                  ? tasks.length 
                  : null

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
                    {count !== null && count > 0 && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-black/30 text-white' : 'bg-sidebar-surface text-desert-muted'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>

                  {/* Subtabs for Tasks */}
                  {item.id === 'tasks' && isActive && (
                    <div className="ml-7 mt-1 space-y-1 border-l border-[#382b22] pl-2">
                      {item.subtabs.map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setTaskSubtab(sub)}
                          className={`w-full text-left px-2 py-1 text-xs rounded transition-colors capitalize ${
                            taskSubtab === sub
                              ? 'text-primary font-bold'
                              : 'text-desert-muted hover:text-[#FBF5EC]'
                          }`}
                        >
                          • {sub} ({tasks.filter(t => t.category === sub).length})
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
                onClick={() => { checkHealth(); fetchData(); }}
                title="Sync now"
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
        {/* Topbar */}
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

          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-card-surface rounded-xl p-6 border border-desert-border shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-xl font-bold text-desert-dark">
                    Welcome to Coyote Workspace
                  </h2>
                  <p className="text-sm text-desert-muted mt-1">
                    Your command centre for tasks, academic goals, DSA practice, and reflections.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-sand-bg border border-desert-border text-xs font-mono">
                    Frontend :3333
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-mono font-medium">
                    FastAPI :3335
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card-surface p-4 rounded-xl border border-desert-border shadow-sm">
                  <span className="text-xs font-mono text-desert-muted uppercase">Daily Pending</span>
                  <div className="text-2xl font-headline font-bold text-primary mt-1">{dailyPending}</div>
                  <span className="text-[11px] text-desert-muted">Out of {tasks.filter(t => t.category === 'daily').length} daily</span>
                </div>
                <div className="bg-card-surface p-4 rounded-xl border border-desert-border shadow-sm">
                  <span className="text-xs font-mono text-desert-muted uppercase">Total Completed</span>
                  <div className="text-2xl font-headline font-bold text-sage mt-1">
                    {completedTasks} / {totalTasks}
                  </div>
                  <span className="text-[11px] text-desert-muted">
                    {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% completion` : 'No tasks yet'}
                  </span>
                </div>
                <div className="bg-card-surface p-4 rounded-xl border border-desert-border shadow-sm">
                  <span className="text-xs font-mono text-desert-muted uppercase">DSA & Academics</span>
                  <div className="text-2xl font-headline font-bold text-desert-dark mt-1">
                    {notes.filter(n => n.folder === 'dsa' || n.folder === 'academic').length}
                  </div>
                  <span className="text-[11px] text-desert-muted">Problems & notes tracked</span>
                </div>
                <div className="bg-card-surface p-4 rounded-xl border border-desert-border shadow-sm">
                  <span className="text-xs font-mono text-desert-muted uppercase">Vault Entries</span>
                  <div className="text-2xl font-headline font-bold text-terracotta mt-1">{notes.length}</div>
                  <span className="text-[11px] text-desert-muted">Journal, ideas & notes</span>
                </div>
              </div>

              {/* Quick Actions & Recent Tasks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Daily Tasks */}
                <div className="bg-card-surface p-6 rounded-xl border border-desert-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-headline font-bold text-lg flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-primary" />
                      Today's Priorities
                    </h3>
                    <button
                      onClick={() => { setActiveTab('tasks'); setTaskSubtab('daily'); }}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  {tasks.filter(t => t.category === 'daily' && !t.is_completed).length === 0 ? (
                    <div className="text-center py-8 text-desert-muted text-sm bg-sand-bg/30 rounded-lg border border-dashed border-desert-border">
                      No pending daily tasks! Click below or switch to Tasks to add one.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks
                        .filter(t => t.category === 'daily' && !t.is_completed)
                        .slice(0, 5)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between p-2.5 bg-sand-bg/40 rounded-lg border border-desert-border hover:bg-sand-bg/70 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleTask(task)}
                                className="text-desert-muted hover:text-emerald-600 transition-colors"
                              >
                                <Circle className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-medium">{task.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-desert-muted">v{task.version}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Hotspot & Wi-Fi Sync Guide */}
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

          {/* TASKS VIEW */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {/* Dummy Disclaimer Banner */}
              <div className="bg-amber-500/10 border border-amber-600/30 rounded-xl p-3.5 flex items-center gap-3 text-xs text-amber-900 font-medium">
                <span className="px-2 py-0.5 rounded bg-amber-600/20 text-amber-800 font-mono font-bold text-[10px]">NOTICE</span>
                <span>Mobile version and web version are just dummies, not a real working app and site, we still have to implement all the feature.</span>
              </div>

              {/* Category selector */}
              <div className="flex gap-2 border-b border-desert-border pb-3">
                {['daily', 'weekly', 'yearly'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTaskSubtab(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      taskSubtab === cat
                        ? 'bg-primary text-white shadow-sm font-semibold'
                        : 'bg-card-surface text-desert-muted hover:bg-card-surface-alt'
                    }`}
                  >
                    {cat} Tasks ({tasks.filter(t => t.category === cat).length})
                  </button>
                ))}
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleCreateTask} className="bg-card-surface p-4 rounded-xl border border-desert-border shadow-sm space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder={`Add new ${taskSubtab} task...`}
                    className="flex-1 px-3 py-2 bg-sand-bg/50 border border-desert-border rounded-lg text-sm text-desert-dark placeholder-desert-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="px-3 py-2 bg-sand-bg/50 border border-desert-border rounded-lg text-xs text-desert-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Optional details or subtasks description..."
                  className="w-full px-3 py-1.5 bg-sand-bg/30 border border-desert-border/70 rounded-lg text-xs text-desert-dark placeholder-desert-muted/70 focus:outline-none"
                />
              </form>

              {/* Task List */}
              <div className="space-y-2">
                {currentTasks.length === 0 ? (
                  <div className="bg-card-surface p-12 text-center rounded-xl border border-desert-border text-desert-muted">
                    No {taskSubtab} tasks created yet. Use the form above to add one.
                  </div>
                ) : (
                  currentTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
                        task.is_completed
                          ? 'bg-card-surface/50 border-desert-border/40 opacity-70'
                          : 'bg-card-surface border-desert-border shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className="mt-0.5 text-desert-muted hover:text-emerald-600 transition-colors"
                        >
                          {task.is_completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <h4 className={`text-sm font-semibold ${task.is_completed ? 'line-through text-desert-muted' : 'text-desert-dark'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-desert-muted mt-0.5 whitespace-pre-line">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-desert-muted">
                            {task.due_date && <span>Due: {task.due_date}</span>}
                            <span>Device: {task.device_id}</span>
                            <span>Version: v{task.version}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-desert-muted hover:text-red-500 p-1 rounded transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* NOTES & VAULT VIEWS */}
          {activeTab !== 'dashboard' && activeTab !== 'tasks' && (
            <div className="space-y-6">
              {/* Add Note Form */}
              <form onSubmit={handleCreateNote} className="bg-card-surface p-5 rounded-xl border border-desert-border shadow-sm space-y-3">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder={`New ${activeTab} title...`}
                  className="w-full px-3 py-2 bg-sand-bg/50 border border-desert-border rounded-lg text-sm font-medium text-desert-dark placeholder-desert-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <textarea
                  rows={3}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder={`Write your ${activeTab} content here...`}
                  className="w-full px-3 py-2 bg-sand-bg/50 border border-desert-border rounded-lg text-xs text-desert-dark placeholder-desert-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex items-center justify-between gap-3 pt-1">
                  <input
                    type="text"
                    value={newNoteTags}
                    onChange={(e) => setNewNoteTags(e.target.value)}
                    placeholder="Tags (e.g. #algo, #semester5)"
                    className="px-3 py-1.5 bg-sand-bg/30 border border-desert-border/70 rounded-lg text-xs text-desert-dark placeholder-desert-muted/70 w-64 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save {activeTab}</span>
                  </button>
                </div>
              </form>

              {/* Note Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentNotes.length === 0 ? (
                  <div className="col-span-2 bg-card-surface p-12 text-center rounded-xl border border-desert-border text-desert-muted">
                    No entries in {activeTab} yet. Write your first one above!
                  </div>
                ) : (
                  currentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-card-surface p-5 rounded-xl border border-desert-border shadow-sm flex flex-col justify-between hover:border-desert-border/80 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-headline font-bold text-base text-desert-dark">
                            {note.title}
                          </h4>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-desert-muted hover:text-red-500 p-1 rounded transition-colors"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-desert-muted/90 mt-2 whitespace-pre-wrap leading-relaxed">
                          {note.content}
                        </p>
                      </div>

                      <div className="pt-4 mt-3 border-t border-desert-border/50 flex items-center justify-between text-[10px] font-mono text-desert-muted">
                        <div>
                          {note.tags && (
                            <span className="px-2 py-0.5 rounded bg-sand-bg border border-desert-border mr-2 text-primary font-medium">
                              {note.tags}
                            </span>
                          )}
                          <span>v{note.version}</span>
                        </div>
                        <span>{new Date(note.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
