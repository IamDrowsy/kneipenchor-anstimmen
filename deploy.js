import { Client } from 'basic-ftp';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file if it exists
if (existsSync(join(__dirname, '.env'))) {
  dotenv.config();
}

// Read FTP credentials from environment variables
function loadConfig() {
  const requiredVars = ['ANSTIMMEN_FTP_HOST', 'ANSTIMMEN_FTP_USERNAME', 'ANSTIMMEN_FTP_PASSWORD', 'ANSTIMMEN_FTP_SECURE'];

  // Check if all required environment variables are present
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  return {
    host: process.env.ANSTIMMEN_FTP_HOST,
    username: process.env.ANSTIMMEN_FTP_USERNAME,
    password: process.env.ANSTIMMEN_FTP_PASSWORD,
    secure: process.env.ANSTIMMEN_FTP_SECURE === 'true', // Convert string to boolean
    targetDir: process.env.ANSTIMMEN_FTP_TARGET_DIR || '' // Default to root if not specified
  };
}

async function deploy() {
  const ftpConfig = loadConfig();
  const client = new Client();
  client.ftp.verbose = process.env.ANSTIMMEN_FTP_VERBOSE === 'true'; // Enable for debugging via env var

  try {
    console.log('Connecting to FTP server...');
    await client.access({
      host: ftpConfig.host,
      user: ftpConfig.username,
      password: ftpConfig.password,
      secure: ftpConfig.secure || false // Set to true for FTPS
    });

    // If a target directory is specified, ensure it exists and navigate to it
    if (ftpConfig.targetDir) {
      console.log(`Ensuring target directory exists: ${ftpConfig.targetDir}`);
      await client.ensureDir(ftpConfig.targetDir);
    }

    console.log(`Uploading to ${ftpConfig.targetDir || 'FTP root'}...`);
    await client.clearWorkingDir(); // Clear the directory
    await client.uploadFromDir('dist');

    console.log('Deployment completed successfully!');
  } catch (err) {
    console.error('Deployment failed:', err.message);
    process.exit(1); // Exit with error code
  } finally {
    client.close();
  }
}

// Execute the deploy function
deploy();
