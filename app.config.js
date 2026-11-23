const fs = require('node:fs');
const path = require('node:path');
module.exports = ({ config }) => {
  let token = '';
  try { token = JSON.parse(fs.readFileSync(path.join(__dirname, '.local/session.json'), 'utf8')).token; } catch { /* dev launcher creates it */ }
  return { ...config, name: 'T2AKKAD', slug: 't2akkad', scheme: 't2akkad',
    plugins: ['expo-router', 'expo-font', ['expo-video', { supportsBackgroundPlayback: false, supportsPictureInPicture: false }], ['expo-image-picker', { photosPermission: 'Choose a screenshot to check for scam warning signs.', cameraPermission: false, microphonePermission: false }]],
    web: { ...config.web, bundler: 'metro' },
    extra: { ...config.extra, developmentToken: token },
  };
};
