// deploy.ts
import { Client } from 'basic-ftp';
import { loadFtpConfig } from './commons';

async function deploy(): Promise<void> {
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

    // If a target directory is specified, ensure it exists and navigate to it
    if (ftpConfig.targetDir) {
      console.log(`Ensuring target directory exists: ${ftpConfig.targetDir}`);
      await client.ensureDir(ftpConfig.targetDir);
    }

    console.log(`Uploading to ${ftpConfig.targetDir}...`);
    await client.clearWorkingDir(); // Clear the directory
    await client.uploadFromDir('dist');

    console.log('Deployment completed successfully!');
  } catch (err) {
    if (err instanceof Error) {
      console.error('Deployment failed:', err.message);
    } else {
      console.error('Deployment failed with an unknown error');
    }
    process.exit(1); // Exit with error code
  } finally {
    client.close();
  }
}

// Execute the deploy function
deploy();
