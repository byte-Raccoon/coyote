import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';
import { SyncClient } from '../sync';

export default function SyncView({ 
  settings, 
  onSaveSettings, 
  tasks, 
  ideas, 
  onSyncComplete 
}) {
  const [hostIp, setHostIp] = useState(settings.hostIp || '192.168.1.100');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Idle');

  const syncClient = new SyncClient(hostIp, settings.port || 3335, settings.deviceId || 'oneplus-phone');

  const handleTestConnection = async () => {
    setSyncing(true);
    setSyncStatus('Testing connection...');
    try {
      const data = await syncClient.checkHostHealth();
      setSyncStatus(`Connected to Mac (Port ${data.port})`);
      onSaveSettings({ ...settings, hostIp });
      Alert.alert('Connected', `Successfully reached Coyote FastAPI backend on ${hostIp}:${data.port}!`);
    } catch (err) {
      setSyncStatus('Offline / Unreachable');
      Alert.alert('Connection Failed', `Could not reach ${hostIp}:3335. Ensure Mac and OnePlus are on same Wi-Fi or Mobile Hotspot.`);
    } finally {
      setSyncing(false);
    }
  };

  const handleRunFullSync = async () => {
    setSyncing(true);
    setSyncStatus('Syncing changes with Mac...');
    try {
      // 1. Push local changes
      await syncClient.pushUpdates(tasks, ideas);

      // 2. Pull remote changes
      const remote = await syncClient.pullUpdates();
      
      setSyncStatus('Sync Complete ✓');
      Alert.alert('Sync Complete', `Synchronized with Mac at ${new Date().toLocaleTimeString()}!`);

      if (onSyncComplete) {
        onSyncComplete(remote);
      }
    } catch (err) {
      setSyncStatus('Sync Failed');
      Alert.alert('Sync Error', err.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardBox}>
        <Text style={styles.title}>Wi-Fi & Hotspot Sync Engine</Text>
        <Text style={styles.sub}>
          Direct device-to-device REST synchronization between MacBook Air and OnePlus.
        </Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>SYNC STATE</Text>
          <Text style={styles.statusValue}>{syncStatus}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>MacBook Air Local IP Address</Text>
          <TextInput
            style={styles.textInput}
            value={hostIp}
            onChangeText={setHostIp}
            placeholder="e.g. 192.168.1.15"
            placeholderTextColor={colors.desertMuted}
          />
          <Text style={styles.hintText}>
            Find on Mac terminal via: <Text style={{ fontFamily: 'monospace' }}>ipconfig getifaddr en0</Text>
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.testBtn} 
          onPress={handleTestConnection}
          disabled={syncing}
        >
          <Text style={styles.testBtnText}>
            {syncing ? 'Connecting...' : 'Test Connection to Port 3335'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.syncBtn} 
          onPress={handleRunFullSync}
          disabled={syncing}
        >
          <Text style={styles.syncBtnText}>
            {syncing ? 'Syncing...' : 'Sync Now with Mac (Push & Pull)'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  cardBox: {
    backgroundColor: colors.cardSurface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  sub: {
    fontSize: typography.xs,
    color: colors.desertMuted,
    lineHeight: 16,
  },
  statusBox: {
    backgroundColor: colors.cardSurfaceAlt,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.desertBorder,
  },
  statusLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.desertMuted,
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 2,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.desertMuted,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: colors.sandBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.desertDark,
  },
  hintText: {
    fontSize: 10,
    color: colors.desertMuted,
    marginTop: 2,
  },
  testBtn: {
    backgroundColor: colors.cardSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.desertBorder,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.desertDark,
  },
  syncBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  syncBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
