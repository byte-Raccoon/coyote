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
  Alert
} from 'react-native';
import { SyncClient } from './src/sync';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hostIp, setHostIp] = useState('192.168.1.100');
  const [syncStatus, setSyncStatus] = useState('Not connected');
  const [syncing, setSyncing] = useState(false);

  // In-memory data store for mobile
  const [plannerCategory, setPlannerCategory] = useState('weekly');
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Revise Graph Algorithms', category: 'weekly', is_completed: false, version: 1 },
    { id: '2', title: 'Prepare OS Exam Notes', category: 'weekly', is_completed: true, version: 1 }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const [vaultFolder, setVaultFolder] = useState('journal');
  const [notes, setNotes] = useState([
    { id: 'n1', title: 'Day 1 Reflections', content: 'Starting Coyote mobile...', folder: 'journal', version: 1 }
  ]);

  const syncClient = new SyncClient(hostIp, 3335, 'oneplus-phone');

  const testConnection = async () => {
    setSyncing(true);
    setSyncStatus('Connecting...');
    try {
      const data = await syncClient.checkHostHealth();
      setSyncStatus(`Connected to Mac (port ${data.port})`);
      Alert.alert('Sync Connected', `Successfully connected to Mac Coyote Backend on ${hostIp}:3335!`);
    } catch (err) {
      setSyncStatus('Connection failed');
      Alert.alert('Connection Failed', `Could not reach ${hostIp}:3335. Ensure Mac is on same Wi-Fi/Hotspot.`);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      category: plannerCategory,
      is_completed: false,
      version: 1
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !t.is_completed, version: t.version + 1 } : t));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#211914" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>C</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>COYOTE</Text>
            <Text style={styles.brandSub}>ONEPLUS / ANDROID</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.syncBadge} onPress={testConnection}>
          <Text style={styles.syncBadgeText}>{syncing ? '...' : syncStatus.includes('Connected') ? 'Synced' : 'Offline'}</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        {['dashboard', 'planner', 'targets', 'vault', 'sync'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Body View */}
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'dashboard' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.grid}>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>PLANNER TASKS</Text>
                <Text style={styles.cardValue}>{tasks.length}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>COMPLETED</Text>
                <Text style={[styles.cardValue, { color: '#3F685E' }]}>
                  {tasks.filter(t => t.is_completed).length}
                </Text>
              </View>
            </View>

            <View style={[styles.card, { marginTop: 12 }]}>
              <Text style={styles.cardLabel}>VAULT ENTRIES</Text>
              <Text style={[styles.cardValue, { color: '#D9531E' }]}>{notes.length}</Text>
              <Text style={styles.cardSub}>Journal, Project Ideas & General Notes</Text>
            </View>

            <View style={[styles.card, { marginTop: 12 }]}>
              <Text style={styles.cardLabel}>SYNC STATUS</Text>
              <Text style={styles.statusText}>{syncStatus}</Text>
              <Text style={styles.cardSub}>Mac host: http://{hostIp}:3335</Text>
            </View>
          </View>
        )}

        {activeTab === 'planner' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planner</Text>
            <View style={styles.subtabRow}>
              {['weekly', 'monthly', 'yearly'].map((sub) => (
                <TouchableOpacity
                  key={sub}
                  onPress={() => setPlannerCategory(sub)}
                  style={[styles.subtabButton, plannerCategory === sub && styles.subtabButtonActive]}
                >
                  <Text style={[styles.subtabText, plannerCategory === sub && styles.subtabTextActive]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={`New ${plannerCategory} goal...`}
                placeholderTextColor="#6E5B4B"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
              />
              <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {tasks.filter(t => t.category === plannerCategory).map((task) => (
              <TouchableOpacity
                key={task.id}
                onPress={() => toggleTask(task.id)}
                style={[styles.taskItem, task.is_completed && styles.taskItemCompleted]}
              >
                <Text style={[styles.taskTitle, task.is_completed && styles.taskTitleCompleted]}>
                  {task.is_completed ? '✓ ' : '○ '} {task.title}
                </Text>
                <Text style={styles.taskMeta}>v{task.version}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'targets' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Targets</Text>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>DSA TARGET</Text>
              <Text style={[styles.cardValue, { color: '#3F685E' }]}>15 / 20</Text>
              <Text style={styles.cardSub}>Problems solved this week</Text>
            </View>
            <View style={[styles.card, { marginTop: 12 }]}>
              <Text style={styles.cardLabel}>ACADEMIC TARGET</Text>
              <Text style={[styles.cardValue, { color: '#D9531E' }]}>4 / 5</Text>
              <Text style={styles.cardSub}>Modules completed</Text>
            </View>
          </View>
        )}

        {activeTab === 'vault' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vault</Text>
            <View style={styles.subtabRow}>
              {['journal', 'ideas', 'general'].map((sub) => (
                <TouchableOpacity
                  key={sub}
                  onPress={() => setVaultFolder(sub)}
                  style={[styles.subtabButton, vaultFolder === sub && styles.subtabButtonActive]}
                >
                  <Text style={[styles.subtabText, vaultFolder === sub && styles.subtabTextActive]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {notes.filter(n => n.folder === vaultFolder).map((note) => (
              <View key={note.id} style={styles.card}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteContent}>{note.content}</Text>
                <Text style={styles.taskMeta}>v{note.version}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'sync' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wi-Fi / Hotspot Sync</Text>
            <Text style={styles.cardSub}>
              Enter your Mac's Local IP address (find using 'ipconfig getifaddr en0' on Mac):
            </Text>
            <TextInput
              style={[styles.input, { marginVertical: 12 }]}
              value={hostIp}
              onChangeText={setHostIp}
              placeholder="e.g. 192.168.1.100"
              placeholderTextColor="#6E5B4B"
            />
            <TouchableOpacity style={styles.actionButton} onPress={testConnection}>
              <Text style={styles.actionButtonText}>
                {syncing ? 'Testing...' : 'Test Connection to Port 3335'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EED8B8',
  },
  header: {
    backgroundColor: '#211914',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 83, 30, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#D9531E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  brandTitle: {
    color: '#FBF5EC',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  brandSub: {
    color: '#6E5B4B',
    fontSize: 9,
    fontWeight: '600',
  },
  syncBadge: {
    backgroundColor: '#2D231C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#382b22',
  },
  syncBadgeText: {
    color: '#D9531E',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#2D231C',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#D9531E',
  },
  tabText: {
    color: '#6E5B4B',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25170B',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#FBF5EC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DFCCA9',
  },
  cardLabel: {
    fontSize: 10,
    color: '#6E5B4B',
    fontWeight: 'bold',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#25170B',
    marginVertical: 4,
  },
  cardSub: {
    fontSize: 11,
    color: '#6E5B4B',
    marginTop: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D9531E',
    marginTop: 4,
  },
  subtabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  subtabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FBF5EC',
    borderWidth: 1,
    borderColor: '#DFCCA9',
  },
  subtabButtonActive: {
    backgroundColor: '#D9531E',
    borderColor: '#D9531E',
  },
  subtabText: {
    fontSize: 12,
    color: '#6E5B4B',
    textTransform: 'capitalize',
  },
  subtabTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FBF5EC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#DFCCA9',
    color: '#25170B',
  },
  addButton: {
    backgroundColor: '#D9531E',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  taskItem: {
    backgroundColor: '#FBF5EC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DFCCA9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#25170B',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#6E5B4B',
  },
  taskMeta: {
    fontSize: 9,
    color: '#6E5B4B',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#25170B',
  },
  noteContent: {
    fontSize: 12,
    color: '#6E5B4B',
    marginVertical: 6,
  },
  actionButton: {
    backgroundColor: '#D9531E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
