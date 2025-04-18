
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

  // Get the directory of the current script file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  export const projectRoot = resolve(__dirname, '..');

// Define interface for FTP configuration
interface FtpConfig {
    host: string;
    username: string;
    password: string;
    secure: boolean;
    targetDir: string;
  }

  // Read FTP credentials from environment variables
  export function loadFtpConfig(): FtpConfig {
    // Load environment variables from .env file if it exists
    if (existsSync(join(projectRoot, '.env'))) {
        dotenv.config();
    }
  
    const requiredVars = ['ANSTIMMEN_FTP_HOST', 'ANSTIMMEN_FTP_USERNAME', 'ANSTIMMEN_FTP_PASSWORD', 'ANSTIMMEN_FTP_SECURE', 'ANSTIMMEN_FTP_TARGET_DIR'];
  
    // Check if all required environment variables are present
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars.join(', '));
      process.exit(1);
    }
  
    return {
      host: process.env.ANSTIMMEN_FTP_HOST!,
      username: process.env.ANSTIMMEN_FTP_USERNAME!,
      password: process.env.ANSTIMMEN_FTP_PASSWORD!,
      secure: process.env.ANSTIMMEN_FTP_SECURE === 'true', // Convert string to boolean
      targetDir: process.env.ANSTIMMEN_FTP_TARGET_DIR!
    };
  }