export type ThemePreference = 'system' | 'light' | 'dark';
export const lightColors = {
  text: '#0F1B3D', primary: '#185DCA', primarySoft: '#E8F0FF', background: '#F5F8FF',
  line: '#E6EAF2', muted: '#506078', white: '#FFFFFF', surface: '#FFFFFF',
  subtle: '#E6EAF2', input: '#FFFFFF', placeholder: '#566981', controlBorder: '#788BA7',
  accentSolid: '#1F6FEB', onAccent: '#FFFFFF', accentBorder: '#8BAEEB',
  upload: '#EDF3FF', tipStart: '#E8F0FF', tipEnd: '#F5F8FF', tipText: '#355580',
  green: '#117448', resultGreen: '#15875A', amber: '#895000', resultAmber: '#F5A623', red: '#D91E23', errorBg: '#E8F0FF', errorBorder: '#788BA7',
  riskHigh: '#FFF1F2', riskMedium: '#FFF3DC', riskLow: '#E3F5ED',
};
export type ThemeColors = typeof lightColors;
export const darkColors: ThemeColors = {
  text: '#F0F5FF', primary: '#A9C8FF', primarySoft: '#20385E', background: '#0F1B3D',
  line: '#364B69', muted: '#B4C3DA', white: '#FFFFFF', surface: '#15243B',
  subtle: '#1E304B', input: '#101E33', placeholder: '#A8BAD3', controlBorder: '#7891B5',
  accentSolid: '#A9C8FF', onAccent: '#10254A', accentBorder: '#6486B9',
  upload: '#192F50', tipStart: '#20385E', tipEnd: '#192D4B', tipText: '#C0D5F6',
  green: '#85DDB5', resultGreen: '#15875A', amber: '#F6C677', resultAmber: '#F5A623', red: '#FFAAA2', errorBg: '#20385E', errorBorder: '#7891B5',
  riskHigh: '#39272B', riskMedium: '#393221', riskLow: '#183B33',
};
