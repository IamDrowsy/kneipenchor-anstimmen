import { Client } from 'basic-ftp';
import { readFile } from 'fs/promises';

// Read FTP credentials from secret file
async function loadConfig() {
  try {
    const configData = await readFile('.ftpconfig.json', 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading FTP credentials:', error.message);
    console.error('Make sure you have a .ftpconfig.json file in your project root');
    process.exit(1);
  }
}

async function deploy() {
  const ftpConfig = await loadConfig();
  const client = new Client();
  client.ftp.verbose = true; // Enable for debugging, set to false in production

  try {
    console.log('Connecting to FTP server...');
    await client.access({
      host: ftpConfig.host,
      user: ftpConfig.username,
      password: ftpConfig.password,
      secure: ftpConfig.secure || false // Set to true for FTPS
    });

    console.log('Uploading to FTP root...');
    await client.clearWorkingDir(); // Clear the directory
    await client.uploadFromDir('dist');

    console.log('Deployment completed successfully!');
  } catch (err) {
    console.error('Deployment failed:', err.message);
  } finally {
    client.close();
  }
}

// Execute the deploy function
deploy();
