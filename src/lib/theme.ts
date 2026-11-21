export type ThemePreference = 'system' | 'light' | 'dark';
export const lightColors = {
  text: '#142D52', primary: '#2059D4', primarySoft: '#E8F0FF', background: '#F4F7FD',
  line: '#CCD8EB', muted: '#50627D', white: '#FFFFFF', surface: '#FFFFFF',
  subtle: '#EDF2FA', input: '#FFFFFF', placeholder: '#566981', controlBorder: '#788BA7',
  accentSolid: '#245EEA', onAccent: '#FFFFFF', accentBorder: '#9AB7EE',
  upload: '#EFF5FF', tipStart: '#E5EFFF', tipEnd: '#F1F6FF', tipText: '#355580',
  amber: '#895000', red: '#B52F3D', errorBg: '#FFF0ED', errorBorder: '#C67572',
  riskHigh: '#FFF0EA', riskMedium: '#FFF4DE', riskLow: '#E5F3EA',
};
export type ThemeColors = typeof lightColors;
export const darkColors: ThemeColors = {
  text: '#F0F5FF', primary: '#A9C8FF', primarySoft: '#20385E', background: '#0C1628',
  line: '#364B69', muted: '#B4C3DA', white: '#FFFFFF', surface: '#15243B',
  subtle: '#1E304B', input: '#101E33', placeholder: '#A8BAD3', controlBorder: '#7891B5',
  accentSolid: '#A9C8FF', onAccent: '#10254A', accentBorder: '#6486B9',
  upload: '#192F50', tipStart: '#20385E', tipEnd: '#192D4B', tipText: '#C0D5F6',
  amber: '#F6C677', red: '#FFAAA2', errorBg: '#3C2428', errorBorder: '#81514E',
  riskHigh: '#39272B', riskMedium: '#393221', riskLow: '#183B33',
};
