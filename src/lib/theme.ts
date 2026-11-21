export type ThemePreference = 'system' | 'light' | 'dark';
export const lightColors = {
  navy: '#103D49', teal: '#087475', mint: '#E5F3EE', paper: '#F7F8F3',
  line: '#D8E2DB', muted: '#5D7478', white: '#FFFFFF', surface: '#FFFFFF',
  subtle: '#EBEFE9', input: '#F7F9F7', placeholder: '#5F736C',
  accentSolid: '#087F80', onAccent: '#FFFFFF', accentBorder: '#B7D2C9',
  upload: '#F5FAF6', tipStart: '#E3F0E5', tipEnd: '#ECF4E7', tipText: '#496C59',
  amber: '#92530B', red: '#B83C3C', errorBg: '#FFF0ED', errorBorder: '#F3C5BB',
  riskHigh: '#FFF0EA', riskMedium: '#FFF4DE', riskLow: '#E5F3EA',
};
export type ThemeColors = typeof lightColors;
export const darkColors: ThemeColors = {
  navy: '#E6F2EF', teal: '#78DED1', mint: '#183C38', paper: '#0C171B',
  line: '#30464A', muted: '#A5BDBA', white: '#FFFFFF', surface: '#14252A',
  subtle: '#1D3237', input: '#101F24', placeholder: '#94AAA6',
  accentSolid: '#087F80', onAccent: '#FFFFFF', accentBorder: '#3F736A',
  upload: '#112C2C', tipStart: '#173B35', tipEnd: '#203B30', tipText: '#BEDDCF',
  amber: '#F6C677', red: '#FFAAA2', errorBg: '#3C2428', errorBorder: '#81514E',
  riskHigh: '#39272B', riskMedium: '#393221', riskLow: '#183B33',
};
