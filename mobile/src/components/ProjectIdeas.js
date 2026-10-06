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
import { generateId } from '../storage/storage';

export default function ProjectIdeas({ ideas, onSaveIdeas }) {
  const [filterTag, setFilterTag] = useState('all');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState(null);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaTag, setIdeaTag] = useState('#Systems');
  const [ideaStatus, setIdeaStatus] = useState('Concept');
  const [ideaDesc, setIdeaDesc] = useState('');

  const openAddModal = () => {
    setEditingIdeaId(null);
    setIdeaTitle('');
    setIdeaTag('#Systems');
    setIdeaStatus('Concept');
    setIdeaDesc('');
    setIsModalOpen(true);
  };

  const openEditModal = (idea) => {
    setEditingIdeaId(idea.id);
    setIdeaTitle(idea.title);
    setIdeaTag(idea.tag || '#General');
    setIdeaStatus(idea.status || 'Concept');
    setIdeaDesc(idea.description || '');
    setIsModalOpen(true);
  };

  const handleSaveIdea = () => {
    if (!ideaTitle.trim()) {
      Alert.alert('Required', 'Please enter an idea title.');
      return;
    }

    if (editingIdeaId) {
      const updated = ideas.map(i => {
        if (i.id === editingIdeaId) {
          return {
            ...i,
            title: ideaTitle.trim(),
            tag: ideaTag.startsWith('#') ? ideaTag.trim() : '#' + ideaTag.trim(),
            status: ideaStatus,
            description: ideaDesc.trim(),
            version: (i.version || 1) + 1,
            updated_at: new Date().toISOString()
          };
        }
        return i;
      });
      onSaveIdeas(updated);
    } else {
      const newIdea = {
        id: generateId(),
        title: ideaTitle.trim(),
        tag: ideaTag.startsWith('#') ? ideaTag.trim() : '#' + ideaTag.trim(),
        status: ideaStatus,
        description: ideaDesc.trim(),
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      onSaveIdeas([newIdea, ...ideas]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteIdea = (id) => {
    Alert.alert(
      'Delete Project Idea',
      'Are you sure you want to delete this idea?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const filtered = ideas.filter(i => i.id !== id);
            onSaveIdeas(filtered);
          }
        }
      ]
    );
  };

  const displayedIdeas = filterTag === 'all' 
    ? ideas 
    : ideas.filter(i => (i.tag || '').toLowerCase().includes(filterTag.toLowerCase()));

  return (
    <View style={styles.container}>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.rowBetween}>
          <Text style={styles.bannerTitle}>Project Ideas Vault</Text>
          <Text style={styles.bannerCount}>{ideas.length} Ideas Logged</Text>
        </View>
        <Text style={styles.bannerSub}>
          Brainstorm architectures, systems blueprints, and product concepts.
        </Text>
      </View>

      {/* Domain Tag Filters */}
      <View style={styles.filterRow}>
        {['all', 'systems', 'ai', 'mobile', 'web'].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setFilterTag(t)}
            style={[styles.filterChip, filterTag === t && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filterTag === t && styles.filterChipTextActive]}>
              #{t.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
        <Text style={styles.addBtnText}>+ Draft New Project Idea</Text>
      </TouchableOpacity>

      {/* Ideas Card Grid */}
      <View style={styles.cardList}>
        {displayedIdeas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Project Ideas Recorded</Text>
            <Text style={styles.emptySub}>
              Use the "+ Draft New Project Idea" button to log an idea.
            </Text>
          </View>
        ) : (
          displayedIdeas.map((idea) => (
            <View key={idea.id} style={styles.ideaCard}>
              <View style={styles.rowBetween}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>{idea.tag || '#General'}</Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  idea.status === 'Shipped' ? styles.statusShipped : idea.status === 'Prototyping' ? styles.statusProto : styles.statusConcept
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    idea.status === 'Shipped' ? styles.statusShippedText : idea.status === 'Prototyping' ? styles.statusProtoText : styles.statusConceptText
                  ]}>{idea.status}</Text>
                </View>
              </View>

              <Text style={styles.ideaTitle}>{idea.title}</Text>
              
              {idea.description ? (
                <Text style={styles.ideaDesc}>{idea.description}</Text>
              ) : null}

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(idea)}>
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteIdea(idea.id)}>
                  <Text style={[styles.actionBtnText, { color: colors.urgentRed }]}>Delete</Text>
                </TouchableOpacity>
                <Text style={styles.versionText}>v{idea.version || 1}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Add / Edit Idea Modal */}
      <Modal visible={isModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingIdeaId ? 'Modify Project Idea' : 'Draft New Project Idea'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Idea / project name..."
              placeholderTextColor={colors.desertMuted}
              value={ideaTitle}
              onChangeText={setTaskTitle => setIdeaTitle(setTaskTitle)}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Domain Tag (e.g., #Systems, #Mobile, #AI)..."
              placeholderTextColor={colors.desertMuted}
              value={ideaTag}
              onChangeText={setIdeaTag}
            />

            {/* Status Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputGroupLabel}>Development Status</Text>
              <View style={styles.statusSelectRow}>
                {['Concept', 'Prototyping', 'Shipped'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setIdeaStatus(st)}
                    style={[styles.statusSelectBtn, ideaStatus === st && styles.statusSelectBtnActive]}
                  >
                    <Text style={[styles.statusSelectBtnText, ideaStatus === st && styles.statusSelectBtnTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Architecture notes, tech stack, and execution roadmap..."
              placeholderTextColor={colors.desertMuted}
              value={ideaDesc}
              onChangeText={setIdeaDesc}
              multiline
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setIsModalOpen(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSaveBtn} 
                onPress={handleSaveIdea}
              >
                <Text style={styles.modalSaveBtnText}>Save Idea</Text>
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
    gap: 4,
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
  bannerCount: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.primary,
    fontWeight: 'bold',
  },
  bannerSub: {
    fontSize: typography.xs,
    color: colors.desertMuted,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.cardSurfaceAlt,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  filterChipTextActive: {
    color: '#FFF',
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
  cardList: {
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
  ideaCard: {
    backgroundColor: colors.cardSurface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: 8,
  },
  tagBadge: {
    backgroundColor: colors.sandBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.desertBorder,
  },
  tagBadgeText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusConcept: {
    backgroundColor: colors.cardSurfaceAlt,
  },
  statusConceptText: {
    color: colors.desertDark,
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusProto: {
    backgroundColor: colors.primaryLight,
  },
  statusProtoText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  statusShipped: {
    backgroundColor: colors.doneGreenBg,
  },
  statusShippedText: {
    color: colors.doneGreen,
    fontSize: 9,
    fontWeight: 'bold',
  },
  ideaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  ideaDesc: {
    fontSize: 11,
    color: colors.desertMuted,
    lineHeight: 16,
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
  inputGroup: {
    gap: 4,
  },
  inputGroupLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.desertMuted,
    textTransform: 'uppercase',
  },
  statusSelectRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusSelectBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.cardSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.desertBorder,
  },
  statusSelectBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusSelectBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  statusSelectBtnTextActive: {
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
