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

export default function AcademicPortal({ academics, onSaveAcademics }) {
  const [subview, setSubview] = useState('courses'); // courses, schedule, exams, audit

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [itemType, setItemType] = useState('course'); // course, lecture, exam
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [credits, setCredits] = useState('4.0');
  const [schedule, setSchedule] = useState('');
  const [examDate, setExamDate] = useState(getIsoDate());

  const openAddModal = (type = 'course') => {
    setEditingId(null);
    setItemType(type);
    setCode('');
    setTitle('');
    setCredits('4.0');
    setSchedule('');
    setExamDate(getIsoDate());
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setItemType(item.type || 'course');
    setCode(item.code || '');
    setTitle(item.title || '');
    setCredits((item.credits || 4.0).toString());
    setSchedule(item.schedule || '');
    setExamDate(item.examDate || getIsoDate());
    setIsModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a course or exam title.');
      return;
    }

    const numCredits = parseFloat(credits) || 0;

    if (editingId) {
      const updated = academics.map(a => {
        if (a.id === editingId) {
          return {
            ...a,
            code: code.trim().toUpperCase(),
            title: title.trim(),
            credits: numCredits,
            schedule: schedule.trim(),
            examDate: examDate.trim(),
            type: itemType,
            version: (a.version || 1) + 1,
            updated_at: new Date().toISOString()
          };
        }
        return a;
      });
      onSaveAcademics(updated);
    } else {
      const newItem = {
        id: generateId(),
        code: code.trim().toUpperCase() || 'GEN',
        title: title.trim(),
        credits: numCredits,
        schedule: schedule.trim() || 'TBA',
        examDate: examDate.trim(),
        type: itemType,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      onSaveAcademics([newItem, ...academics]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteItem = (id) => {
    Alert.alert(
      'Delete Academic Entry',
      'Are you sure you want to remove this academic item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const filtered = academics.filter(a => a.id !== id);
            onSaveAcademics(filtered);
          }
        }
      ]
    );
  };

  const courses = academics.filter(a => a.type === 'course');
  const exams = academics.filter(a => a.type === 'exam');
  const lectures = academics.filter(a => a.type === 'lecture');

  const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.bannerTitle}>Academic Portal</Text>
            <Text style={styles.bannerSub}>Enrolled tracks & exam horizons</Text>
          </View>
          <View style={styles.creditPill}>
            <Text style={styles.creditPillText}>{totalCredits} Credits Enrolled</Text>
          </View>
        </View>

        {/* 4-Pill Subview Selector */}
        <View style={styles.pillSelector}>
          {[
            { key: 'courses', label: 'Courses' },
            { key: 'exams', label: 'Exams' },
            { key: 'schedule', label: 'Lectures' },
            { key: 'audit', label: 'Audit' },
          ].map((pill) => (
            <TouchableOpacity
              key={pill.key}
              onPress={() => setSubview(pill.key)}
              style={[styles.pillBtn, subview === pill.key && styles.pillBtnActive]}
            >
              <Text style={[styles.pillText, subview === pill.key && styles.pillTextActive]}>
                {pill.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 1. COURSES SUBVIEW */}
      {subview === 'courses' && (
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal('course')}>
            <Text style={styles.addBtnText}>+ Enroll New Course</Text>
          </TouchableOpacity>

          {courses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Courses Enrolled</Text>
              <Text style={styles.emptySub}>
                Tap "+ Enroll New Course" to add courses (e.g. CS 641, MATH 480).
              </Text>
            </View>
          ) : (
            courses.map((c) => (
              <View key={c.id} style={styles.courseCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeBadgeText}>{c.code}</Text>
                  </View>
                  <Text style={styles.creditText}>{c.credits} Credits</Text>
                </View>
                <Text style={styles.courseTitle}>{c.title}</Text>
                <Text style={styles.courseScheduleText}>{c.schedule}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(c)}>
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteItem(c.id)}>
                    <Text style={[styles.actionBtnText, { color: colors.urgentRed }]}>Delete</Text>
                  </TouchableOpacity>
                  <Text style={styles.versionText}>v{c.version || 1}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* 2. EXAMS SUBVIEW */}
      {subview === 'exams' && (
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal('exam')}>
            <Text style={styles.addBtnText}>+ Add Milestone Exam</Text>
          </TouchableOpacity>

          {exams.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Exams Scheduled</Text>
              <Text style={styles.emptySub}>
                Record midterms and finals to track horizon countdowns.
              </Text>
            </View>
          ) : (
            exams.map((ex) => (
              <View key={ex.id} style={styles.examCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.examTagBadge}>
                    <Text style={styles.examTagBadgeText}>EXAM</Text>
                  </View>
                  <Text style={styles.examDateText}>Date: {ex.examDate}</Text>
                </View>
                <Text style={styles.examTitle}>{ex.title}</Text>
                <Text style={styles.courseScheduleText}>{ex.schedule || 'Location TBA'}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(ex)}>
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteItem(ex.id)}>
                    <Text style={[styles.actionBtnText, { color: colors.urgentRed }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* 3. LECTURES SUBVIEW */}
      {subview === 'schedule' && (
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.addBtn} onPress={() => openAddModal('lecture')}>
            <Text style={styles.addBtnText}>+ Add Lecture Block</Text>
          </TouchableOpacity>

          {lectures.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Lecture Blocks</Text>
              <Text style={styles.emptySub}>
                Add your weekly recurring classes and timings.
              </Text>
            </View>
          ) : (
            lectures.map((lec) => (
              <View key={lec.id} style={styles.lectureCard}>
                <View style={styles.rowBetween}>
                  <Text style={styles.lectureTimeText}>{lec.schedule}</Text>
                  <Text style={styles.codeBadgeText}>{lec.code}</Text>
                </View>
                <Text style={styles.courseTitle}>{lec.title}</Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(lec)}>
                    <Text style={styles.actionBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteItem(lec.id)}>
                    <Text style={[styles.actionBtnText, { color: colors.urgentRed }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* 4. AUDIT SUBVIEW */}
      {subview === 'audit' && (
        <View style={styles.sectionContainer}>
          <View style={styles.auditCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.auditTitle}>Degree Audit Summary</Text>
              <Text style={styles.creditPillText}>{totalCredits} Enrolled Credits</Text>
            </View>
            <Text style={styles.auditSub}>
              {courses.length} Active Semester Courses Tracked
            </Text>

            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.min(100, (totalCredits / 20) * 100)}%` }]} />
            </View>
            <Text style={styles.auditSub}>
              Goal: ~16-20 credits per semester sprint
            </Text>
          </View>
        </View>
      )}

      {/* Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Modify Entry' : `Add ${itemType.toUpperCase()}`}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Course Code (e.g. CS 641)..."
              placeholderTextColor={colors.desertMuted}
              value={code}
              onChangeText={setCode}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Title / Course Name..."
              placeholderTextColor={colors.desertMuted}
              value={title}
              onChangeText={setTitle}
            />

            {itemType === 'course' && (
              <TextInput
                style={styles.modalInput}
                placeholder="Credits (e.g. 4.0)..."
                keyboardType="numeric"
                placeholderTextColor={colors.desertMuted}
                value={credits}
                onChangeText={setCredits}
              />
            )}

            <TextInput
              style={styles.modalInput}
              placeholder="Schedule / Location (e.g. MWF 10:00, Hall 3B)..."
              placeholderTextColor={colors.desertMuted}
              value={schedule}
              onChangeText={setSchedule}
            />

            {itemType === 'exam' && (
              <TextInput
                style={styles.modalInput}
                placeholder="Exam Date (YYYY-MM-DD)..."
                placeholderTextColor={colors.desertMuted}
                value={examDate}
                onChangeText={setExamDate}
              />
            )}

            <View style={styles.modalActionsRow}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveBtn} 
                onPress={handleSaveItem}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
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
  banner: {
    backgroundColor: colors.cardSurface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: spacing.sm,
  },
  rowBetween: {
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
  creditPill: {
    backgroundColor: colors.sageLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(62, 106, 94, 0.2)',
  },
  creditPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.sage,
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
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
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
  sectionContainer: {
    gap: spacing.sm,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
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
  courseCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: 6,
  },
  examCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: 6,
  },
  lectureCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: 6,
  },
  codeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  creditText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.sage,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  courseScheduleText: {
    fontSize: 11,
    color: colors.desertMuted,
  },
  examTagBadge: {
    backgroundColor: colors.urgentRedBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  examTagBadgeText: {
    color: colors.urgentRed,
    fontSize: 9,
    fontWeight: 'bold',
  },
  examDateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
  },
  examTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  lectureTimeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    paddingTop: 6,
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
  versionText: {
    marginLeft: 'auto',
    fontSize: 9,
    fontFamily: 'monospace',
    color: colors.desertMuted,
  },
  auditCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: 8,
  },
  auditTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  auditSub: {
    fontSize: 11,
    color: colors.desertMuted,
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
    backgroundColor: colors.sage,
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
