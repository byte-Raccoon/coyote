import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';
import { getIsoDate } from '../storage/storage';

export default function DashboardView({ 
  tasks, 
  academics, 
  dsaState, 
  ideas, 
  onNavigate 
}) {
  const todayStr = getIsoDate();

  // 1. Task metrics
  const dailyTasks = tasks.filter(t => t.category === 'daily');
  const dailyCompleted = dailyTasks.filter(t => t.is_completed).length;
  const dailyTotal = dailyTasks.length;
  const dailyPercent = dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 0;
  const nextTask = dailyTasks.find(t => !t.is_completed) || tasks.find(t => !t.is_completed);

  // 2. DSA metrics
  const dailyLogs = dsaState.dailyLogs || {};
  const todayDsa = dailyLogs[todayStr] || 0;
  const totalDsa = Object.values(dailyLogs).reduce((sum, c) => sum + c, 0);

  // 3. Academic metrics
  const courses = academics.filter(a => a.type === 'course');
  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const nextExam = academics.find(a => a.type === 'exam');

  return (
    <View style={styles.container}>
      {/* 2x2 Command Grid */}
      <View style={styles.gridRow}>
        {/* Daily Tasks */}
        <TouchableOpacity style={styles.cardBox} onPress={() => onNavigate('task')}>
          <Text style={styles.metricLabel}>Daily Tasks</Text>
          <View style={styles.numberRow}>
            <Text style={styles.metricLarge}>{dailyCompleted}</Text>
            <Text style={styles.metricTotal}>/{dailyTotal}</Text>
          </View>
          <Text style={styles.metricHighlight}>
            {dailyTotal > 0 ? `${dailyPercent}% Complete` : 'No daily tasks'}
          </Text>
        </TouchableOpacity>

        {/* DSA Solved */}
        <TouchableOpacity style={styles.cardBox} onPress={() => onNavigate('dsa')}>
          <Text style={styles.metricLabel}>DSA Velocity</Text>
          <View style={styles.numberRow}>
            <Text style={[styles.metricLarge, { color: colors.sage }]}>{totalDsa}</Text>
          </View>
          <Text style={[styles.metricHighlight, { color: colors.sage }]}>
            +{todayDsa} today
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridRow}>
        {/* Project Ideas */}
        <TouchableOpacity style={styles.cardBox} onPress={() => onNavigate('ideas')}>
          <Text style={styles.metricLabel}>Project Ideas</Text>
          <View style={styles.numberRow}>
            <Text style={[styles.metricLarge, { color: colors.primary }]}>{ideas.length}</Text>
          </View>
          <Text style={styles.metricSub}>Vault concepts logged</Text>
        </TouchableOpacity>

        {/* Academics */}
        <TouchableOpacity style={styles.cardBox} onPress={() => onNavigate('academic')}>
          <Text style={styles.metricLabel}>Academics</Text>
          <View style={styles.numberRow}>
            <Text style={[styles.metricLarge, { color: colors.terracotta }]}>{totalCredits}</Text>
            <Text style={styles.metricTotal}>Credits</Text>
          </View>
          <Text style={[styles.metricHighlight, { color: colors.terracotta }]}>
            {nextExam ? `Exam: ${nextExam.examDate}` : `${courses.length} Courses`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Next Tactical Objective */}
      <View style={styles.objectiveCard}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.objectiveTag}>NEXT TACTICAL OBJECTIVE</Text>
          <Text style={styles.objectiveTitle}>
            {nextTask ? nextTask.title : 'All tactical priorities resolved!'}
          </Text>
          {nextTask && nextTask.date ? (
            <Text style={styles.objectiveSub}>Date: {nextTask.date}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onNavigate('task')}>
          <Text style={styles.actionBtnText}>Open</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardBox: {
    flex: 1,
    backgroundColor: colors.cardSurface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.desertBorder,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.desertMuted,
    textTransform: 'uppercase',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginVertical: 4,
  },
  metricLarge: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  metricTotal: {
    fontSize: 12,
    color: colors.desertMuted,
    fontWeight: 'bold',
  },
  metricHighlight: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
  },
  metricSub: {
    fontSize: 10,
    color: colors.desertMuted,
  },
  objectiveCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  objectiveTag: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  objectiveTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.desertDark,
    marginTop: 2,
  },
  objectiveSub: {
    fontSize: 10,
    color: colors.desertMuted,
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
