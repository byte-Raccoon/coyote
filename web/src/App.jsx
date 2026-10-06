import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  CheckSquare,
  Code2,
  Lightbulb,
  Archive,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Circle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Tag,
  Wifi,
  ChevronRight,
  Flame,
  Target
} from 'lucide-react'
import { api } from './api'

// Coyote Navigation Sections (Academic removed per user instruction)
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { 
    id: 'tasks', 
    label: 'Tasks', 
    icon: CheckSquare, 
    subtabs: [
      { id: 'daily', label: 'Daily' },
      { id: 'weekly', label: 'Weekly' },
      { id: 'yearly', label: 'Yearly' },
      { id: 'custom', label: 'Custom' },
      { id: 'archive', label: 'Archive', icon: Archive }
    ] 
  },
  { id: 'dsa', label: 'DSA Arena', icon: Code2 },
  { id: 'ideas', label: 'Project Ideas', icon: Lightbulb },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [taskSubtab, setTaskSubtab] = useState('daily')
  const [backendStatus, setBackendStatus] = useState({ connected: false, checking: true, message: 'Checking...' })
  const [lastSync, setLastSync] = useState(null)
  const [loading, setLoading] = useState(false)

  // 1. Core Persistent Data States
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('coyote_web_tasks')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [ideas, setIdeas] = useState(() => {
    try {
      const saved = localStorage.getItem('coyote_web_ideas')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [dsaState, setDsaState] = useState(() => {
    try {
      const saved = localStorage.getItem('coyote_web_dsa')
      return saved ? JSON.parse(saved) : {
        weeklyTarget: 15,
        dailyLogs: {},
        questions: []
      }
    } catch {
      return { weeklyTarget: 15, dailyLogs: {}, questions: [] }
    }
  })

  // Date helper
  const getTodayStr = () => new Date().toISOString().split('T')[0]
  const todayStr = getTodayStr()

  // 2. Modals & Forms State
  // Tasks Form / Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskCategory, setTaskCategory] = useState('daily')
  const [taskDueDate, setTaskDueDate] = useState(todayStr)
  const [taskPriority, setTaskPriority] = useState('Normal')
  const [taskFilterTag, setTaskFilterTag] = useState('all')

  // DSA Forms / Modals
  const [isDsaTargetModalOpen, setIsDsaTargetModalOpen] = useState(false)
  const [targetInput, setTargetInput] = useState(dsaState.weeklyTarget?.toString() || '15')
  const [isDsaLogModalOpen, setIsDsaLogModalOpen] = useState(false)
  const [dsaProbTitle, setDsaProbTitle] = useState('')
  const [dsaProbDiff, setDsaProbDiff] = useState('Medium')
  const [selectedGrindDay, setSelectedGrindDay] = useState(todayStr)

  // Ideas Forms / Modals
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false)
  const [editingIdea, setEditingIdea] = useState(null)
  const [ideaTitle, setIdeaTitle] = useState('')
  const [ideaTag, setIdeaTag] = useState('#Systems')
  const [ideaStatus, setIdeaStatus] = useState('Concept')
  const [ideaDesc, setIdeaDesc] = useState('')
  const [ideaFilterTag, setIdeaFilterTag] = useState('all')

  // Auto-persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('coyote_web_tasks', JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem('coyote_web_ideas', JSON.stringify(ideas))
  }, [ideas])

  useEffect(() => {
    localStorage.setItem('coyote_web_dsa', JSON.stringify(dsaState))
  }, [dsaState])

  // Load backend status and data
  useEffect(() => {
    checkHealth()
    fetchBackendData()
    const interval = setInterval(checkHealth, 15000)
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    try {
      const data = await api.getHealth()
      setBackendStatus({ connected: true, checking: false, message: `Connected (port ${data.port})` })
      setLastSync(new Date().toLocaleTimeString())
    } catch {
      setBackendStatus({ connected: false, checking: false, message: 'Backend offline (port 3335)' })
    }
  }

  const fetchBackendData = async () => {
    setLoading(true)
    try {
      const [backendTasks, backendNotes] = await Promise.all([
        api.getTasks().catch(() => null),
        api.getNotes().catch(() => null)
      ])

      if (backendTasks && Array.isArray(backendTasks) && backendTasks.length > 0) {
        setTasks(backendTasks)
      }

      if (backendNotes && Array.isArray(backendNotes)) {
        const remoteIdeas = backendNotes
          .filter(n => n.folder === 'ideas')
          .map(n => ({
            id: n.id,
            title: n.title,
            description: n.content,
            tag: n.tags || '#General',
            status: 'Concept',
            version: n.version,
            updated_at: n.updated_at
          }))
        if (remoteIdeas.length > 0) {
          setIdeas(remoteIdeas)
        }
      }
    } catch (err) {
      console.warn('Backend data sync note:', err)
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // TASK HANDLERS
  // ==========================================
  const openNewTaskModal = (cat = taskSubtab === 'archive' ? 'daily' : taskSubtab) => {
    setEditingTask(null)
    setTaskTitle('')
    setTaskDesc('')
    setTaskCategory(cat)
    setTaskPriority('Normal')
    if (cat === 'daily') {
      setTaskDueDate(todayStr)
    } else if (cat === 'weekly') {
      const d = new Date()
      d.setDate(d.getDate() + 7)
      setTaskDueDate(d.toISOString().split('T')[0])
    } else {
      setTaskDueDate(todayStr)
    }
    setIsTaskModalOpen(true)
  }

  const openEditTaskModal = (task) => {
    setEditingTask(task)
    setTaskTitle(task.title)
    setTaskDesc(task.description || '')
    setTaskCategory(task.category || 'daily')
    setTaskDueDate(task.due_date || task.date || todayStr)
    setTaskPriority(task.priority || 'Normal')
    setIsTaskModalOpen(true)
  }

  const handleSaveTask = async (e) => {
    e?.preventDefault()
    if (!taskTitle.trim()) return

    const resolvedDate = taskCategory === 'daily' ? todayStr : taskDueDate

    if (editingTask) {
      const updated = {
        ...editingTask,
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        category: taskCategory,
        due_date: resolvedDate,
        date: resolvedDate,
        priority: taskPriority,
        version: (editingTask.version || 1) + 1,
        updated_at: new Date().toISOString()
      }

      setTasks(tasks.map(t => t.id === editingTask.id ? updated : t))
      if (backendStatus.connected) {
        api.updateTask(editingTask.id, {
          title: updated.title,
          description: updated.description,
          category: updated.category,
          due_date: updated.due_date,
          priority: updated.priority
        }).catch(err => console.warn('Backend update failed:', err))
      }
    } else {
      const newTask = {
        id: 'coyote_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        category: taskCategory,
        due_date: resolvedDate,
        date: resolvedDate,
        priority: taskPriority,
        is_completed: false,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setTasks([newTask, ...tasks])
      if (backendStatus.connected) {
        api.createTask({
          title: newTask.title,
          description: newTask.description,
          category: newTask.category,
          due_date: newTask.due_date,
          priority: newTask.priority,
          is_completed: false
        }).then(res => {
          if (res?.id) {
            setTasks(prev => prev.map(t => t.id === newTask.id ? { ...t, id: res.id } : t))
          }
        }).catch(err => console.warn('Backend create failed:', err))
      }
    }

    setIsTaskModalOpen(false)
  }

  // Complete Task -> MOVES DIRECTLY TO ARCHIVE
  const handleCompleteTask = async (task) => {
    const updated = {
      ...task,
      is_completed: true,
      completed_at: new Date().toISOString(),
      version: (task.version || 1) + 1,
      updated_at: new Date().toISOString()
    }
    setTasks(tasks.map(t => t.id === task.id ? updated : t))
    if (backendStatus.connected) {
      api.updateTask(task.id, { is_completed: true }).catch(err => console.warn(err))
    }
  }

  // Restore Task -> MOVES FROM ARCHIVE BACK TO ACTIVE LIST
  const handleRestoreTask = async (task) => {
    const updated = {
      ...task,
      is_completed: false,
      completed_at: null,
      version: (task.version || 1) + 1,
      updated_at: new Date().toISOString()
    }
    setTasks(tasks.map(t => t.id === task.id ? updated : t))
    if (backendStatus.connected) {
      api.updateTask(task.id, { is_completed: false }).catch(err => console.warn(err))
    }
  }

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return
    setTasks(tasks.filter(t => t.id !== id))
    if (backendStatus.connected) {
      api.deleteTask(id).catch(err => console.warn(err))
    }
  }

  const handleClearArchive = async () => {
    const archived = tasks.filter(t => t.is_completed)
    if (archived.length === 0) return
    if (!window.confirm(`Permanently delete all ${archived.length} archived tasks?`)) return
    
    setTasks(tasks.filter(t => !t.is_completed))
    if (backendStatus.connected) {
      for (const t of archived) {
        api.deleteTask(t.id).catch(() => {})
      }
    }
  }

  // ==========================================
  // DSA ARENA HANDLERS
  // ==========================================
  const handleSaveDsaTarget = (e) => {
    e?.preventDefault()
    const parsed = parseInt(targetInput, 10)
    if (isNaN(parsed) || parsed <= 0) return
    setDsaState(prev => ({ ...prev, weeklyTarget: parsed }))
    setIsDsaTargetModalOpen(false)
  }

  const handleQuickAddTodayDsa = (delta = 1) => {
    const current = dsaState.dailyLogs[todayStr] || 0
    const nextVal = Math.max(0, current + delta)
    const nextLogs = { ...dsaState.dailyLogs, [todayStr]: nextVal }
    setDsaState(prev => ({ ...prev, dailyLogs: nextLogs }))
  }

  const handleLogDetailedDsa = (e) => {
    e?.preventDefault()
    if (!dsaProbTitle.trim()) return

    const newProb = {
      id: 'prob_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      title: dsaProbTitle.trim(),
      difficulty: dsaProbDiff,
      date: todayStr,
      created_at: new Date().toISOString()
    }

    const currentToday = dsaState.dailyLogs[todayStr] || 0
    const nextLogs = { ...dsaState.dailyLogs, [todayStr]: currentToday + 1 }
    const nextQuestions = [newProb, ...(dsaState.questions || [])]

    setDsaState(prev => ({
      ...prev,
      dailyLogs: nextLogs,
      questions: nextQuestions
    }))

    setDsaProbTitle('')
    setIsDsaLogModalOpen(false)
  }

  const handleDeleteDsaProblem = (id, probDate) => {
    const filtered = (dsaState.questions || []).filter(q => q.id !== id)
    const dateCount = Math.max(0, (dsaState.dailyLogs[probDate] || 1) - 1)
    const nextLogs = { ...dsaState.dailyLogs, [probDate]: dateCount }
    setDsaState(prev => ({
      ...prev,
      dailyLogs: nextLogs,
      questions: filtered
    }))
  }

  // Calculate DSA Metrics
  const todayDsaCount = dsaState.dailyLogs[todayStr] || 0
  const weeklyTarget = dsaState.weeklyTarget || 15

  const getWeeklySolved = () => {
    let sum = 0
    const now = new Date()
    for (let i = 0; i < 7; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toISOString().split('T')[0]
      sum += (dsaState.dailyLogs[key] || 0)
    }
    return sum
  }
  const weeklySolved = getWeeklySolved()
  const weeklyPercent = weeklyTarget > 0 ? Math.min(100, Math.round((weeklySolved / weeklyTarget) * 100)) : 0
  const totalDsaSolved = Object.values(dsaState.dailyLogs || {}).reduce((a, b) => a + b, 0)

  // ==========================================
  // PROJECT IDEAS HANDLERS
  // ==========================================
  const openNewIdeaModal = () => {
    setEditingIdea(null)
    setIdeaTitle('')
    setIdeaTag('#Systems')
    setIdeaStatus('Concept')
    setIdeaDesc('')
    setIsIdeaModalOpen(true)
  }

  const openEditIdeaModal = (idea) => {
    setEditingIdea(idea)
    setIdeaTitle(idea.title)
    setIdeaTag(idea.tag || '#Systems')
    setIdeaStatus(idea.status || 'Concept')
    setIdeaDesc(idea.description || '')
    setIsIdeaModalOpen(true)
  }

  const handleSaveIdea = (e) => {
    e?.preventDefault()
    if (!ideaTitle.trim()) return

    const normalizedTag = ideaTag.startsWith('#') ? ideaTag.trim() : '#' + ideaTag.trim()

    if (editingIdea) {
      const updated = {
        ...editingIdea,
        title: ideaTitle.trim(),
        tag: normalizedTag,
        status: ideaStatus,
        description: ideaDesc.trim(),
        version: (editingIdea.version || 1) + 1,
        updated_at: new Date().toISOString()
      }
      setIdeas(ideas.map(i => i.id === editingIdea.id ? updated : i))
      if (backendStatus.connected) {
        api.updateNote(editingIdea.id, {
          title: updated.title,
          content: updated.description,
          tags: updated.tag,
          folder: 'ideas'
        }).catch(err => console.warn(err))
      }
    } else {
      const newIdea = {
        id: 'coyote_idea_' + Date.now().toString(36),
        title: ideaTitle.trim(),
        tag: normalizedTag,
        status: ideaStatus,
        description: ideaDesc.trim(),
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setIdeas([newIdea, ...ideas])
      if (backendStatus.connected) {
        api.createNote({
          title: newIdea.title,
          content: newIdea.description,
          tags: newIdea.tag,
          folder: 'ideas'
        }).then(res => {
          if (res?.id) {
            setIdeas(prev => prev.map(i => i.id === newIdea.id ? { ...i, id: res.id } : i))
          }
        }).catch(err => console.warn(err))
      }
    }

    setIsIdeaModalOpen(false)
  }

  const handleDeleteIdea = (id) => {
    if (!window.confirm('Delete this project idea?')) return
    setIdeas(ideas.filter(i => i.id !== id))
    if (backendStatus.connected) {
      api.deleteNote(id).catch(err => console.warn(err))
    }
  }

  // ==========================================
  // FILTERING LOGIC
  // ==========================================
  // Active vs Archived Tasks
  const activeTasks = tasks.filter(t => !t.is_completed)
  const archivedTasks = tasks.filter(t => t.is_completed)

  let displayedTasks = []
  if (taskSubtab === 'archive') {
    displayedTasks = archivedTasks
  } else {
    displayedTasks = activeTasks.filter(t => t.category === taskSubtab)
    if (taskSubtab === 'custom' && taskFilterTag !== 'all') {
      displayedTasks = displayedTasks.filter(t => (t.priority || '').toLowerCase() === taskFilterTag.toLowerCase())
    }
  }

  const displayedIdeas = ideaFilterTag === 'all'
    ? ideas
    : ideas.filter(i => (i.tag || '').toLowerCase().includes(ideaFilterTag.toLowerCase()))

  // Live Dynamic Dashboard Numbers (ZERO Dummy Data)
  const dailyActiveCount = activeTasks.filter(t => t.category === 'daily').length
  const dailyResolvedCount = tasks.filter(t => t.category === 'daily' && t.is_completed).length
  const totalTasksCount = tasks.length
  const archivedTotalCount = archivedTasks.length
  const completionPercentage = totalTasksCount > 0 ? Math.round((archivedTotalCount / totalTasksCount) * 100) : 0

  return (
    <div className="min-h-screen flex bg-sand-bg text-desert-dark font-body antialiased selection:bg-primary/20 selection:text-primary">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-sidebar-bg text-[#FBF5EC] flex flex-col justify-between shadow-2xl border-r border-[#382b22] shrink-0">
        <div>
          {/* Brand */}
          <div className="h-16 px-5 flex items-center gap-3 border-b border-[#31251e]">
            <div className="w-9 h-9 rounded-full bg-primary/20 ring-2 ring-primary/40 flex items-center justify-center font-headline font-bold text-primary text-xl">
              C
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline text-lg tracking-wider uppercase text-[#FBF5EC] font-bold">COYOTE</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 font-mono font-bold">V2.5</span>
              </div>
              <p className="text-[10px] text-desert-muted font-mono tracking-wider">MAC AIR WORKSPACE</p>
            </div>
          </div>

          {/* Main Navigation Items */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              let badgeCount = null

              if (item.id === 'tasks') badgeCount = activeTasks.length
              if (item.id === 'dsa') badgeCount = todayDsaCount > 0 ? `+${todayDsaCount}` : null
              if (item.id === 'ideas') badgeCount = ideas.length

              return (
                <div key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-white font-semibold shadow-md'
                        : 'text-[#D0C0B0] hover:bg-sidebar-surface hover:text-[#FBF5EC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {badgeCount !== null && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-black/30 text-white' : 'bg-sidebar-surface text-desert-muted'
                      }`}>
                        {badgeCount}
                      </span>
                    )}
                  </button>

                  {/* Subtabs for Tasks (Daily, Weekly, Yearly, Custom, Archive) */}
                  {item.id === 'tasks' && isActive && (
                    <div className="ml-7 mt-1.5 space-y-1 border-l border-[#382b22] pl-2.5">
                      {item.subtabs.map((sub) => {
                        const isSubActive = taskSubtab === sub.id
                        const subCount = sub.id === 'archive'
                          ? archivedTasks.length
                          : activeTasks.filter(t => t.category === sub.id).length
                        const SubIcon = sub.icon

                        return (
                          <button
                            key={sub.id}
                            onClick={() => setTaskSubtab(sub.id)}
                            className={`w-full flex items-center justify-between px-2 py-1 text-xs rounded transition-colors ${
                              isSubActive
                                ? 'text-primary font-bold'
                                : 'text-desert-muted hover:text-[#FBF5EC]'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 capitalize">
                              {SubIcon ? <SubIcon className="w-3 h-3 text-terracotta" /> : '•'}
                              {sub.label}
                            </span>
                            <span className="text-[10px] font-mono text-desert-muted/70">
                              ({subCount})
                            </span>
                          </button>
                        )
                      })}
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
              <span className="text-desert-muted font-mono text-[11px] flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-primary" />
                SYNC ENGINE
              </span>
              <button
                onClick={() => { checkHealth(); fetchBackendData(); }}
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
                  <span className="text-amber-400 text-[11px] truncate">Offline (local cached)</span>
                </>
              )}
            </div>

            <div className="text-[10px] text-desert-muted font-mono pt-1 border-t border-[#382b22]/60 flex justify-between">
              <span>Client: 3333</span>
              <span>LAN Hotspot Ready</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar */}
        <header className="h-16 border-b border-desert-border/60 bg-card-surface/50 backdrop-blur px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-headline font-bold text-2xl text-desert-dark capitalize flex items-center gap-2">
              {activeTab === 'tasks' ? (
                <>
                  <span>Tasks</span>
                  <span className="text-base font-normal text-desert-muted">/ {taskSubtab}</span>
                </>
              ) : activeTab === 'dsa' ? (
                'DSA Arena'
              ) : activeTab === 'ideas' ? (
                'Project Ideas Vault'
              ) : (
                'Dashboard Grid'
              )}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-medium">
              macOS :3333
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

          {/* ======================================================== */}
          {/* DASHBOARD VIEW (ZERO DUMMY DATA)                          */}
          {/* ======================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-card-surface rounded-xl p-6 border border-desert-border shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-xl font-bold text-desert-dark flex items-center gap-2">
                    <span>Welcome to Coyote Workspace</span>
                    <Sparkles className="w-5 h-5 text-primary" />
                  </h2>
                  <p className="text-sm text-desert-muted mt-1">
                    Your command centre for tasks, algorithmic problems, and architecture blueprints.
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

              {/* Dynamic Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. Daily Active */}
                <div 
                  onClick={() => { setActiveTab('tasks'); setTaskSubtab('daily'); }}
                  className="bg-card-surface p-5 rounded-xl border border-desert-border shadow-sm cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-desert-muted uppercase">Daily Pending</span>
                    <CheckSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl font-headline font-bold text-primary mt-2">{dailyActiveCount}</div>
                  <span className="text-[11px] text-desert-muted mt-1 block">
                    {dailyResolvedCount} moved to archive
                  </span>
                </div>

                {/* 2. Archive Resolution */}
                <div 
                  onClick={() => { setActiveTab('tasks'); setTaskSubtab('archive'); }}
                  className="bg-card-surface p-5 rounded-xl border border-desert-border shadow-sm cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-desert-muted uppercase">Task Archive</span>
                    <Archive className="w-4 h-4 text-sage" />
                  </div>
                  <div className="text-3xl font-headline font-bold text-sage mt-2">
                    {archivedTotalCount} / {totalTasksCount}
                  </div>
                  <span className="text-[11px] text-desert-muted mt-1 block">
                    {completionPercentage}% resolved
                  </span>
                </div>

                {/* 3. DSA Sprint */}
                <div 
                  onClick={() => setActiveTab('dsa')}
                  className="bg-card-surface p-5 rounded-xl border border-desert-border shadow-sm cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-desert-muted uppercase">DSA Velocity</span>
                    <Code2 className="w-4 h-4 text-terracotta" />
                  </div>
                  <div className="text-3xl font-headline font-bold text-desert-dark mt-2">
                    {weeklySolved} / {weeklyTarget}
                  </div>
                  <span className="text-[11px] text-desert-muted mt-1 block">
                    +{todayDsaCount} today • {totalDsaSolved} total
                  </span>
                </div>

                {/* 4. Project Ideas */}
                <div 
                  onClick={() => setActiveTab('ideas')}
                  className="bg-card-surface p-5 rounded-xl border border-desert-border shadow-sm cursor-pointer hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-desert-muted uppercase">Ideas Vault</span>
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl font-headline font-bold text-primary mt-2">{ideas.length}</div>
                  <span className="text-[11px] text-desert-muted mt-1 block">
                    {ideas.filter(i => i.status === 'Shipped').length} shipped concepts
                  </span>
                </div>
              </div>

              {/* Tactical Split: Today's Priorities + Hotspot Sync */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Daily Tasks */}
                <div className="bg-card-surface p-6 rounded-xl border border-desert-border shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-headline font-bold text-lg flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-primary" />
                        Today's Tactical Priorities
                      </h3>
                      <button
                        onClick={() => { setActiveTab('tasks'); setTaskSubtab('daily'); }}
                        className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        <span>View all</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {activeTasks.filter(t => t.category === 'daily').length === 0 ? (
                      <div className="text-center py-10 text-desert-muted text-sm bg-sand-bg/40 rounded-lg border border-dashed border-desert-border">
                        All daily tasks resolved! You're ready for new tactical objectives.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeTasks
                          .filter(t => t.category === 'daily')
                          .slice(0, 5)
                          .map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-3 bg-sand-bg/40 rounded-lg border border-desert-border hover:bg-sand-bg/70 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleCompleteTask(task)}
                                  title="Mark complete & move to Archive"
                                  className="text-desert-muted hover:text-emerald-600 transition-colors"
                                >
                                  <Circle className="w-4 h-4" />
                                </button>
                                <div>
                                  <span className="text-sm font-medium">{task.title}</span>
                                  {task.priority && task.priority !== 'Normal' && (
                                    <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                                      {task.priority}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-desert-muted">Today</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openNewTaskModal('daily')}
                    className="mt-4 w-full py-2 bg-sand-bg/60 hover:bg-sand-bg text-primary text-xs font-semibold rounded-lg border border-desert-border flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick Add Daily Task</span>
                  </button>
                </div>

                {/* Hotspot & Wi-Fi Sync Guide */}
                <div className="bg-card-surface p-6 rounded-xl border border-desert-border shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline font-bold text-lg mb-3 flex items-center gap-2">
                      <Wifi className="w-5 h-5 text-terracotta" />
                      OnePlus Hotspot & LAN Sync
                    </h3>
                    <p className="text-sm text-desert-muted mb-4">
                      FastAPI server binds to <code>0.0.0.0:3335</code> so your OnePlus Android app can synchronize over local Wi-Fi or mobile hotspot.
                    </p>
                    <div className="space-y-2 text-xs text-desert-dark bg-sand-bg/60 p-3.5 rounded-lg border border-desert-border">
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-bold text-primary">01</span>
                        <span>Connect Mac and OnePlus to the same network or enable phone Hotspot.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-bold text-primary">02</span>
                        <span>Enter Mac's LAN IP address in the mobile app Sync settings.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-mono font-bold text-primary">03</span>
                        <span>Tap Sync on mobile: tasks and project ideas synchronize instantly.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-desert-border/50 flex items-center justify-between text-xs text-desert-muted font-mono">
                    <span>Host: 0.0.0.0:3335</span>
                    <span className="text-emerald-600 font-bold">LWW Resolution Enabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TASKS VIEW (DAILY AUTO-DATE, CRUD, ARCHIVE)              */}
          {/* ======================================================== */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {/* Header Selector & Controls */}
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-desert-border pb-4">
                <div className="flex items-center gap-2">
                  {[
                    { id: 'daily', label: 'Daily', count: activeTasks.filter(t => t.category === 'daily').length },
                    { id: 'weekly', label: 'Weekly', count: activeTasks.filter(t => t.category === 'weekly').length },
                    { id: 'yearly', label: 'Yearly', count: activeTasks.filter(t => t.category === 'yearly').length },
                    { id: 'custom', label: 'Custom', count: activeTasks.filter(t => t.category === 'custom').length },
                    { id: 'archive', label: 'Archive', count: archivedTasks.length, isArchive: true },
                  ].map((cat) => {
                    const isSelected = taskSubtab === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setTaskSubtab(cat.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                          isSelected
                            ? cat.isArchive 
                              ? 'bg-desert-dark text-white shadow-sm'
                              : 'bg-primary text-white shadow-sm'
                            : 'bg-card-surface text-desert-muted hover:bg-card-surface-alt hover:text-desert-dark'
                        }`}
                      >
                        {cat.isArchive && <Archive className="w-3 h-3" />}
                        <span>{cat.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isSelected ? 'bg-black/30 text-white' : 'bg-sand-bg text-desert-muted'
                        }`}>
                          {cat.count}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Action Button */}
                {taskSubtab === 'archive' ? (
                  archivedTasks.length > 0 && (
                    <button
                      onClick={handleClearArchive}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Archive</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => openNewTaskModal()}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add {taskSubtab.toUpperCase()} Task</span>
                  </button>
                )}
              </div>

              {/* Custom Tag Filter Row if in Custom Subtab */}
              {taskSubtab === 'custom' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-desert-muted font-medium">Filter Priority:</span>
                  {['all', 'urgent', 'p1', 'p2', 'normal'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setTaskFilterTag(tag)}
                      className={`px-2.5 py-1 rounded text-xs font-medium uppercase transition-colors ${
                        taskFilterTag === tag
                          ? 'bg-primary text-white'
                          : 'bg-card-surface text-desert-muted hover:bg-card-surface-alt'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}

              {/* Task Items List */}
              <div className="space-y-2.5">
                {displayedTasks.length === 0 ? (
                  <div className="bg-card-surface p-14 text-center rounded-xl border border-desert-border space-y-2">
                    {taskSubtab === 'archive' ? (
                      <>
                        <Archive className="w-8 h-8 text-desert-muted mx-auto" />
                        <h4 className="font-headline font-bold text-desert-dark text-base">Archive is Empty</h4>
                        <p className="text-xs text-desert-muted max-w-sm mx-auto">
                          Tasks marked complete are automatically transferred here instead of merely crossing through in active lists.
                        </p>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-8 h-8 text-desert-muted mx-auto" />
                        <h4 className="font-headline font-bold text-desert-dark text-base">No active {taskSubtab} tasks</h4>
                        <p className="text-xs text-desert-muted">
                          Click "+ Add {taskSubtab.toUpperCase()} Task" above to schedule a new objective.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  displayedTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between p-4 rounded-xl border transition-all ${
                        task.is_completed
                          ? 'bg-card-surface-alt/70 border-desert-border'
                          : 'bg-card-surface border-desert-border shadow-sm hover:border-desert-border/80'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Checkbox trigger: active completes & archives; archived restores */}
                        {!task.is_completed ? (
                          <button
                            onClick={() => handleCompleteTask(task)}
                            title="Complete and move to Archive"
                            className="mt-0.5 text-desert-muted hover:text-emerald-600 transition-colors"
                          >
                            <Circle className="w-5 h-5" />
                          </button>
                        ) : (
                          <div className="mt-0.5 text-emerald-600">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="text-sm font-bold text-desert-dark">
                              {task.title}
                            </h4>
                            {task.priority && task.priority !== 'Normal' && (
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                task.priority === 'Urgent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {task.priority}
                              </span>
                            )}
                            {task.is_completed && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase">
                                Archived ({task.category})
                              </span>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-xs text-desert-muted mt-1 whitespace-pre-line leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2.5 text-[10px] font-mono text-desert-muted">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {task.category === 'daily' ? `Today (${task.due_date || task.date})` : `Due: ${task.due_date || task.date}`}
                            </span>
                            <span>v{task.version || 1}</span>
                            {task.completed_at && (
                              <span className="text-emerald-700 font-medium">
                                Resolved: {new Date(task.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 ml-4">
                        {task.is_completed ? (
                          <button
                            onClick={() => handleRestoreTask(task)}
                            className="px-2.5 py-1 bg-sand-bg hover:bg-sand-bg/80 text-primary border border-desert-border rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Restore to active category"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openEditTaskModal(task)}
                            className="text-desert-muted hover:text-primary p-1.5 rounded transition-colors"
                            title="Modify task"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-desert-muted hover:text-red-500 p-1.5 rounded transition-colors"
                          title="Delete task permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* DSA ARENA VIEW (WEEKLY TARGET, TODAY'S COUNT, THE GRIND) */}
          {/* ======================================================== */}
          {activeTab === 'dsa' && (
            <div className="space-y-6">
              {/* Feature 1: Weekly Target Banner */}
              <div className="bg-card-surface rounded-xl p-6 border border-desert-border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                      FEATURE 1: WEEKLY TARGET SPRINT
                    </span>
                    <h3 className="text-2xl font-headline font-bold text-desert-dark mt-0.5">
                      {weeklySolved} / {weeklyTarget} Solved this week
                    </h3>
                  </div>
                  <button
                    onClick={() => { setTargetInput(weeklyTarget.toString()); setIsDsaTargetModalOpen(true); }}
                    className="px-3.5 py-1.5 bg-sand-bg hover:bg-sand-bg/80 text-desert-dark border border-desert-border rounded-lg text-xs font-bold transition-colors"
                  >
                    Set Weekly Target
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-sand-bg rounded-full overflow-hidden border border-desert-border/60">
                  <div
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${weeklyPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-desert-muted font-mono">
                  <span>{weeklyPercent}% of sprint target achieved</span>
                  <span>{Math.max(0, weeklyTarget - weeklySolved)} questions remaining</span>
                </div>
              </div>

              {/* Feature 2: Questions Done Today */}
              <div className="bg-card-surface rounded-xl p-6 border border-desert-border shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
                    FEATURE 2: QUESTIONS DONE TODAY
                  </span>
                  <div className="text-4xl font-headline font-bold text-primary mt-1">
                    {todayDsaCount}
                  </div>
                  <p className="text-xs text-desert-muted mt-0.5">
                    Problems logged for today ({todayStr})
                  </p>
                </div>

                {/* Quick Counter Controls + Log Problem Modal Trigger */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-sand-bg p-1 rounded-lg border border-desert-border">
                    <button
                      onClick={() => handleQuickAddTodayDsa(-1)}
                      className="w-9 h-9 rounded-md bg-card-surface hover:bg-card-surface-alt font-bold text-desert-dark text-base flex items-center justify-center transition-colors"
                      title="Decrement count"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => handleQuickAddTodayDsa(+1)}
                      className="w-9 h-9 rounded-md bg-primary hover:bg-primary-hover font-bold text-white text-base flex items-center justify-center transition-colors shadow-sm"
                      title="Increment count"
                    >
                      +1
                    </button>
                  </div>

                  <button
                    onClick={() => setIsDsaLogModalOpen(true)}
                    className="px-4 py-2 bg-sage hover:bg-sage/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Log Problem Details</span>
                  </button>
                </div>
              </div>

              {/* Feature 3: The Grind (Monthly Activity Heatmap Calendar) */}
              <div className="bg-card-surface rounded-xl p-6 border border-desert-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-terracotta" />
                    <h3 className="font-headline font-bold text-lg text-desert-dark">
                      Feature 3: The Grind — Monthly Activity
                    </h3>
                  </div>
                  <span className="text-xs text-desert-muted font-mono">
                    Selected: {selectedGrindDay === todayStr ? 'Today' : selectedGrindDay} ({dsaState.dailyLogs[selectedGrindDay] || 0} solved)
                  </span>
                </div>

                {/* Monthly 31-Day Grid */}
                <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-16 gap-2">
                  {Array.from({ length: 31 }, (_, i) => {
                    const dayNum = i + 1
                    const dayKey = `${todayStr.slice(0, 7)}-${String(dayNum).padStart(2, '0')}`
                    const count = dsaState.dailyLogs[dayKey] || 0
                    const isSelected = selectedGrindDay === dayKey

                    let cellBg = 'bg-sand-bg/60 text-desert-dark border-desert-border'
                    if (count >= 5) cellBg = 'bg-primary text-white border-primary shadow-sm font-bold'
                    else if (count >= 3) cellBg = 'bg-sage text-white border-sage font-bold'
                    else if (count >= 1) cellBg = 'bg-sage/20 text-sage border-sage/40 font-semibold'

                    return (
                      <button
                        key={dayKey}
                        onClick={() => setSelectedGrindDay(dayKey)}
                        className={`h-11 rounded-lg border flex flex-col items-center justify-center transition-all ${cellBg} ${
                          isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-card-surface' : ''
                        }`}
                      >
                        <span className="text-xs">{dayNum}</span>
                        {count > 0 && (
                          <span className="text-[9px] font-mono leading-none mt-0.5">
                            {count}q
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Color Legend */}
                <div className="flex items-center justify-end gap-2 text-[11px] font-mono text-desert-muted pt-2 border-t border-desert-border/40">
                  <span>Less</span>
                  <span className="w-3.5 h-3.5 rounded bg-sand-bg/60 border border-desert-border"></span>
                  <span className="w-3.5 h-3.5 rounded bg-sage/20 border border-sage/40"></span>
                  <span className="w-3.5 h-3.5 rounded bg-sage border border-sage"></span>
                  <span className="w-3.5 h-3.5 rounded bg-primary border border-primary"></span>
                  <span>More</span>
                </div>
              </div>

              {/* Solved Problems List for Selected Date */}
              <div className="bg-card-surface rounded-xl p-6 border border-desert-border shadow-sm space-y-3">
                <h4 className="font-headline font-bold text-base text-desert-dark">
                  Problems Solved on {selectedGrindDay === todayStr ? 'Today' : selectedGrindDay}
                </h4>

                {(dsaState.questions || []).filter(q => q.date === selectedGrindDay).length === 0 ? (
                  <div className="text-center py-6 text-desert-muted text-xs bg-sand-bg/30 rounded-lg border border-dashed border-desert-border">
                    No detailed problem names logged for this date. Use "Log Problem Details" to track problem titles.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(dsaState.questions || [])
                      .filter(q => q.date === selectedGrindDay)
                      .map((prob) => (
                        <div
                          key={prob.id}
                          className="flex items-center justify-between p-3 bg-sand-bg/40 rounded-lg border border-desert-border"
                        >
                          <div>
                            <span className="text-sm font-semibold text-desert-dark">{prob.title}</span>
                            <span className="text-[10px] text-desert-muted font-mono ml-2">{prob.date}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              prob.difficulty === 'Easy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prob.difficulty === 'Hard'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}>
                              {prob.difficulty}
                            </span>
                            <button
                              onClick={() => handleDeleteDsaProblem(prob.id, prob.date)}
                              className="text-desert-muted hover:text-red-500 transition-colors p-1"
                              title="Delete log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PROJECT IDEAS VAULT VIEW (REPLACES JOURNAL & ACADEMICS)   */}
          {/* ======================================================== */}
          {activeTab === 'ideas' && (
            <div className="space-y-6">
              {/* Header Banner & Filters */}
              <div className="bg-card-surface rounded-xl p-6 border border-desert-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-desert-dark">
                      Project Ideas Vault
                    </h3>
                    <p className="text-xs text-desert-muted mt-0.5">
                      Brainstorm architectures, systems blueprints, and product concepts.
                    </p>
                  </div>
                  <button
                    onClick={openNewIdeaModal}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Draft New Idea</span>
                  </button>
                </div>

                {/* Domain Tag Filters */}
                <div className="flex items-center gap-2 pt-2 border-t border-desert-border/50">
                  <span className="text-xs text-desert-muted font-medium">Domain Filter:</span>
                  {['all', 'systems', 'ai', 'mobile', 'web'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setIdeaFilterTag(tag)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                        ideaFilterTag === tag
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-sand-bg text-desert-muted hover:bg-card-surface-alt hover:text-desert-dark'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ideas Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedIdeas.length === 0 ? (
                  <div className="col-span-2 bg-card-surface p-14 text-center rounded-xl border border-desert-border space-y-2">
                    <Lightbulb className="w-8 h-8 text-desert-muted mx-auto" />
                    <h4 className="font-headline font-bold text-desert-dark text-base">No ideas in this filter</h4>
                    <p className="text-xs text-desert-muted">
                      Click "Draft New Idea" above to document a new project architecture.
                    </p>
                  </div>
                ) : (
                  displayedIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="bg-card-surface p-5 rounded-xl border border-desert-border shadow-sm flex flex-col justify-between hover:border-desert-border/90 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-sand-bg border border-desert-border">
                            {idea.tag || '#Systems'}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            idea.status === 'Shipped'
                              ? 'bg-emerald-100 text-emerald-800'
                              : idea.status === 'Prototyping'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sand-bg text-desert-dark'
                          }`}>
                            {idea.status}
                          </span>
                        </div>

                        <h4 className="font-headline font-bold text-base text-desert-dark mt-3">
                          {idea.title}
                        </h4>

                        {idea.description && (
                          <p className="text-xs text-desert-muted/90 mt-2 whitespace-pre-line leading-relaxed">
                            {idea.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 mt-3 border-t border-desert-border/50 flex items-center justify-between text-[11px] font-mono text-desert-muted">
                        <span>v{idea.version || 1}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditIdeaModal(idea)}
                            className="text-desert-muted hover:text-primary transition-colors p-1"
                            title="Edit idea"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteIdea(idea.id)}
                            className="text-desert-muted hover:text-red-500 transition-colors p-1"
                            title="Delete idea"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT TASK                                    */}
      {/* ======================================================== */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-desert-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-surface w-full max-w-md rounded-2xl p-6 border border-desert-border shadow-2xl space-y-4">
            <h3 className="font-headline font-bold text-lg text-desert-dark">
              {editingTask ? 'Modify Task' : `New ${taskCategory.toUpperCase()} Task`}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-desert-muted font-mono block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full px-3 py-2 bg-sand-bg border border-desert-border rounded-lg text-sm text-desert-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-desert-muted font-mono block mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Optional notes or subtasks..."
                  className="w-full px-3 py-2 bg-sand-bg border border-desert-border rounded-lg text-xs text-desert-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Date selection: auto-locked for daily, editable for others */}
              <div>
                <label className="text-xs font-bold uppercase text-desert-muted font-mono block mb-1">
                  {taskCategory === 'daily' ? 'Date (Auto-locked to Today)' : 'Due Date'}
                </label>
                <input
                  type="date"
                  disabled={taskCategory === 'daily'}
                  value={taskCategory === 'daily' ? todayStr : taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className={`w-full px-3 py-2 bg-sand-bg border border-desert-border rounded-lg text-xs text-desert-dark focus:outline-none ${
                    taskCategory === 'daily' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              {/* Priority Tag Selector */}
              <div>
                <label className="text-xs font-bold uppercase text-desert-muted font-mono block mb-1">
                  Priority Tag
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Normal', 'P2', 'P1', 'Urgent'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setTaskPriority(p)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        taskPriority === p
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-sand-bg text-desert-dark hover:bg-card-surface-alt'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-desert-border">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 bg-sand-bg hover:bg-card-surface-alt text-desert-muted font-medium text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SET WEEKLY TARGET                                  */}
      {/* ======================================================== */}
      {isDsaTargetModalOpen && (
        <div className="fixed inset-0 bg-desert-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-surface w-full max-w-sm rounded-2xl p-6 border border-desert-border shadow-2xl space-y-4">
            <h3 className="font-headline font-bold text-lg text-desert-dark">
              Set Weekly DSA Target
            </h3>
            <p className="text-xs text-desert-muted">
              How many algorithmic questions do you target to solve each week?
            </p>

            <form onSubmit={handleSaveDsaTarget} className="space-y-4">
              <input
                type="number"
                min="1"
                required
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-3 py-2 bg-sand-bg border border-desert-border rounded-lg text-base font-bold text-desert-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDsaTargetModalOpen(false)}
                  className="px-4 py-2 bg-sand-bg hover:bg-card-surface-alt text-desert-muted font-medium text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: LOG SOLVED DSA PROBLEM                             */}
      {/* ======================================================== */}
      {isDsaLogModalOpen && (
        <div className="fixed inset-0 bg-desert-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-surface w-full max-w-md rounded-2xl p-6 border border-desert-border shadow-2xl space-y-4">
            <h3 className="font-headline font-bold text-lg text-desert-dark">
              Log Solved DSA Problem
            </h3>

            <form onSubmit={handleLogDetailedDsa} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-desert-muted font-mono block mb-1">
                  Problem Number & Title
                </label>
                <input
                  type="text"
                  required
                  value={dsaProbTitle}
                  onChange={(e) => setDsaProbTitle(e.target.value)}
                  placeholder="e.g. #210 Course Schedule II"
                  className="w-full px-3 py-2 bg-sand-bg border border-desert-border rounded-lg text-sm text-desert-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-desert-muted font-mono block mb-1">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      type="button"
                      key={diff}
                      onClick={() => setDsaProbDiff(diff)}
                      className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                        dsaProbDiff === diff
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-sand-bg text-desert-dark hover:bg-card-surface-alt'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-desert-border">
                <button
                  type="button"
                  onClick={() => setIsDsaLogModalOpen(false)}
                  className="px-4 py-2 bg-sand-bg hover:bg-card-surface-alt text-desert-muted font-medium text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                >
                  Log Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PROJECT IDEA                            */}
      {/* ======================================================== */}
      {isIdeaModalOpen && (
        <div className="fixed inset-0 bg-desert-dark/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-surface w-full max-w-md rounded-2xl p-6 border border-desert-border shadow-2xl space-y-4">
            <h3 className="font-headline font-bold text-lg text-desert-dark">
              {editingIdea ? 'Modify Project Idea' : 'Draft New Project Idea'}
            </h3>

            <form onSubmit={handleSaveIdea} className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase text-desert-muted font-mono block mb-1">
                  Concept Title
                </label>
                <input
                  type="text"
                  required
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus Engine"
                  className="w-full px-3 py-2 bg-sand-bg border border-desert-border rounded-lg text-sm text-desert-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-desert-muted font-mono block mb-1">
                    Domain Tag
                  </label>
                  <input
                    type="text"
                    value={ideaTag}
                    onChange={(e) => setIdeaTag(e.target.value)}
                    placeholder="#Systems"
                    className="w-full px-3 py-2 bg-sand-bg border border-desert-border rounded-lg text-xs text-desert-dark focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-desert-muted font-mono block mb-1">
                    Status
                  </label>
                  <select
                    value={ideaStatus}
                    onChange={(e) => setIdeaStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-sand-bg border border-desert-border rounded-lg text-xs text-desert-dark focus:outline-none"
                  >
                    <option value="Concept">Concept</option>
                    <option value="Prototyping">Prototyping</option>
                    <option value="Shipped">Shipped</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-desert-muted font-mono block mb-1">
                  Architecture & Execution Blueprint
                </label>
                <textarea
                  rows={4}
                  value={ideaDesc}
                  onChange={(e) => setIdeaDesc(e.target.value)}
                  placeholder="Architecture notes, tech stack, and execution roadmap..."
                  className="w-full px-3 py-2 bg-sand-bg border border-desert-border rounded-lg text-xs text-desert-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-desert-border">
                <button
                  type="button"
                  onClick={() => setIsIdeaModalOpen(false)}
                  className="px-4 py-2 bg-sand-bg hover:bg-card-surface-alt text-desert-muted font-medium text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                >
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
