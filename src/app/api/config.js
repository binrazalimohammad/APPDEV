/**
 * API configuration for ybackend (Symfony + Lexik JWT)
 * @see https://github.com/christiansojor/ybackend
 *
 * Notes:
 * - Android Emulator must use 10.0.2.2 to reach your PC's localhost.
 * - Physical device must use your PC's LAN IP (e.g. 192.168.x.x).
 */
import { Platform } from 'react-native';

const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_HOST = DEFAULT_HOST;
export const API_PORT = 8000;
export const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;
