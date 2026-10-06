import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';

/**
 * LucideIcon component for React Native (OnePlus / Android).
 * Maps 1:1 to web's lucide-react icons so the iconography is perfectly uniform:
 * - dashboard -> LayoutDashboard
 * - task / tasks -> CheckSquare
 * - dsa -> Code2 (< / > tags)
 * - ideas / vault -> Lightbulb
 * - archive -> Archive
 */
const ICON_MAP = {
  dashboard: 'view-dashboard-outline',
  task: 'checkbox-marked-outline',
  tasks: 'checkbox-marked-outline',
  dsa: 'code-tags',
  ideas: 'lightbulb-outline',
  vault: 'lightbulb-outline',
  archive: 'archive-outline',
  settings: 'cog-outline',
  sync: 'sync',
  plus: 'plus',
  trash: 'trash-can-outline',
  restore: 'restore',
  check: 'check',
  close: 'close',
};

export default function LucideIcon({ name, size = 20, color = colors.desertDark, style }) {
  const iconName = ICON_MAP[name.toLowerCase()] || 'help-circle-outline';
  return <MaterialCommunityIcons name={iconName} size={size} color={color} style={style} />;
}
