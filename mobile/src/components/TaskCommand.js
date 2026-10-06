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
import LucideIcon from './LucideIcon';

export default function TaskCommand({ tasks, onSaveTasks }) {
  const [category, setCategory] = useState('daily'); // daily, weekly, yearly, custom, archive
  const [filterTag, setFilterTag] = useState('all');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState(getIsoDate());
  const [taskPriority, setTaskPriority] = useState('Normal');

  const openAddModal = (cat = category === 'archive' ? 'daily' : category) => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('Normal');
    if (cat === 'daily') {
      setTaskDate(getIsoDate());
    } else if (cat === 'weekly') {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setTaskDate(getIsoDate(d));
    } else {
      setTaskDate(getIsoDate());
    }
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskDate(task.date || getIsoDate());
    setTaskPriority(task.priority || 'Normal');
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    const targetCategory = category === 'archive' ? 'daily' : category;

    if (editingTaskId) {
      // Update existing task
      const updated = tasks.map(t => {
        if (t.id === editingTaskId) {
          return {
            ...t,
            title: taskTitle.trim(),
            description: taskDesc.trim(),
            date: t.category === 'daily' ? getIsoDate() : taskDate,
            priority: taskPriority,
            version: (t.version || 1) + 1,
            updated_at: new Date().toISOString()
          };
        }
        return t;
      });
      onSaveTasks(updated);
    } else {
      // Add new task
      const newTask = {
        id: generateId(),
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        category: targetCategory,
        date: targetCategory === 'daily' ? getIsoDate() : taskDate,
        priority: taskPriority,
        is_completed: false,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      onSaveTasks([newTask, ...tasks]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteTask = (id) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to permanently delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const filtered = tasks.filter(t => t.id !== id);
            onSaveTasks(filtered);
          }
        }
      ]
    );
  };

  const handleClearArchive = () => {
    Alert.alert(
      'Clear Archive',
      'Are you sure you want to permanently delete all archived tasks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            const activeOnly = tasks.filter(t => !t.is_completed);
            onSaveTasks(activeOnly);
          }
        }
      ]
    );
  };

  // Complete task -> Moves directly to Archive
  const handleCompleteTask = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          is_completed: true,
          completed_at: new Date().toISOString(),
          version: (t.version || 1) + 1,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });
    onSaveTasks(updated);
  };

  // Restore task -> Moves from Archive back to active category
  const handleRestoreTask = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          is_completed: false,
          completed_at: null,
          version: (t.version || 1) + 1,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });
    onSaveTasks(updated);
  };

  // Task filtering logic:
  // Active categories ONLY display active tasks (!is_completed)
  // Archive tab ONLY displays completed tasks (is_completed)
  let displayedTasks = [];
  if (category === 'archive') {
    displayedTasks = tasks.filter(t => t.is_completed);
  } else {
    displayedTasks = tasks.filter(t => t.category === category && !t.is_completed);
    if (category === 'custom' && filterTag !== 'all') {
      displayedTasks = displayedTasks.filter(t => (t.priority || '').toLowerCase() === filterTag.toLowerCase());
    }
  }

  // Live Metrics
  const activeTasksCount = tasks.filter(t => !t.is_completed).length;
  const archivedTasksCount = tasks.filter(t => t.is_completed).length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((archivedTasksCount / totalTasksCount) * 100) : 0;
  const urgentPending = tasks.filter(t => !t.is_completed && t.priority === 'Urgent').length;

  return (
    <View style={styles.container}>
      {/* Category Pill Selector (Daily, Weekly, Yearly, Custom, Archive) */}
      <View style={styles.commandBanner}>
        <View style={styles.bannerHeader}>
          <View style={styles.headerTitleRow}>
            <LucideIcon name="task" size={18} color={colors.primary} />
            <Text style={styles.bannerTitle}>Task Command</Text>
          </View>
          <Text style={styles.bannerSub}>{activeTasksCount} Active • {archivedTasksCount} In Archive</Text>
        </View>

        <View style={styles.pillSelector}>
          {[
            { key: 'daily', label: 'Daily', count: tasks.filter(t => t.category === 'daily' && !t.is_completed).length },
            { key: 'weekly', label: 'Weekly', count: tasks.filter(t => t.category === 'weekly' && !t.is_completed).length },
            { key: 'yearly', label: 'Yearly', count: tasks.filter(t => t.category === 'yearly' && !t.is_completed).length },
            { key: 'custom', label: 'Custom', count: tasks.filter(t => t.category === 'custom' && !t.is_completed).length },
            { key: 'archive', label: 'Archive', count: archivedTasksCount, isArchive: true },
          ].map((pill) => {
            const isActive = category === pill.key;
            return (
              <TouchableOpacity
                key={pill.key}
                onPress={() => setCategory(pill.key)}
                style={[
                  styles.pillBtn, 
                  isActive && (pill.isArchive ? styles.pillBtnArchiveActive : styles.pillBtnActive)
                ]}
              >
                {pill.isArchive ? (
                  <LucideIcon 
                    name="archive" 
                    size={11} 
                    color={isActive ? '#FFF' : colors.desertDark} 
                    style={{ marginRight: 2 }}
                  />
                ) : null}
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {pill.label}
                </Text>
                {pill.count > 0 && (
                  <View style={[styles.pillBadge, isActive && styles.pillBadgeActive]}>
                    <Text style={[styles.pillBadgeText, isActive && styles.pillBadgeTextActive]}>
                      {pill.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Metrics Summary Cards */}
      <View style={styles.gridTwo}>
        <View style={styles.cardBox}>
          <Text style={styles.metricLabel}>Archive Resolution</Text>
          <Text style={styles.metricLarge}>{archivedTasksCount}/{totalTasksCount}</Text>
          <Text style={styles.metricHighlight}>{completionRate}% Moved to Archive</Text>
        </View>
        <View style={styles.cardBox}>
          <View style={styles.rowBetween}>
            <Text style={styles.metricLabel}>Urgent Priorities</Text>
            {urgentPending > 0 && <View style={styles.dotUrgent} />}
          </View>
          <Text style={[styles.metricLarge, { color: urgentPending > 0 ? colors.urgentRed : colors.sage }]}>
            {urgentPending} Urgent
          </Text>
          <Text style={styles.metricSub}>Active attention required</Text>
        </View>
      </View>

      {/* Custom Tag Filter Row */}
      {category === 'custom' && (
        <View style={styles.tagFilterRow}>
          {['all', 'urgent', 'p1', 'p2', 'normal'].map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => setFilterTag(tag)}
              style={[styles.tagFilterBtn, filterTag === tag && styles.tagFilterBtnActive]}
            >
              <Text style={[styles.tagFilterBtnText, filterTag === tag && styles.tagFilterBtnTextActive]}>
                #{tag.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Add Task Trigger Button or Clear Archive Trigger */}
      {category === 'archive' ? (
        archivedTasksCount > 0 && (
          <TouchableOpacity style={styles.clearArchiveBtn} onPress={handleClearArchive}>
            <LucideIcon name="trash" size={14} color={colors.urgentRed} />
            <Text style={styles.clearArchiveBtnText}>Clear Archive ({archivedTasksCount} tasks)</Text>
          </TouchableOpacity>
        )
      ) : (
        <TouchableOpacity style={styles.addTriggerBtn} onPress={() => openAddModal()}>
          <LucideIcon name="plus" size={14} color="#FFF" />
          <Text style={styles.addTriggerBtnText}>+ Add {category.toUpperCase()} Task</Text>
        </TouchableOpacity>
      )}

      {/* Task Items List */}
      <View style={styles.taskListContainer}>
        {displayedTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            {category === 'archive' ? (
              <>
                <LucideIcon name="archive" size={28} color={colors.desertMuted} />
                <Text style={styles.emptyTitle}>Archive is Empty</Text>
                <Text style={styles.emptySub}>
                  Completed tasks are automatically transferred here instead of cluttering active views.
                </Text>
              </>
            ) : (
              <>
                <LucideIcon name="task" size={28} color={colors.desertMuted} />
                <Text style={styles.emptyTitle}>No pending {category} tasks</Text>
                <Text style={styles.emptySub}>
                  Tap the "+ Add {category.toUpperCase()} Task" button above to create one.
                </Text>
              </>
            )}
          </View>
        ) : (
          displayedTasks.map((t) => (
            <View key={t.id} style={[styles.taskItem, t.is_completed && styles.taskItemArchived]}>
              {/* Check circle for active tasks -> sends to archive */}
              {!t.is_completed ? (
                <TouchableOpacity
                  style={styles.checkCircle}
                  onPress={() => handleCompleteTask(t.id)}
                  title="Complete and move to Archive"
                />
              ) : (
                <View style={styles.archiveCheckDone}>
                  <LucideIcon name="check" size={12} color="#FFF" />
                </View>
              )}

              <View style={styles.taskContentBox}>
                <View style={styles.rowBetween}>
                  <View style={styles.badgeGroup}>
                    <Text style={styles.taskDateText}>
                      {t.category === 'daily' ? `Today (${t.date})` : `Due: ${t.date}`}
                    </Text>
                    {t.is_completed && (
                      <View style={styles.archivedPill}>
                        <Text style={styles.archivedPillText}>Archived: {t.category}</Text>
                      </View>
                    )}
                  </View>

                  <View style={[
                    styles.priorityBadge, 
                    t.priority === 'Urgent' ? styles.badgeUrgent : t.priority === 'P1' ? styles.badgeP1 : styles.badgeNormal
                  ]}>
                    <Text style={[
                      styles.priorityBadgeText,
                      t.priority === 'Urgent' ? styles.badgeUrgentText : t.priority === 'P1' ? styles.badgeP1Text : styles.badgeNormalText
                    ]}>{t.priority || 'Normal'}</Text>
                  </View>
                </View>

                <Text style={styles.taskTitleText}>{t.title}</Text>

                {t.description ? (
                  <Text style={styles.taskDescText}>{t.description}</Text>
                ) : null}

                {/* Action Row */}
                <View style={styles.actionRow}>
                  {t.is_completed ? (
                    <TouchableOpacity style={styles.restoreBtn} onPress={() => handleRestoreTask(t.id)}>
                      <LucideIcon name="restore" size={12} color={colors.primary} />
                      <Text style={styles.restoreBtnText}>Restore to Active</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(t)}>
                      <Text style={styles.actionBtnText}>Edit</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteTask(t.id)}>
                    <Text style={[styles.actionBtnText, { color: colors.urgentRed }]}>Delete</Text>
                  </TouchableOpacity>
                  <Text style={styles.taskVersionText}>v{t.version || 1}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Add / Edit Task Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingTaskId ? 'Modify Task' : `New ${category === 'archive' ? 'Daily' : category.toUpperCase()} Task`}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Task title..."
              placeholderTextColor={colors.desertMuted}
              value={taskTitle}
              onChangeText={setTaskTitle}
            />

            <TextInput
              style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
              placeholder="Optional notes or subtasks..."
              placeholderTextColor={colors.desertMuted}
              value={taskDesc}
              onChangeText={setTaskDesc}
              multiline
            />

            {/* Date Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputGroupLabel}>
                {category === 'daily' ? 'Date (Auto-locked to Today)' : 'Due Date (YYYY-MM-DD)'}
              </Text>
              <TextInput
                style={[styles.modalInput, category === 'daily' && { opacity: 0.7 }]}
                value={category === 'daily' ? getIsoDate() : taskDate}
                editable={category !== 'daily'}
                onChangeText={setTaskDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.desertMuted}
              />
            </View>

            {/* Priority Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputGroupLabel}>Priority Tag</Text>
              <View style={styles.prioritySelectorRow}>
                {['Normal', 'P2', 'P1', 'Urgent'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setTaskPriority(p)}
                    style={[styles.pPill, taskPriority === p && styles.pPillActive]}
                  >
                    <Text style={[styles.pPillText, taskPriority === p && styles.pPillTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveBtn} 
                onPress={handleSaveTask}
              >
                <Text style={styles.modalSaveBtnText}>Save Task</Text>
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
  commandBanner: {
    backgroundColor: colors.cardSurface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: spacing.sm,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerTitle: {
    fontSize: typography.lg,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  bannerSub: {
    fontSize: typography.xs,
    color: colors.desertMuted,
  },
  pillSelector: {
    flexDirection: 'row',
    backgroundColor: colors.cardSurfaceAlt,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.desertBorder,
  },
  pillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    gap: 3,
  },
  pillBtnActive: {
    backgroundColor: colors.primary,
  },
  pillBtnArchiveActive: {
    backgroundColor: colors.desertDark,
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.desertDark,
  },
  pillTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  pillBadge: {
    backgroundColor: colors.cardSurfaceLow,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  pillBadgeActive: {
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  pillBadgeText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  pillBadgeTextActive: {
    color: '#FFF',
  },
  gridTwo: {
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
  rowBetween: {
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
  metricLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.desertDark,
    marginVertical: 2,
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
  dotUrgent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.urgentRed,
  },
  tagFilterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tagFilterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.cardSurfaceAlt,
  },
  tagFilterBtnActive: {
    backgroundColor: colors.primary,
  },
  tagFilterBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  tagFilterBtnTextActive: {
    color: '#FFF',
  },
  addTriggerBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addTriggerBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  clearArchiveBtn: {
    backgroundColor: colors.urgentRedBg,
    borderWidth: 1,
    borderColor: colors.urgentRed,
    borderRadius: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  clearArchiveBtnText: {
    color: colors.urgentRed,
    fontSize: 11,
    fontWeight: 'bold',
  },
  taskListContainer: {
    gap: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 14,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  emptySub: {
    fontSize: 11,
    color: colors.desertMuted,
    textAlign: 'center',
  },
  taskItem: {
    backgroundColor: colors.cardSurface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  taskItemArchived: {
    backgroundColor: colors.cardSurfaceAlt,
    borderColor: 'rgba(222, 200, 165, 0.7)',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  archiveCheckDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  taskContentBox: {
    flex: 1,
    gap: 3,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  archivedPill: {
    backgroundColor: 'rgba(62, 106, 94, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  archivedPillText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: colors.sage,
    textTransform: 'uppercase',
  },
  taskDateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.desertMuted,
  },
  taskTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  taskDescText: {
    fontSize: 11,
    color: colors.desertMuted,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  badgeUrgent: {
    backgroundColor: colors.urgentRedBg,
  },
  badgeUrgentText: {
    color: colors.urgentRed,
    fontSize: 9,
    fontWeight: 'bold',
  },
  badgeP1: {
    backgroundColor: colors.primaryLight,
  },
  badgeP1Text: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  badgeNormal: {
    backgroundColor: colors.cardSurfaceAlt,
  },
  badgeNormalText: {
    color: colors.desertDark,
    fontSize: 9,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderColor: 'rgba(222, 200, 165, 0.4)',
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  restoreBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
  },
  actionBtn: {
    paddingVertical: 2,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  taskVersionText: {
    marginLeft: 'auto',
    fontSize: 9,
    fontFamily: 'monospace',
    color: colors.desertMuted,
  },

  // Modal Styles
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
  modalInput: {
    backgroundColor: colors.sandBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.desertDark,
  },
  inputGroup: {
    gap: 4,
  },
  inputGroupLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.desertMuted,
    textTransform: 'uppercase',
  },
  prioritySelectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.cardSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.desertBorder,
  },
  pPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  pPillTextActive: {
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
