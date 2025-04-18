// cleanup.ts
import { Client } from 'basic-ftp';
import { loadFtpConfig } from './commons';


async function cleanup(): Promise<void> {
  const ftpConfig = loadFtpConfig();
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

    console.log(`Removing directory: ${ftpConfig.targetDir}`);
    await client.removeDir(ftpConfig.targetDir);
    console.log('Cleanup completed successfully');
  } catch (err) {
    if (err instanceof Error) {
      console.error('Cleanup failed:', err.message);
    } else {
      console.error('Cleanup failed with an unknown error');
    }
    process.exit(1);
  } finally {
    client.close();
  }
}

// Execute the cleanup function
cleanup();
