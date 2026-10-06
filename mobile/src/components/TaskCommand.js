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

export default function TaskCommand({ tasks, onSaveTasks }) {
  const [category, setCategory] = useState('daily'); // daily, weekly, yearly, custom
  const [filterTag, setFilterTag] = useState('all');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState(getIsoDate());
  const [taskPriority, setTaskPriority] = useState('Normal');

  const openAddModal = (cat = category) => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('Normal');
    if (cat === 'daily') {
      setTaskDate(getIsoDate());
    } else if (cat === 'weekly') {
      // 7 days ahead preset
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

    if (editingTaskId) {
      // Update existing task
      const updated = tasks.map(t => {
        if (t.id === editingTaskId) {
          return {
            ...t,
            title: taskTitle.trim(),
            description: taskDesc.trim(),
            date: category === 'daily' ? getIsoDate() : taskDate,
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
        category: category,
        date: category === 'daily' ? getIsoDate() : taskDate,
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
      'Are you sure you want to delete this task?',
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

  const toggleTaskStatus = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          is_completed: !t.is_completed,
          version: (t.version || 1) + 1,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });
    onSaveTasks(updated);
  };

  // Filter tasks by active category
  let currentTasks = tasks.filter(t => t.category === category);
  if (category === 'custom' && filterTag !== 'all') {
    currentTasks = currentTasks.filter(t => t.priority.toLowerCase() === filterTag.toLowerCase());
  }

  const completedCount = currentTasks.filter(t => t.is_completed).length;
  const totalCount = currentTasks.length;
  const percentDone = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const urgentCount = currentTasks.filter(t => t.priority === 'Urgent' && !t.is_completed).length;

  return (
    <View style={styles.container}>
      {/* Category 4-Pill Selector */}
      <View style={styles.commandBanner}>
        <View style={styles.bannerHeader}>
          <Text style={styles.bannerTitle}>Task Command</Text>
          <Text style={styles.bannerSub}>MST Sector 7</Text>
        </View>

        <View style={styles.pillSelector}>
          {[
            { key: 'daily', label: 'Daily' },
            { key: 'weekly', label: 'Weekly' },
            { key: 'yearly', label: 'Yearly' },
            { key: 'custom', label: 'Custom' },
          ].map((pill) => {
            const count = tasks.filter(t => t.category === pill.key).length;
            const isActive = category === pill.key;
            return (
              <TouchableOpacity
                key={pill.key}
                onPress={() => setCategory(pill.key)}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {pill.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.pillBadge, isActive && styles.pillBadgeActive]}>
                    <Text style={[styles.pillBadgeText, isActive && styles.pillBadgeTextActive]}>
                      {count}
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
          <Text style={styles.metricLabel}>{category} Completion</Text>
          <Text style={styles.metricLarge}>{completedCount}/{totalCount}</Text>
          <Text style={styles.metricHighlight}>{percentDone}% Done</Text>
        </View>
        <View style={styles.cardBox}>
          <View style={styles.rowBetween}>
            <Text style={styles.metricLabel}>Urgent Priority</Text>
            {urgentCount > 0 && <View style={styles.dotUrgent} />}
          </View>
          <Text style={[styles.metricLarge, { color: colors.urgentRed }]}>{urgentCount} Urgent</Text>
          <Text style={styles.metricSub}>Attention required</Text>
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

      {/* Add Task Trigger Button */}
      <TouchableOpacity style={styles.addTriggerBtn} onPress={() => openAddModal()}>
        <Text style={styles.addTriggerBtnText}>+ Add {category.toUpperCase()} Task</Text>
      </TouchableOpacity>

      {/* Task Items List */}
      <View style={styles.taskListContainer}>
        {currentTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No {category} tasks recorded</Text>
            <Text style={styles.emptySub}>
              Tap the "+ Add {category.toUpperCase()} Task" button above to create one.
            </Text>
          </View>
        ) : (
          currentTasks.map((t) => (
            <View key={t.id} style={[styles.taskItem, t.is_completed && styles.taskItemDone]}>
              <TouchableOpacity
                style={[styles.checkCircle, t.is_completed && styles.checkCircleDone]}
                onPress={() => toggleTaskStatus(t.id)}
              >
                {t.is_completed && <Text style={styles.checkCheck}>✓</Text>}
              </TouchableOpacity>

              <View style={styles.taskContentBox}>
                <View style={styles.rowBetween}>
                  <Text style={styles.taskDateText}>
                    {category === 'daily' ? `Today (${t.date})` : `Due: ${t.date}`}
                  </Text>
                  <View style={[
                    styles.priorityBadge, 
                    t.priority === 'Urgent' ? styles.badgeUrgent : t.priority === 'P1' ? styles.badgeP1 : styles.badgeNormal
                  ]}>
                    <Text style={[
                      styles.priorityBadgeText,
                      t.priority === 'Urgent' ? styles.badgeUrgentText : t.priority === 'P1' ? styles.badgeP1Text : styles.badgeNormalText
                    ]}>{t.priority}</Text>
                  </View>
                </View>

                <Text style={[styles.taskTitleText, t.is_completed && styles.taskTitleStrike]}>
                  {t.title}
                </Text>

                {t.description ? (
                  <Text style={styles.taskDescText}>{t.description}</Text>
                ) : null}

                {/* Edit & Delete Action Row */}
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(t)}>
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
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
              {editingTaskId ? 'Modify Task' : `New ${category.toUpperCase()} Task`}
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
    gap: 4,
  },
  pillBtnActive: {
    backgroundColor: colors.primary,
  },
  pillText: {
    fontSize: 11,
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
    fontSize: 9,
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
    fontSize: 11,
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
    alignItems: 'center',
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
  taskListContainer: {
    gap: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    alignItems: 'center',
    gap: 6,
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
  taskItemDone: {
    opacity: 0.65,
    backgroundColor: colors.cardSurfaceAlt,
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
  checkCircleDone: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  checkCheck: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  taskContentBox: {
    flex: 1,
    gap: 3,
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
  taskTitleStrike: {
    textDecorationLine: 'line-through',
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
