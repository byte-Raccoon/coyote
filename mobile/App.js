import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { SyncClient } from './src/sync';

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 0;

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('task'); // task, academic, dashboard, dsa, journal, sync
  
  // Task Command Sub-Tabs
  const [taskCategory, setTaskCategory] = useState('daily'); // daily, weekly, monthly, custom
  const [taskFilterTag, setTaskFilterTag] = useState('all');
  
  // Academic Portal Sub-Tabs
  const [acadCategory, setAcadCategory] = useState('daily'); // daily, weekly, monthly, audit
  
  // Sync state
  const [hostIp, setHostIp] = useState('192.168.1.100');
  const [syncStatus, setSyncStatus] = useState('Desert Grid Active');
  const [syncing, setSyncing] = useState(false);

  // Dynamic Task Data
  const [dailyTasks, setDailyTasks] = useState([
    { id: '1', time: '09:00 MST', title: 'Telemetry Standup & Sector Check-in', desc: 'Grid baseline verified across all sensors', tag: 'Done', isDone: true, isUrgent: false },
    { id: '2', time: '10:30 MST', title: 'Calibrate ultrasonic Doppler velocity radar', desc: 'Hardware testing in Canyon Gap', tag: 'Urgent', isDone: true, isUrgent: true },
    { id: '3', time: '14:00 MST', title: 'Implement Dijkstra edge relaxation for topological mesh', desc: 'Verified 2 LeetCode medium cases', tag: 'Algorithms', isDone: true, isUrgent: false },
    { id: '4', time: '21:00 MST (Tonight)', title: 'Review CS 641 Midterm practice exam Q1-5', desc: 'Paxos vs Raft trade-off analysis & leader election', tag: 'Urgent', isDone: false, isUrgent: true }
  ]);
  const [newObjective, setNewObjective] = useState('');

  // Dynamic Journal Data
  const [journalTitle, setJournalTitle] = useState('Sector 7 Acoustic Telemetry & Anvil Trajectory');
  const [journalContent, setJournalContent] = useState('Target observed traveling eastward on Highway 66 at 65 knots.\n\nCountermeasure:\nReinforce base pedestal with ACME titanium anchors.');

  // Dynamic DSA Problem Data
  const [dsaProblems, setDsaProblems] = useState([
    { id: 'p1', title: '#210 Course Schedule II (Topo Sort)', desc: "Kahn's algorithm, in-degree BFS", solved: true },
    { id: 'p2', title: '#42 Trapping Rain Water', desc: 'Two-pointer approach O(1) space', solved: true },
    { id: 'p3', title: '#208 Implement Trie', desc: 'Prefix search and child arrays', solved: false }
  ]);

  const syncClient = new SyncClient(hostIp, 3335, 'oneplus-phone');

  const testConnection = async () => {
    setSyncing(true);
    setSyncStatus('Connecting...');
    try {
      const data = await syncClient.checkHostHealth();
      setSyncStatus(`Mac Connected :${data.port}`);
      Alert.alert('Coyote Sync Connected', `Successfully connected to MacBook Air on ${hostIp}:3335!`);
    } catch (err) {
      setSyncStatus('Local Host Offline');
      Alert.alert('Connection Notice', `Could not reach ${hostIp}:3335. Ensure Mac is on same Wi-Fi/Hotspot.`);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddDailyTask = () => {
    if (!newObjective.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      time: 'Now',
      title: newObjective.trim(),
      desc: 'Tactical field objective',
      tag: 'New',
      isDone: false,
      isUrgent: false
    };
    setDailyTasks([...dailyTasks, newTask]);
    setNewObjective('');
  };

  const toggleTaskDone = (id) => {
    setDailyTasks(dailyTasks.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t));
  };

  const toggleDsaSolved = (id) => {
    setDsaProblems(dsaProblems.map(p => p.id === id ? { ...p, solved: !p.solved } : p));
  };

  const completedCount = dailyTasks.filter(t => t.isDone).length;
  const totalCount = dailyTasks.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const urgentCount = dailyTasks.filter(t => t.isUrgent && !t.isDone).length;

  const viewBadges = {
    task: 'Task Command',
    academic: 'Academic Portal',
    dashboard: 'Command Grid',
    dsa: 'DSA Arena',
    journal: 'Field Journal',
    sync: 'Sync Engine'
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      {/* TOP APP BAR */}
      <View style={styles.topAppBar}>
        <View style={styles.topBrandRow}>
          <View style={styles.mascotRing}>
            <Text style={styles.mascotText}>C</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>COYOTE</Text>
              <View style={styles.vBadge}>
                <Text style={styles.vBadgeText}>V2.4</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, syncStatus.includes('Connected') ? styles.dotGreen : styles.dotAmber]} />
              <Text style={styles.statusLabel}>{syncStatus}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.activeBadge} 
          onPress={() => setActiveTab('sync')}
        >
          <Text style={styles.activeBadgeText}>{viewBadges[activeTab] || 'Workspace'}</Text>
        </TouchableOpacity>
      </View>

      {/* MAIN SCROLLABLE VIEW */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ====================================================
            VIEW 1: TASK COMMAND OPERATIONS
            ==================================================== */}
        {activeTab === 'task' && (
          <View style={styles.viewSection}>
            {/* Section Banner & 4-Pill Category Selector */}
            <View style={styles.commandBanner}>
              <View style={styles.bannerHeader}>
                <Text style={styles.bannerTitle}>Task Command</Text>
                <Text style={styles.bannerSub}>MST Sector 7</Text>
              </View>
              
              <View style={styles.pillSelector}>
                {[
                  { key: 'daily', label: 'Daily', count: dailyTasks.length },
                  { key: 'weekly', label: 'Weekly', count: 5 },
                  { key: 'monthly', label: 'Monthly', count: 3 },
                  { key: 'custom', label: 'Custom', count: null },
                ].map((pill) => (
                  <TouchableOpacity
                    key={pill.key}
                    onPress={() => setTaskCategory(pill.key)}
                    style={[styles.pillButton, taskCategory === pill.key && styles.pillButtonActive]}
                  >
                    <Text style={[styles.pillText, taskCategory === pill.key && styles.pillTextActive]}>
                      {pill.label}
                    </Text>
                    {pill.count !== null && (
                      <View style={[styles.pillCountBadge, taskCategory === pill.key && styles.pillCountBadgeActive]}>
                        <Text style={[styles.pillCountText, taskCategory === pill.key && styles.pillCountTextActive]}>
                          {pill.count}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dummy Disclaimer Banner */}
            <View style={styles.noticeBanner}>
              <View style={styles.noticeTag}>
                <Text style={styles.noticeTagText}>NOTICE</Text>
              </View>
              <Text style={styles.noticeText}>
                Mobile version and web version are just dummies, not a real working app and site, we still have to implement all the feature.
              </Text>
            </View>

            {/* 1.1 DAILY SUBVIEW */}
            {taskCategory === 'daily' && (
              <View style={styles.subviewContainer}>
                {/* 2-Column Summary Cards */}
                <View style={styles.twoColumnGrid}>
                  <View style={styles.cardBox}>
                    <Text style={styles.metricLabel}>Daily Completion</Text>
                    <Text style={styles.metricValueLarge}>{completedCount}/{totalCount}</Text>
                    <Text style={styles.metricHighlight}>{completionPercent}% Done</Text>
                  </View>

                  <View style={styles.cardBox}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.metricLabel}>Urgent Priority</Text>
                      <View style={[styles.statusDot, { backgroundColor: '#B22915' }]} />
                    </View>
                    <Text style={[styles.metricValueLarge, { color: '#B22915' }]}>{urgentCount} Task</Text>
                    <Text style={styles.metricSub}>Must resolve by 21:00</Text>
                  </View>
                </View>

                {/* Add Quick Input Form */}
                <View style={styles.addInputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Add tactical daily objective..."
                    placeholderTextColor="#756252"
                    value={newObjective}
                    onChangeText={setNewObjective}
                  />
                  <TouchableOpacity style={styles.primaryAddBtn} onPress={handleAddDailyTask}>
                    <Text style={styles.primaryAddBtnText}>+ Add</Text>
                  </TouchableOpacity>
                </View>

                {/* Chronological Timeline Schedule */}
                <View style={styles.timelineCard}>
                  <View style={styles.timelineHeader}>
                    <Text style={styles.timelineHeading}>Daily Timeline Schedule</Text>
                    <Text style={styles.timelineDate}>Today</Text>
                  </View>

                  <View style={styles.timelineList}>
                    {dailyTasks.map((t) => (
                      <View key={t.id} style={styles.timelineRow}>
                        <TouchableOpacity 
                          style={[styles.checkCircle, t.isDone && styles.checkCircleDone]}
                          onPress={() => toggleTaskDone(t.id)}
                        >
                          <Text style={[styles.checkMark, t.isDone && styles.checkMarkDone]}>✓</Text>
                        </TouchableOpacity>

                        <View style={[styles.timelineContentBox, t.isDone && styles.contentBoxDone]}>
                          <View style={styles.rowBetween}>
                            <Text style={styles.timelineTime}>{t.time}</Text>
                            <View style={[
                              styles.tagChip, 
                              t.tag === 'Urgent' ? styles.tagUrgent : t.tag === 'Done' ? styles.tagDone : styles.tagAlgo
                            ]}>
                              <Text style={[
                                styles.tagChipText,
                                t.tag === 'Urgent' ? styles.tagUrgentText : t.tag === 'Done' ? styles.tagDoneText : styles.tagAlgoText
                              ]}>{t.tag}</Text>
                            </View>
                          </View>
                          <Text style={[styles.timelineTaskTitle, t.isDone && styles.taskTitleStrike]}>
                            {t.title}
                          </Text>
                          <Text style={styles.timelineTaskDesc}>{t.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* 1.2 WEEKLY SUBVIEW */}
            {taskCategory === 'weekly' && (
              <View style={styles.subviewContainer}>
                <View style={styles.cardBox}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.metricLabel}>Sprint Week 43 Horizon</Text>
                    <Text style={styles.metricHighlight}>68% Target</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '68%' }]} />
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.metricSub}>17/25 Milestones</Text>
                    <Text style={styles.metricSub}>3 Days Left</Text>
                  </View>
                </View>

                {/* Track Objectives */}
                <View style={[styles.cardBox, { marginTop: 10 }]}>
                  <Text style={styles.trackTag}>SYSTEMS MASTERY</Text>
                  <Text style={styles.trackTitle}>Finalize Distributed Consensus Benchmark</Text>
                  <Text style={styles.metricSub}>Benchmark network partitions across 5 nodes with Poisson latencies.</Text>
                  <Text style={styles.trackDeadline}>Deadline: Friday 18:00</Text>
                </View>

                <View style={[styles.cardBox, { marginTop: 10 }]}>
                  <Text style={[styles.trackTag, { color: '#3E6A5E' }]}>ALGORITHMIC SPRINT</Text>
                  <Text style={styles.trackTitle}>Solve 12 Graph Traversal Problems</Text>
                  <Text style={styles.metricSub}>Focus on Tarjan's SCC and Kahn's topological sort.</Text>
                  <Text style={[styles.trackDeadline, { color: '#3E6A5E' }]}>Target: Saturday • 9/12 Done</Text>
                </View>
              </View>
            )}

            {/* 1.3 MONTHLY SUBVIEW */}
            {taskCategory === 'monthly' && (
              <View style={styles.subviewContainer}>
                <View style={styles.cardBox}>
                  <Text style={styles.sectionHeaderTitle}>Monthly Quotas</Text>
                  <View style={{ marginTop: 8 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.metricSub}>DSA Quota (24/30 Solved)</Text>
                      <Text style={styles.metricHighlight}>80%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: '80%' }]} />
                    </View>
                  </View>

                  <View style={{ marginTop: 10 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.metricSub}>Course Reviews (3/4)</Text>
                      <Text style={[styles.metricHighlight, { color: '#3E6A5E' }]}>75%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: '75%', backgroundColor: '#3E6A5E' }]} />
                    </View>
                  </View>
                </View>

                {/* Horizon Calendar */}
                <View style={[styles.cardBox, { marginTop: 12 }]}>
                  <Text style={styles.sectionHeaderTitle}>Horizon Calendar</Text>
                  <View style={styles.horizonEventBox}>
                    <Text style={styles.eventCount}>OCT 27 • 3 Days Away</Text>
                    <Text style={styles.eventTitle}>Distributed Systems Midterm Exam</Text>
                    <Text style={styles.eventStatusCrit}>Critical Exam</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 1.4 CUSTOM SUBVIEW */}
            {taskCategory === 'custom' && (
              <View style={styles.subviewContainer}>
                <View style={styles.cardBox}>
                  <Text style={styles.metricLabel}>Filter By Domain Tag</Text>
                  <View style={styles.tagFilterRow}>
                    {['all', 'systems', 'algorithms', 'academic'].map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => setTaskFilterTag(tag)}
                        style={[styles.tagFilterBtn, taskFilterTag === tag && styles.tagFilterBtnActive]}
                      >
                        <Text style={[styles.tagFilterBtnText, taskFilterTag === tag && styles.tagFilterBtnTextActive]}>
                          #{tag.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ marginTop: 10, gap: 8 }}>
                  <View style={styles.customTaskItem}>
                    <View>
                      <Text style={styles.customTaskTitle}>Distributed Paxos synod simulation</Text>
                      <Text style={styles.metricSub}>Tag: #Systems • High Priority</Text>
                    </View>
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityBadgeText}>P1</Text>
                    </View>
                  </View>

                  <View style={styles.customTaskItem}>
                    <View>
                      <Text style={styles.customTaskTitle}>Monotonic deque sliding window bench</Text>
                      <Text style={styles.metricSub}>Tag: #Algorithms • O(N) optimization</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: '#E3EFEA' }]}>
                      <Text style={[styles.priorityBadgeText, { color: '#3E6A5E' }]}>P2</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ====================================================
            VIEW 2: ACADEMIC PORTAL
            ==================================================== */}
        {activeTab === 'academic' && (
          <View style={styles.viewSection}>
            <View style={styles.commandBanner}>
              <View style={styles.bannerHeader}>
                <Text style={styles.bannerTitle}>Academic Portal</Text>
                <View style={styles.gpaPill}>
                  <Text style={styles.gpaPillText}>GPA 3.94</Text>
                </View>
              </View>

              <View style={styles.pillSelector}>
                {['daily', 'weekly', 'monthly', 'audit'].map((sub) => (
                  <TouchableOpacity
                    key={sub}
                    onPress={() => setAcadCategory(sub)}
                    style={[styles.pillButton, acadCategory === sub && styles.pillButtonActive]}
                  >
                    <Text style={[styles.pillText, acadCategory === sub && styles.pillTextActive]}>
                      {sub.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {acadCategory === 'daily' && (
              <View style={styles.subviewContainer}>
                <View style={styles.twoColumnGrid}>
                  <View style={styles.cardBox}>
                    <Text style={styles.metricLabel}>Today's Lectures</Text>
                    <Text style={styles.metricValueLarge}>2 Blocks</Text>
                    <Text style={styles.metricHighlight}>CS 641 & MATH 480</Text>
                  </View>
                  <View style={styles.cardBox}>
                    <Text style={styles.metricLabel}>Study Goal</Text>
                    <Text style={[styles.metricValueLarge, { color: '#3E6A5E' }]}>4.0 Hours</Text>
                    <Text style={[styles.metricHighlight, { color: '#3E6A5E' }]}>2.5h Completed</Text>
                  </View>
                </View>

                <View style={[styles.cardBox, { marginTop: 12 }]}>
                  <Text style={styles.sectionHeaderTitle}>Today's Lecture Schedule</Text>
                  <View style={styles.lectureRow}>
                    <View style={styles.lectureTimeBadge}>
                      <Text style={styles.lectureTimeText}>10:00</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lectureName}>CS 641: Distributed Systems</Text>
                      <Text style={styles.metricSub}>Hall 3B • Raft Consensus & Compaction</Text>
                    </View>
                    <Text style={styles.tagDoneText}>Attended</Text>
                  </View>

                  <View style={[styles.lectureRow, { borderBottomWidth: 0 }]}>
                    <View style={[styles.lectureTimeBadge, { backgroundColor: '#F5E6D3' }]}>
                      <Text style={[styles.lectureTimeText, { color: '#2A1D15' }]}>14:00</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lectureName}>MATH 480: Linear Algebra</Text>
                      <Text style={styles.metricSub}>Hall A • SVD & Principal Components</Text>
                    </View>
                    <Text style={styles.tagUrgentText}>Up Next</Text>
                  </View>
                </View>
              </View>
            )}

            {acadCategory === 'weekly' && (
              <View style={styles.subviewContainer}>
                <View style={styles.cardBox}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.courseCodeBadge}>CS 641</Text>
                    <Text style={styles.creditText}>4.0 Credits</Text>
                  </View>
                  <Text style={styles.trackTitle}>Distributed Systems</Text>
                  <Text style={styles.metricSub}>MWF 10:00 • Prof. Vance • Invariants & Leases</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '68%' }]} />
                  </View>
                  <Text style={styles.metricHighlight}>Pset #3 Due Friday 23:59</Text>
                </View>

                <View style={[styles.cardBox, { marginTop: 10 }]}>
                  <View style={styles.rowBetween}>
                    <Text style={[styles.courseCodeBadge, { backgroundColor: '#3E6A5E' }]}>CS 782</Text>
                    <Text style={styles.creditText}>4.0 Credits</Text>
                  </View>
                  <Text style={styles.trackTitle}>Machine Learning & Autonomous Systems</Text>
                  <Text style={styles.metricSub}>T/Th 13:30 • Dr. Rostova • Vision Heads & Edge TPU</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '72%', backgroundColor: '#3E6A5E' }]} />
                  </View>
                  <Text style={[styles.metricHighlight, { color: '#3E6A5E' }]}>Recitation: Wednesday 15:00</Text>
                </View>
              </View>
            )}

            {acadCategory === 'audit' && (
              <View style={styles.subviewContainer}>
                <View style={styles.cardBox}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.sectionHeaderTitle}>Degree Audit Status</Text>
                    <Text style={styles.metricHighlight}>87.5% Completed</Text>
                  </View>
                  <Text style={styles.metricSub}>112 of 128 Credits Fulfilled • Senior Standing</Text>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '87.5%', backgroundColor: '#3E6A5E' }]} />
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ====================================================
            VIEW 3: DASHBOARD
            ==================================================== */}
        {activeTab === 'dashboard' && (
          <View style={styles.viewSection}>
            <View style={styles.twoColumnGrid}>
              <TouchableOpacity style={styles.cardBox} onPress={() => setActiveTab('task')}>
                <Text style={styles.metricLabel}>Daily Tasks</Text>
                <Text style={styles.metricValueLarge}>{completedCount}/{totalCount}</Text>
                <Text style={styles.metricHighlight}>{completionPercent}% Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cardBox} onPress={() => setActiveTab('dsa')}>
                <Text style={styles.metricLabel}>DSA Solved</Text>
                <Text style={styles.metricValueLarge}>142</Text>
                <Text style={[styles.metricHighlight, { color: '#3E6A5E' }]}>+3 today • Top 2.1%</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.twoColumnGrid, { marginTop: 10 }]}>
              <TouchableOpacity style={styles.cardBox} onPress={() => setActiveTab('journal')}>
                <Text style={styles.metricLabel}>Field Journal</Text>
                <Text style={styles.metricValueLarge}>18 Days</Text>
                <Text style={styles.metricSub}>SOL-1049 Active</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cardBox} onPress={() => setActiveTab('academic')}>
                <Text style={styles.metricLabel}>Academic GPA</Text>
                <Text style={styles.metricValueLarge}>3.94</Text>
                <Text style={[styles.metricHighlight, { color: '#3E6A5E' }]}>Honors • Exam in 3d</Text>
              </TouchableOpacity>
            </View>

            {/* Next Tactical Objective */}
            <View style={[styles.cardBox, { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.trackTag}>NEXT TACTICAL OBJECTIVE</Text>
                <Text style={styles.trackTitle}>CS 641 Midterm practice questions</Text>
              </View>
              <TouchableOpacity style={styles.primaryAddBtn} onPress={() => setActiveTab('task')}>
                <Text style={styles.primaryAddBtnText}>Open</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ====================================================
            VIEW 4: DSA ARENA
            ==================================================== */}
        {activeTab === 'dsa' && (
          <View style={styles.viewSection}>
            <View style={styles.cardBox}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionHeaderTitle}>Algorithmic Velocity</Text>
                <View style={styles.tagChip}>
                  <Text style={styles.tagChipText}>Top 2.1%</Text>
                </View>
              </View>
              <Text style={styles.metricSub}>142 Problems Solved</Text>

              {/* 3 Difficulty Stats */}
              <View style={[styles.twoColumnGrid, { marginTop: 12 }]}>
                <View style={styles.diffBox}>
                  <Text style={[styles.diffNumber, { color: '#3E6A5E' }]}>68</Text>
                  <Text style={styles.diffLabel}>Easy</Text>
                </View>
                <View style={styles.diffBox}>
                  <Text style={[styles.diffNumber, { color: '#D9531E' }]}>62</Text>
                  <Text style={styles.diffLabel}>Medium</Text>
                </View>
                <View style={styles.diffBox}>
                  <Text style={[styles.diffNumber, { color: '#B22915' }]}>12</Text>
                  <Text style={styles.diffLabel}>Hard</Text>
                </View>
              </View>
            </View>

            {/* Problem List */}
            <View style={{ marginTop: 12, gap: 8 }}>
              {dsaProblems.map((prob) => (
                <View key={prob.id} style={styles.customTaskItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customTaskTitle}>{prob.title}</Text>
                    <Text style={styles.metricSub}>{prob.desc}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.tagChip, prob.solved ? styles.tagDone : styles.tagUrgent]}
                    onPress={() => toggleDsaSolved(prob.id)}
                  >
                    <Text style={[styles.tagChipText, prob.solved ? styles.tagDoneText : styles.tagUrgentText]}>
                      {prob.solved ? 'Solved' : 'Solve'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ====================================================
            VIEW 5: FIELD JOURNAL
            ==================================================== */}
        {activeTab === 'journal' && (
          <View style={styles.viewSection}>
            <View style={styles.cardBox}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionHeaderTitle}>Field Log SOL-1049</Text>
                <View style={styles.tagChip}>
                  <Text style={styles.tagChipText}>Today</Text>
                </View>
              </View>

              <TextInput
                style={[styles.textInput, { marginTop: 12, fontWeight: 'bold' }]}
                value={journalTitle}
                onChangeText={setJournalTitle}
                placeholder="Log title..."
                placeholderTextColor="#756252"
              />

              <TextInput
                style={[styles.textInput, { marginTop: 8, height: 120, textAlignVertical: 'top' }]}
                value={journalContent}
                onChangeText={setJournalContent}
                multiline
                placeholder="Field observations & countermeasures..."
                placeholderTextColor="#756252"
              />

              <TouchableOpacity 
                style={[styles.primaryAddBtn, { marginTop: 12, width: '100%', alignItems: 'center' }]}
                onPress={() => Alert.alert('Saved', 'Field log saved to local device cache.')}
              >
                <Text style={styles.primaryAddBtnText}>Save Log Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ====================================================
            VIEW 6: SYNC ENGINE
            ==================================================== */}
        {activeTab === 'sync' && (
          <View style={styles.viewSection}>
            <View style={styles.cardBox}>
              <Text style={styles.sectionHeaderTitle}>Wi-Fi & Hotspot Sync Engine</Text>
              <Text style={styles.metricSub}>
                Connect OnePlus to MacBook Air running on port 3335.
              </Text>

              <TextInput
                style={[styles.textInput, { marginTop: 12 }]}
                value={hostIp}
                onChangeText={setHostIp}
                placeholder="e.g. 192.168.1.100"
                placeholderTextColor="#756252"
              />

              <TouchableOpacity 
                style={[styles.primaryAddBtn, { marginTop: 12, width: '100%', alignItems: 'center' }]}
                onPress={testConnection}
              >
                <Text style={styles.primaryAddBtnText}>
                  {syncing ? 'Connecting...' : 'Test Connection to Port 3335'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        {[
          { key: 'task', label: 'Tasks', icon: '✓' },
          { key: 'academic', label: 'Academic', icon: '🎓' },
          { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
          { key: 'dsa', label: 'DSA', icon: '⌨' },
          { key: 'journal', label: 'Journal', icon: '✎' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => setActiveTab(item.key)}
            style={styles.navItem}
          >
            <Text style={[styles.navIcon, activeTab === item.key && styles.navIconActive]}>
              {item.icon}
            </Text>
            <Text style={[styles.navLabel, activeTab === item.key && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EED8B8',
  },
  // Top App Bar
  topAppBar: {
    backgroundColor: 'rgba(238, 216, 184, 0.95)',
    borderBottomWidth: 1,
    borderColor: '#DEC8A5',
    paddingHorizontal: 16,
    paddingTop: STATUSBAR_HEIGHT + 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mascotRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(217, 83, 30, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(217, 83, 30, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotText: {
    color: '#D9531E',
    fontWeight: 'bold',
    fontSize: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    color: '#2A1D15',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  vBadge: {
    backgroundColor: 'rgba(217, 83, 30, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(217, 83, 30, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  vBadgeText: {
    color: '#D9531E',
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotGreen: {
    backgroundColor: '#3E6A5E',
  },
  dotAmber: {
    backgroundColor: '#D9531E',
  },
  statusLabel: {
    color: '#756252',
    fontSize: 11,
  },
  activeBadge: {
    backgroundColor: '#FFFBF7',
    borderWidth: 1,
    borderColor: '#DEC8A5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  activeBadgeText: {
    color: '#D9531E',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // Scroll Body
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
  },
  viewSection: {
    gap: 12,
  },

  // Command Banner & 4-Pill Selector
  commandBanner: {
    backgroundColor: '#FFFBF7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DEC8A5',
    gap: 12,
  },
  noticeBanner: {
    backgroundColor: 'rgba(217, 83, 30, 0.08)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 83, 30, 0.25)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeTag: {
    backgroundColor: '#D9531E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noticeTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  noticeText: {
    flex: 1,
    color: '#2A1D15',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A1D15',
  },
  bannerSub: {
    fontSize: 11,
    color: '#756252',
  },
  pillSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5E6D3',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#DEC8A5',
  },
  pillButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  pillButtonActive: {
    backgroundColor: '#D9531E',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2A1D15',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  pillCountBadge: {
    backgroundColor: '#E8D3B9',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  pillCountBadgeActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  pillCountText: {
    fontSize: 9,
    color: '#2A1D15',
    fontWeight: 'bold',
  },
  pillCountTextActive: {
    color: '#FFFFFF',
  },

  // Subviews & Grids
  subviewContainer: {
    gap: 12,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  cardBox: {
    flex: 1,
    backgroundColor: '#FFFBF7',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DEC8A5',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#756252',
    textTransform: 'uppercase',
  },
  metricValueLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2A1D15',
    marginVertical: 2,
  },
  metricHighlight: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D9531E',
  },
  metricSub: {
    fontSize: 10,
    color: '#756252',
    marginTop: 2,
  },

  // Input Form
  addInputRow: {
    backgroundColor: '#FFFBF7',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: '#DEC8A5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#2A1D15',
  },
  primaryAddBtn: {
    backgroundColor: '#D9531E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryAddBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Timeline Schedule
  timelineCard: {
    backgroundColor: '#FFFBF7',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DEC8A5',
    gap: 10,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#DEC8A5',
    paddingBottom: 8,
  },
  timelineHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2A1D15',
  },
  timelineDate: {
    fontSize: 10,
    color: '#756252',
  },
  timelineList: {
    gap: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D9531E',
    backgroundColor: '#FFFBF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  checkCircleDone: {
    backgroundColor: '#E3EFEA',
    borderColor: '#3E6A5E',
  },
  checkMark: {
    color: 'transparent',
    fontSize: 12,
  },
  checkMarkDone: {
    color: '#3E6A5E',
    fontWeight: 'bold',
  },
  timelineContentBox: {
    flex: 1,
    backgroundColor: 'rgba(245, 230, 211, 0.7)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DEC8A5',
    gap: 3,
  },
  contentBoxDone: {
    opacity: 0.7,
  },
  timelineTime: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#756252',
  },
  timelineTaskTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2A1D15',
  },
  taskTitleStrike: {
    textDecorationLine: 'line-through',
  },
  timelineTaskDesc: {
    fontSize: 10,
    color: '#756252',
  },

  // Tags
  tagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#FDECE5',
  },
  tagChipText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#D9531E',
  },
  tagUrgent: {
    backgroundColor: '#FDECE5',
  },
  tagUrgentText: {
    color: '#B22915',
    fontSize: 9,
    fontWeight: 'bold',
  },
  tagDone: {
    backgroundColor: '#E3EFEA',
  },
  tagDoneText: {
    color: '#3E6A5E',
    fontSize: 9,
    fontWeight: 'bold',
  },
  tagAlgo: {
    backgroundColor: '#E8D3B9',
  },
  tagAlgoText: {
    color: '#2A1D15',
    fontSize: 9,
  },

  // Progress Bars
  progressBarBg: {
    height: 6,
    backgroundColor: '#E8D3B9',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D9531E',
  },

  // Track & Course Cards
  trackTag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#D9531E',
  },
  trackTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2A1D15',
    marginTop: 2,
  },
  trackDeadline: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D9531E',
    marginTop: 4,
  },

  // Section Headers
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2A1D15',
  },
  horizonEventBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: 'rgba(245, 230, 211, 0.7)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEC8A5',
    gap: 3,
  },
  eventCount: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#D9531E',
  },
  eventTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2A1D15',
  },
  eventStatusCrit: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#B22915',
  },

  // Tag Filters
  tagFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  tagFilterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F5E6D3',
  },
  tagFilterBtnActive: {
    backgroundColor: '#D9531E',
  },
  tagFilterBtnText: {
    fontSize: 10,
    color: '#2A1D15',
    fontWeight: 'bold',
  },
  tagFilterBtnTextActive: {
    color: '#FFFFFF',
  },
  customTaskItem: {
    backgroundColor: '#FFFBF7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DEC8A5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customTaskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2A1D15',
  },
  priorityBadge: {
    backgroundColor: '#FDECE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#D9531E',
  },

  // Academic Portal
  gpaPill: {
    backgroundColor: '#E3EFEA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(62, 106, 94, 0.2)',
  },
  gpaPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3E6A5E',
  },
  lectureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#DEC8A5',
  },
  lectureTimeBadge: {
    backgroundColor: '#FDECE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lectureTimeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#D9531E',
  },
  lectureName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2A1D15',
  },
  courseCodeBadge: {
    backgroundColor: '#D9531E',
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creditText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3E6A5E',
  },

  // DSA Arena
  diffBox: {
    flex: 1,
    backgroundColor: '#F5E6D3',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  diffNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  diffLabel: {
    fontSize: 9,
    color: '#756252',
    marginTop: 2,
  },

  // Bottom Navigation Bar
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(238, 216, 184, 0.98)',
    borderTopWidth: 1,
    borderColor: '#DEC8A5',
    flexDirection: 'row',
    paddingVertical: 6,
    paddingBottom: 12,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 16,
    color: '#756252',
  },
  navIconActive: {
    color: '#D9531E',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#756252',
    marginTop: 2,
  },
  navLabelActive: {
    color: '#D9531E',
    fontWeight: 'bold',
  },
});
