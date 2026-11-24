export type ThemePreference = 'system' | 'light' | 'dark';
export const lightColors = {
  text: '#0F1B3D', primary: '#185DCA', primarySoft: '#E8F0FF', background: '#F5F8FF',
  line: '#E6EAF2', muted: '#506078', white: '#FFFFFF', surface: '#FFFFFF',
  subtle: '#E6EAF2', input: '#FFFFFF', placeholder: '#566981', controlBorder: '#788BA7',
  accentSolid: '#1556BC', onAccent: '#FFFFFF', accentBorder: '#1556BC',
  upload: '#087443', onUpload: '#FFFFFF', paste: '#0F1B3D', onPaste: '#FFFFFF', brand: '#0F1B3D',
  tipStart: '#E8F0FF', tipEnd: '#F5F8FF', tipText: '#355580',
  green: '#087443', resultGreen: '#087443', amber: '#895000', resultAmber: '#F5A623', red: '#C8102E', errorBg: '#FFF1F2', errorBorder: '#C8102E',
  onRisk: '#FFFFFF', onAmber: '#382000', dangerSolid: '#C8102E', iconGreen: '#087443', iconAmber: '#9A5600', iconRed: '#C8102E',
  cropBackground: '#0A1428', cropScrim: 'rgba(0,0,0,0.6)', cropGrid: 'rgba(255,255,255,0.55)', cropHandle: '#1556BC',
  riskHigh: '#FFF1F2', riskMedium: '#FFF3DC', riskLow: '#E3F5ED',
};
export type ThemeColors = typeof lightColors;
export const darkColors: ThemeColors = {
  text: '#F0F5FF', primary: '#A9C8FF', primarySoft: '#20385E', background: '#0F1B3D',
  line: '#364B69', muted: '#B4C3DA', white: '#FFFFFF', surface: '#15243B',
  subtle: '#1E304B', input: '#101E33', placeholder: '#A8BAD3', controlBorder: '#7891B5',
  accentSolid: '#1556BC', onAccent: '#FFFFFF', accentBorder: '#789EEB',
  upload: '#087443', onUpload: '#FFFFFF', paste: '#174AA1', onPaste: '#FFFFFF', brand: '#F0F5FF',
  tipStart: '#20385E', tipEnd: '#192D4B', tipText: '#C0D5F6',
  green: '#85DDB5', resultGreen: '#087443', amber: '#F6C677', resultAmber: '#F5A623', red: '#FFAAA2', errorBg: '#39272B', errorBorder: '#FFAAA2',
  onRisk: '#FFFFFF', onAmber: '#382000', dangerSolid: '#C8102E', iconGreen: '#85DDB5', iconAmber: '#F5B333', iconRed: '#FFAAA2',
  cropBackground: '#070D1A', cropScrim: 'rgba(0,0,0,0.6)', cropGrid: 'rgba(255,255,255,0.55)', cropHandle: '#1556BC',
  riskHigh: '#39272B', riskMedium: '#393221', riskLow: '#183B33',
};
