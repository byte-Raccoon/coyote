import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';
import { generateId, getIsoDate } from '../storage/storage';

export default function DsaArena({ dsaState, onSaveDsa }) {
  const todayStr = getIsoDate();

  // dsaState shape: { weeklyTarget: 15, dailyLogs: { '2026-10-07': 3 }, questions: [...] }
  const weeklyTarget = dsaState.weeklyTarget || 15;
  const dailyLogs = dsaState.dailyLogs || {};
  const questions = dsaState.questions || [];

  // Modals
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [newTargetInput, setNewTargetInput] = useState(weeklyTarget.toString());

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [probTitle, setProbTitle] = useState('');
  const [probDiff, setProbDiff] = useState('Medium');

  const [selectedDay, setSelectedDay] = useState(todayStr);

  // 1. Calculate Questions Done Today
  const todayCount = dailyLogs[todayStr] || 0;

  // 2. Calculate Questions Done This Week (last 7 days)
  const getWeeklySolved = () => {
    let sum = 0;
    const now = new Date();
    // Monday-based or rolling 7-days
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = getIsoDate(d);
      sum += (dailyLogs[key] || 0);
    }
    return sum;
  };
  const weeklySolved = getWeeklySolved();
  const weeklyPercent = weeklyTarget > 0 ? Math.min(100, Math.round((weeklySolved / weeklyTarget) * 100)) : 0;

  // 3. Handlers
  const handleQuickAddToday = (delta = 1) => {
    const nextCount = Math.max(0, todayCount + delta);
    const nextLogs = { ...dailyLogs, [todayStr]: nextCount };
    onSaveDsa({
      ...dsaState,
      dailyLogs: nextLogs
    });
  };

  const handleSaveTarget = () => {
    const parsed = parseInt(newTargetInput, 10);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid', 'Please enter a positive weekly target number.');
      return;
    }
    onSaveDsa({
      ...dsaState,
      weeklyTarget: parsed
    });
    setIsTargetModalOpen(false);
  };

  const handleLogDetailedProblem = () => {
    if (!probTitle.trim()) {
      Alert.alert('Required', 'Please enter a problem name or number (e.g. #42 Trapping Rain Water).');
      return;
    }

    const newProb = {
      id: generateId(),
      title: probTitle.trim(),
      difficulty: probDiff,
      date: todayStr,
      created_at: new Date().toISOString()
    };

    const nextCount = todayCount + 1;
    const nextLogs = { ...dailyLogs, [todayStr]: nextCount };
    const nextQuestions = [newProb, ...questions];

    onSaveDsa({
      ...dsaState,
      dailyLogs: nextLogs,
      questions: nextQuestions
    });

    setProbTitle('');
    setIsLogModalOpen(false);
  };

  const handleDeleteProblem = (id, probDate) => {
    const filtered = questions.filter(q => q.id !== id);
    const dateCount = Math.max(0, (dailyLogs[probDate] || 1) - 1);
    const nextLogs = { ...dailyLogs, [probDate]: dateCount };

    onSaveDsa({
      ...dsaState,
      dailyLogs: nextLogs,
      questions: filtered
    });
  };

  // 4. Monthly Activity Heatmap Generator ("The Grind")
  const renderMonthlyGrind = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = now.toLocaleString('default', { month: 'short' });

    const dayCells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const isoKey = getIsoDate(dayDate);
      const count = dailyLogs[isoKey] || 0;
      const isSelected = selectedDay === isoKey;

      let cellBg = colors.cardSurfaceAlt;
      let textColor = colors.desertDark;
      if (count >= 5) {
        cellBg = colors.primary;
        textColor = '#FFF';
      } else if (count >= 3) {
        cellBg = colors.sage;
        textColor = '#FFF';
      } else if (count >= 1) {
        cellBg = colors.sageLight;
        textColor = colors.sage;
      }

      dayCells.push(
        <TouchableOpacity
          key={isoKey}
          onPress={() => setSelectedDay(isoKey)}
          style={[
            styles.grindCell,
            { backgroundColor: cellBg },
            isSelected && styles.grindCellSelected
          ]}
        >
          <Text style={[styles.grindCellText, { color: textColor }]}>{day}</Text>
          {count > 0 && (
            <View style={[styles.grindCountDot, { backgroundColor: textColor }]} />
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.grindCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.grindTitle}>The Grind — {monthName} Heatmap</Text>
          <Text style={styles.grindLegendText}>
            Selected: {selectedDay === todayStr ? 'Today' : selectedDay} ({dailyLogs[selectedDay] || 0} solved)
          </Text>
        </View>

        {/* Calendar Grid */}
        <View style={styles.grindGrid}>
          {dayCells}
        </View>

        {/* Color Legend */}
        <View style={styles.legendRow}>
          <Text style={styles.legendLabel}>Less</Text>
          <View style={[styles.legendBox, { backgroundColor: colors.cardSurfaceAlt }]} />
          <View style={[styles.legendBox, { backgroundColor: colors.sageLight }]} />
          <View style={[styles.legendBox, { backgroundColor: colors.sage }]} />
          <View style={[styles.legendBox, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendLabel}>More</Text>
        </View>
      </View>
    );
  };

  const selectedDayQuestions = questions.filter(q => q.date === selectedDay);

  return (
    <View style={styles.container}>
      {/* 1. WEEKLY TARGET SECTION */}
      <View style={styles.bannerCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.bannerTag}>FEATURE 1: WEEKLY TARGET</Text>
            <Text style={styles.bannerTitle}>{weeklySolved} / {weeklyTarget} Solved</Text>
          </View>
          <TouchableOpacity 
            style={styles.editTargetBtn}
            onPress={() => { setNewTargetInput(weeklyTarget.toString()); setIsTargetModalOpen(true); }}
          >
            <Text style={styles.editTargetBtnText}>Set Target</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${weeklyPercent}%` }]} />
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.bannerSub}>{weeklyPercent}% of Sprint Target</Text>
          <Text style={styles.bannerSub}>
            {Math.max(0, weeklyTarget - weeklySolved)} questions remaining
          </Text>
        </View>
      </View>

      {/* 2. QUESTIONS DONE TODAY SECTION */}
      <View style={styles.todayCard}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.bannerTag}>FEATURE 2: QUESTIONS DONE TODAY</Text>
            <Text style={styles.todayBigNumber}>{todayCount}</Text>
            <Text style={styles.bannerSub}>Logged for today ({todayStr})</Text>
          </View>

          {/* Quick Counter Controls */}
          <View style={styles.counterControlBox}>
            <View style={styles.quickCounterRow}>
              <TouchableOpacity 
                style={styles.counterBtn} 
                onPress={() => handleQuickAddToday(-1)}
              >
                <Text style={styles.counterBtnText}>-1</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.counterBtn, styles.counterBtnPlus]} 
                onPress={() => handleQuickAddToday(+1)}
              >
                <Text style={[styles.counterBtnText, { color: '#FFF' }]}>+1</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.logDetailBtn} 
              onPress={() => setIsLogModalOpen(true)}
            >
              <Text style={styles.logDetailBtnText}>+ Log Problem</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 3. MONTHLY ACTIVITY GRID ("THE GRIND") */}
      {renderMonthlyGrind()}

      {/* Detailed Solved Problems for Selected Date */}
      <View style={styles.problemsContainer}>
        <Text style={styles.sectionHeading}>
          Problems Solved on {selectedDay === todayStr ? 'Today' : selectedDay}
        </Text>

        {selectedDayQuestions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No specific problem names logged for this date.
            </Text>
          </View>
        ) : (
          selectedDayQuestions.map((q) => (
            <View key={q.id} style={styles.problemItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.problemTitle}>{q.title}</Text>
                <Text style={styles.problemMeta}>{q.date}</Text>
              </View>
              <View style={[
                styles.diffBadge,
                q.difficulty === 'Easy' ? styles.diffEasy : q.difficulty === 'Hard' ? styles.diffHard : styles.diffMedium
              ]}>
                <Text style={[
                  styles.diffBadgeText,
                  q.difficulty === 'Easy' ? styles.diffEasyText : q.difficulty === 'Hard' ? styles.diffHardText : styles.diffMediumText
                ]}>{q.difficulty}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteProblem(q.id, q.date)}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Modal: Set Weekly Target */}
      <Modal visible={isTargetModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Set Weekly Target</Text>
            <Text style={styles.modalSub}>
              How many algorithmic questions do you target per week?
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="number-pad"
              value={newTargetInput}
              onChangeText={setNewTargetInput}
              placeholder="e.g. 15"
              placeholderTextColor={colors.desertMuted}
            />
            <View style={styles.modalActionsRow}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setIsTargetModalOpen(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveBtn} 
                onPress={handleSaveTarget}
              >
                <Text style={styles.modalSaveBtnText}>Save Target</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Log Problem Details */}
      <Modal visible={isLogModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Log Solved Problem</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Problem # or Title (e.g. #210 Course Schedule)..."
              placeholderTextColor={colors.desertMuted}
              value={probTitle}
              onChangeText={setProbTitle}
            />

            <View style={styles.diffSelectorRow}>
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => setProbDiff(diff)}
                  style={[styles.diffPill, probDiff === diff && styles.diffPillActive]}
                >
                  <Text style={[styles.diffPillText, probDiff === diff && styles.diffPillTextActive]}>
                    {diff}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setIsLogModalOpen(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveBtn} 
                onPress={handleLogDetailedProblem}
              >
                <Text style={styles.modalSaveBtnText}>Log Problem</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: 8,
  },
  bannerTag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.desertDark,
    marginTop: 2,
  },
  bannerSub: {
    fontSize: 10,
    color: colors.desertMuted,
  },
  editTargetBtn: {
    backgroundColor: colors.cardSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editTargetBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.cardSurfaceLow,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  // Today Card
  todayCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.desertBorder,
  },
  todayBigNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: 2,
  },
  counterControlBox: {
    gap: 6,
    alignItems: 'flex-end',
  },
  quickCounterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  counterBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.cardSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnPlus: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  counterBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  logDetailBtn: {
    backgroundColor: colors.sageLight,
    borderWidth: 1,
    borderColor: colors.sage,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logDetailBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.sage,
  },

  // Monthly Grind Card
  grindCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: 10,
  },
  grindTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  grindLegendText: {
    fontSize: 9,
    color: colors.desertMuted,
  },
  grindGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  grindCell: {
    width: 38,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(222, 200, 165, 0.4)',
  },
  grindCellSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  grindCellText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  grindCountDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginTop: 1,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  legendLabel: {
    fontSize: 9,
    color: colors.desertMuted,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },

  // Problem List
  problemsContainer: {
    gap: spacing.sm,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  emptyCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    color: colors.desertMuted,
  },
  problemItem: {
    backgroundColor: colors.cardSurface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  problemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  problemMeta: {
    fontSize: 9,
    color: colors.desertMuted,
  },
  diffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffEasy: {
    backgroundColor: colors.doneGreenBg,
  },
  diffEasyText: {
    color: colors.doneGreen,
    fontSize: 9,
    fontWeight: 'bold',
  },
  diffMedium: {
    backgroundColor: colors.primaryLight,
  },
  diffMediumText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  diffHard: {
    backgroundColor: colors.urgentRedBg,
  },
  diffHardText: {
    color: colors.urgentRed,
    fontSize: 9,
    fontWeight: 'bold',
  },
  deleteBtnText: {
    fontSize: 14,
    color: colors.desertMuted,
    paddingHorizontal: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(42, 29, 21, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.cardSurface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  modalSub: {
    fontSize: typography.xs,
    color: colors.desertMuted,
  },
  modalInput: {
    backgroundColor: colors.sandBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.desertDark,
  },
  diffSelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  diffPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: colors.cardSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.desertBorder,
  },
  diffPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  diffPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  diffPillTextActive: {
    color: '#FFF',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.cardSurfaceAlt,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.desertMuted,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalSaveBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
