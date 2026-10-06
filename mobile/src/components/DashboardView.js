import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';
import { getIsoDate } from '../storage/storage';
import LucideIcon from './LucideIcon';

export default function DashboardView({ 
  tasks, 
  dsaState, 
  ideas, 
  onNavigate 
}) {
  const todayStr = getIsoDate();

  // 1. Task metrics
  const activeTasks = tasks.filter(t => !t.is_completed);
  const archivedTasks = tasks.filter(t => t.is_completed);
  const dailyTasks = tasks.filter(t => t.category === 'daily');
  const dailyActive = dailyTasks.filter(t => !t.is_completed).length;
  const dailyCompleted = dailyTasks.filter(t => t.is_completed).length;
  const dailyTotal = dailyTasks.length;
  const nextTask = dailyTasks.find(t => !t.is_completed) || activeTasks[0];

  // 2. DSA metrics
  const dailyLogs = dsaState.dailyLogs || {};
  const todayDsa = dailyLogs[todayStr] || 0;
  const weeklyTarget = dsaState.weeklyTarget || 15;
  const totalDsa = Object.values(dailyLogs).reduce((sum, c) => sum + c, 0);

  // Calculate 7-day velocity
  let weeklySolved = 0;
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    weeklySolved += (dailyLogs[getIsoDate(d)] || 0);
  }

  // 3. Ideas metrics
  const shippedIdeas = ideas.filter(i => i.status === 'Shipped').length;
  const protoIdeas = ideas.filter(i => i.status === 'Prototyping').length;

  return (
    <View style={styles.container}>
      {/* 2x2 Tactical Command Grid */}
      <View style={styles.gridRow}>
        {/* Daily Tasks */}
        <TouchableOpacity style={styles.cardBox} onPress={() => onNavigate('task')}>
          <View style={styles.cardHeader}>
            <Text style={styles.metricLabel}>Daily Tasks</Text>
            <LucideIcon name="task" size={14} color={colors.primary} />
          </View>
          <View style={styles.numberRow}>
            <Text style={styles.metricLarge}>{dailyActive}</Text>
            <Text style={styles.metricTotal}>pending</Text>
          </View>
          <Text style={styles.metricHighlight}>
            {dailyCompleted} moved to archive
          </Text>
        </TouchableOpacity>

        {/* DSA Velocity */}
        <TouchableOpacity style={styles.cardBox} onPress={() => onNavigate('dsa')}>
          <View style={styles.cardHeader}>
            <Text style={styles.metricLabel}>DSA Sprint</Text>
            <LucideIcon name="dsa" size={14} color={colors.sage} />
          </View>
          <View style={styles.numberRow}>
            <Text style={[styles.metricLarge, { color: colors.sage }]}>{weeklySolved}</Text>
            <Text style={styles.metricTotal}>/{weeklyTarget}</Text>
          </View>
          <Text style={[styles.metricHighlight, { color: colors.sage }]}>
            +{todayDsa} today • {totalDsa} all-time
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridRow}>
        {/* Project Ideas */}
        <TouchableOpacity style={styles.cardBox} onPress={() => onNavigate('ideas')}>
          <View style={styles.cardHeader}>
            <Text style={styles.metricLabel}>Project Vault</Text>
            <LucideIcon name="ideas" size={14} color={colors.primary} />
          </View>
          <View style={styles.numberRow}>
            <Text style={[styles.metricLarge, { color: colors.desertDark }]}>{ideas.length}</Text>
            <Text style={styles.metricTotal}>concepts</Text>
          </View>
          <Text style={styles.metricSub}>
            {protoIdeas} in build • {shippedIdeas} shipped
          </Text>
        </TouchableOpacity>

        {/* Archive Summary */}
        <TouchableOpacity style={styles.cardBox} onPress={() => onNavigate('task')}>
          <View style={styles.cardHeader}>
            <Text style={styles.metricLabel}>Task Archive</Text>
            <LucideIcon name="archive" size={14} color={colors.terracotta} />
          </View>
          <View style={styles.numberRow}>
            <Text style={[styles.metricLarge, { color: colors.terracotta }]}>{archivedTasks.length}</Text>
            <Text style={styles.metricTotal}>resolved</Text>
          </View>
          <Text style={[styles.metricHighlight, { color: colors.terracotta }]}>
            {tasks.length > 0 ? `${Math.round((archivedTasks.length / tasks.length) * 100)}% resolved` : 'Zero backlog'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Next Tactical Objective */}
      <View style={styles.objectiveCard}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <View style={styles.objectiveTagRow}>
            <LucideIcon name="task" size={12} color={colors.primary} />
            <Text style={styles.objectiveTag}>NEXT TACTICAL OBJECTIVE</Text>
          </View>
          <Text style={styles.objectiveTitle}>
            {nextTask ? nextTask.title : 'All tactical priorities resolved! Backlog is clear.'}
          </Text>
          {nextTask && (
            <Text style={styles.objectiveSub}>
              {nextTask.category.toUpperCase()} • Priority: {nextTask.priority || 'Normal'}
            </Text>
          )}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  metricTotal: {
    fontSize: 11,
    color: colors.desertMuted,
    fontWeight: 'bold',
  },
  metricHighlight: {
    fontSize: 10.5,
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
  objectiveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    marginTop: 4,
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
