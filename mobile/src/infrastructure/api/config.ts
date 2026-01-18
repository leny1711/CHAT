/**
 * API Configuration
 * Update this to point to your backend server
 */

// For local development
// iOS Simulator: http://localhost:3000
// Android Emulator: http://10.0.2.2:3000
// Real device: http://YOUR_COMPUTER_IP:3000

export const API_CONFIG = {
  BASE_URL: __DEV__
    ? 'http://localhost:3000' // Change to 10.0.2.2 for Android emulator
    : 'https://your-production-api.com',
  WS_URL: __DEV__
    ? 'ws://localhost:3000/ws'
    : 'wss://your-production-api.com/ws',
  TIMEOUT: 10000,
};
