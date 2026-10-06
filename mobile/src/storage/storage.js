import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TASKS: '@coyote_tasks',
  DSA: '@coyote_dsa',
  IDEAS: '@coyote_ideas',
  SETTINGS: '@coyote_settings',
};

export const generateId = () => {
  return 'coyote_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
};

export const getIsoDate = (d = new Date()) => {
  return d.toISOString().split('T')[0];
};

export const storage = {
  async loadAllData() {
    try {
      const [tasksRaw, dsaRaw, ideasRaw, settingsRaw] = await Promise.all([
        AsyncStorage.getItem(KEYS.TASKS),
        AsyncStorage.getItem(KEYS.DSA),
        AsyncStorage.getItem(KEYS.IDEAS),
        AsyncStorage.getItem(KEYS.SETTINGS),
      ]);

      const tasks = tasksRaw ? JSON.parse(tasksRaw) : [];
      const dsa = dsaRaw ? JSON.parse(dsaRaw) : {
        weeklyTarget: 15,
        dailyLogs: {}, // 'YYYY-MM-DD': count
        questions: []
      };
      const ideas = ideasRaw ? JSON.parse(ideasRaw) : [];
      const settings = settingsRaw ? JSON.parse(settingsRaw) : {
        hostIp: '192.168.1.100',
        port: 3335,
        deviceId: 'oneplus-phone'
      };

      return { tasks, dsa, ideas, settings };
    } catch (err) {
      console.warn('Failed to load local data from storage:', err);
      return {
        tasks: [],
        dsa: { weeklyTarget: 15, dailyLogs: {}, questions: [] },
        ideas: [],
        settings: { hostIp: '192.168.1.100', port: 3335, deviceId: 'oneplus-phone' }
      };
    }
  },

  async saveTasks(tasks) {
    try {
      await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
    } catch (err) {
      console.warn('Failed to save tasks:', err);
    }
  },

  async saveDsa(dsaState) {
    try {
      await AsyncStorage.setItem(KEYS.DSA, JSON.stringify(dsaState));
    } catch (err) {
      console.warn('Failed to save dsa state:', err);
    }
  },

  async saveIdeas(ideas) {
    try {
      await AsyncStorage.setItem(KEYS.IDEAS, JSON.stringify(ideas));
    } catch (err) {
      console.warn('Failed to save ideas:', err);
    }
  },

  async saveSettings(settings) {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.warn('Failed to save settings:', err);
    }
  }
};
