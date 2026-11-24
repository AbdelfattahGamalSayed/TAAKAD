const fs = require('node:fs');
const path = require('node:path');
module.exports = ({ config }) => {
  let preview = null;
  if (process.env.TAAKAD_PUBLISH_PREVIEW === '1') {
    preview = JSON.parse(fs.readFileSync(path.join(__dirname, '.local/preview-settings.json'), 'utf8'));
    const api = new URL(preview.apiUrl);
    if (!['http:', 'https:'].includes(api.protocol) || api.username || api.password || api.pathname !== '/') throw new Error('Use a plain http(s) API origin for the preview.');
  }
  let token = '';
  try { token = JSON.parse(fs.readFileSync(path.join(__dirname, '.local/session.json'), 'utf8')).token; } catch { /* dev launcher creates it */ }
  return { ...config, name: 'TAAKAD', slug: 'taakad', scheme: 'taakad',
    plugins: ['expo-router', 'expo-font', ['expo-video', { supportsBackgroundPlayback: false, supportsPictureInPicture: false }], ['expo-image-picker', { photosPermission: 'Choose a screenshot to check for scam warning signs.', cameraPermission: false, microphonePermission: false }]],
    web: { ...config.web, bundler: 'metro' },
    ...(preview ? { owner: preview.owner, runtimeVersion: 'exposdk:58.0.0', updates: { url: 'https://u.expo.dev/' + preview.projectId } } : {}),
    extra: { ...config.extra, developmentToken: token, ...(preview ? { previewApiUrl: preview.apiUrl, eas: { projectId: preview.projectId } } : {}) },
  };
};
