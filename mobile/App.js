import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { colors, spacing, typography } from './src/theme/tokens';
import { storage } from './src/storage/storage';

// Domain Components
import TaskCommand from './src/components/TaskCommand';
import AcademicPortal from './src/components/AcademicPortal';
import DashboardView from './src/components/DashboardView';
import DsaArena from './src/components/DsaArena';
import ProjectIdeas from './src/components/ProjectIdeas';
import SyncView from './src/components/SyncView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 40) : 0;

const SECTIONS = [
  { key: 'task', label: 'Tasks', badge: 'Task Command', icon: '✓' },
  { key: 'academic', label: 'Academic', badge: 'Academic Portal', icon: '🎓' },
  { key: 'dashboard', label: 'Dashboard', badge: 'Command Grid', icon: '⊞' },
  { key: 'dsa', label: 'DSA', badge: 'DSA Arena', icon: '⌨' },
  { key: 'ideas', label: 'Ideas', badge: 'Project Vault', icon: '💡' },
];

export default function App() {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSyncViewOpen, setIsSyncViewOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Persistent State
  const [tasks, setTasks] = useState([]);
  const [academics, setAcademics] = useState([]);
  const [dsaState, setDsaState] = useState({ weeklyTarget: 15, dailyLogs: {}, questions: [] });
  const [ideas, setIdeas] = useState([]);
  const [settings, setSettings] = useState({ hostIp: '192.168.1.100', port: 3335, deviceId: 'oneplus-phone' });

  // 1. Initial Load from Persistent Storage
  useEffect(() => {
    async function init() {
      const data = await storage.loadAllData();
      setTasks(data.tasks);
      setAcademics(data.academics);
      setDsaState(data.dsa);
      setIdeas(data.ideas);
      setSettings(data.settings);
      setLoading(false);
    }
    init();
  }, []);

  // 2. State Mutation & Auto-Save Handlers
  const handleSaveTasks = (newTasks) => {
    setTasks(newTasks);
    storage.saveTasks(newTasks);
  };

  const handleSaveAcademics = (newAcademics) => {
    setAcademics(newAcademics);
    storage.saveAcademics(newAcademics);
  };

  const handleSaveDsa = (newDsaState) => {
    setDsaState(newDsaState);
    storage.saveDsa(newDsaState);
  };

  const handleSaveIdeas = (newIdeas) => {
    setIdeas(newIdeas);
    storage.saveIdeas(newIdeas);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // 3. Navigation Controls
  const handleTabPress = (index) => {
    setIsSyncViewOpen(false);
    setActiveIndex(index);
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
  };

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    if (page >= 0 && page < SECTIONS.length && page !== activeIndex) {
      setActiveIndex(page);
    }
  };

  const navigateToSection = (sectionKey) => {
    setIsSyncViewOpen(false);
    const idx = SECTIONS.findIndex(s => s.key === sectionKey);
    if (idx !== -1) {
      handleTabPress(idx);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Coyote Workspace...</Text>
      </View>
    );
  }

  const activeSection = SECTIONS[activeIndex] || SECTIONS[0];

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
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>Swipe Enabled • Swipe ← →</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.activeBadge} 
          onPress={() => setIsSyncViewOpen(!isSyncViewOpen)}
        >
          <Text style={styles.activeBadgeText}>
            {isSyncViewOpen ? '✕ Close Sync' : activeSection.badge}
          </Text>
        </TouchableOpacity>
      </View>

      {/* BODY: SYNC OVERLAY OR HORIZONTAL SWIPE PAGER */}
      {isSyncViewOpen ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <SyncView
            settings={settings}
            onSaveSettings={handleSaveSettings}
            tasks={tasks}
            ideas={ideas}
            onSyncComplete={(remote) => {
              if (remote?.tasks) handleSaveTasks(remote.tasks);
              if (remote?.notes) handleSaveIdeas(remote.notes);
            }}
          />
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          style={styles.pager}
        >
          {/* PAGE 0: TASKS */}
          <View style={[styles.pageWrapper, { width: SCREEN_WIDTH }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <TaskCommand tasks={tasks} onSaveTasks={handleSaveTasks} />
            </ScrollView>
          </View>

          {/* PAGE 1: ACADEMICS */}
          <View style={[styles.pageWrapper, { width: SCREEN_WIDTH }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <AcademicPortal academics={academics} onSaveAcademics={handleSaveAcademics} />
            </ScrollView>
          </View>

          {/* PAGE 2: DASHBOARD */}
          <View style={[styles.pageWrapper, { width: SCREEN_WIDTH }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <DashboardView
                tasks={tasks}
                academics={academics}
                dsaState={dsaState}
                ideas={ideas}
                onNavigate={navigateToSection}
              />
            </ScrollView>
          </View>

          {/* PAGE 3: DSA */}
          <View style={[styles.pageWrapper, { width: SCREEN_WIDTH }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <DsaArena dsaState={dsaState} onSaveDsa={handleSaveDsa} />
            </ScrollView>
          </View>

          {/* PAGE 4: PROJECT IDEAS (REPLACED JOURNAL) */}
          <View style={[styles.pageWrapper, { width: SCREEN_WIDTH }]}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <ProjectIdeas ideas={ideas} onSaveIdeas={handleSaveIdeas} />
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <View style={styles.bottomNav}>
        {SECTIONS.map((item, idx) => {
          const isActive = !isSyncViewOpen && activeIndex === idx;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => handleTabPress(idx)}
              style={styles.navItem}
            >
              <Text style={[styles.navIcon, isActive && styles.navIconActive]}>
                {item.icon}
              </Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sandBg,
  },
  loadingCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: typography.sm,
    color: colors.desertMuted,
    fontWeight: 'bold',
  },
  topAppBar: {
    backgroundColor: 'rgba(238, 216, 184, 0.96)',
    borderBottomWidth: 1,
    borderColor: colors.desertBorder,
    paddingHorizontal: spacing.lg,
    paddingTop: STATUSBAR_HEIGHT + 14,
    paddingBottom: 10,
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
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    color: colors.desertDark,
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
    color: colors.primary,
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
    backgroundColor: colors.sage,
  },
  statusLabel: {
    color: colors.desertMuted,
    fontSize: 10,
  },
  activeBadge: {
    backgroundColor: colors.cardSurface,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  activeBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  // Swipe Pager & Pages
  pager: {
    flex: 1,
  },
  pageWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 90,
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(238, 216, 184, 0.98)',
    borderTopWidth: 1,
    borderColor: colors.desertBorder,
    flexDirection: 'row',
    paddingVertical: 6,
    paddingBottom: 14,
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
    color: colors.desertMuted,
  },
  navIconActive: {
    color: colors.primary,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.desertMuted,
    marginTop: 2,
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
