const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to display help information
function displayHelp() {
  console.log(`
Usage:

1. This script deploys a virtual machine (VM) with configurations provided either through environment variables or user prompts.

2. You can set the following environment variables:
   - VMNAME: The name of the virtual machine.
   - MACHINENAME: The name of the machine to deploy.
   - DISKNAME: The name of the disk for the machine.
   - MOUNTPOINT: The mount point for the disk.
   - NETWORK_NAME: The name of the network for the VM.
   - DESCRIPTION: A description for the VM deployment (optional).
   - FLIST_URL: The URL of the flist to use for the VM.
   - NODE_ID: The node ID where the VM will be deployed (optional, defaults to 1).
   - SSH_KEY: The SSH key to access the deployed VM.

3. When running the script, you can either:
   - Provide the values directly when prompted.
   - Press Enter to use the corresponding environment variable or a default value if no environment variable is set. If you do not provide a required value, the script will fail with an error message.

Examples:

To run the script, ensure your terminal is configured with the necessary environment variables. You could start the script like this:

$ export VMNAME="myvm"
$ export MACHINENAME="mymachine"
$ export DISKNAME="mydisk"
$ export MOUNTPOINT="/mnt/mydisk"
$ export NETWORK_NAME="mynetwork"
$ export NODE_ID="1"

$ node your-script.js
`);
}

async function askForInput(prompt, defaultValue) {
  return new Promise((resolve) => {
    const message = defaultValue ? `${prompt} (press ENTER to use default value: ${defaultValue}): ` : prompt;
    rl.question(message, (input) => {
      resolve(input || defaultValue);
    });
  });
}

async function deployVM(showHelp = false) {
  if (showHelp) {
    displayHelp();
    rl.close();
    return;  // Exit the function after showing help
  }

  try {
    // Define default values
    const defaultFlistUrl = 'https://hub.grid.tf/tf-official-apps/base:latest.flist';
    
    const defaultVMName = 'defaultvm'; // Default for the VM name
    const defaultMachineName = 'defaultmachine'; // Default for the machine name
    const defaultDiskName = 'defaultdisk'; // Default for the disk name
    const defaultMountPoint = '/mnt/defaultdisk'; // Default for the mount point
    const defaultNetworkName = 'defaultnetwork'; // Default for the network name
    const defaultDescription = "Basic VM deployment with grid client"; // Default description
    const defaultNodeId = '1'; // Default for the node ID

    // Ask user for inputs
    const finalVMName = await askForInput('Enter the VM name', process.env.VMNAME || defaultVMName);
    const finalMachineName = await askForInput('Enter the machine name', process.env.MACHINENAME || defaultMachineName);
    const finalDiskName = await askForInput('Enter the disk name', process.env.DISKNAME || defaultDiskName);
    const finalMountPoint = await askForInput('Enter the mount point', process.env.MOUNTPOINT || defaultMountPoint);
    const finalNetworkName = await askForInput('Enter the network name', process.env.NETWORK_NAME || defaultNetworkName);
    const finalDescription = await askForInput('Enter a description', process.env.DESCRIPTION || defaultDescription);
    const finalFlistUrl = await askForInput('Enter the flist URL', process.env.FLIST_URL || defaultFlistUrl);
    
    // Ask for Node ID with default value
    const finalNodeId = await askForInput('Enter the Node ID', process.env.NODE_ID || defaultNodeId);
    const nodeId = parseInt(finalNodeId, 10);
    if (isNaN(nodeId)) {
      throw new Error('NODE_ID must be a valid number.');
    }

    // Determine the SSH key to use
    let finalSSHKey = process.env.SSH_KEY; // Check the environment variable first
    if (!finalSSHKey) {
      finalSSHKey = await askForInput('Enter your SSH key', null);
    }

    // If SSH key is still not provided, fallback to default path
    if (!finalSSHKey) {
      const defaultSSHKeyPath = path.join(os.homedir(), '.ssh', 'id_rsa.pub');
      if (fs.existsSync(defaultSSHKeyPath)) {
        finalSSHKey = fs.readFileSync(defaultSSHKeyPath, 'utf8').trim();
      } else {
        throw new Error('No SSH key provided and the default SSH key file does not exist. Please provide one.');
      }
    }

    const payload = {
      name: finalVMName,
      network: {
        ip_range: "10.201.0.0/16",
        name: finalNetworkName,
        addAccess: true
      },
      machines: [{
        name: finalMachineName,
        node_id: nodeId,
        disks: [{
          name: finalDiskName,
          size: 10,
          mountpoint: finalMountPoint
        }],
        public_ip: false,
        planetary: false,
        mycelium: true,
        cpu: 1,
        memory: 512,
        rootfs_size: 1,
        flist: finalFlistUrl,
        entrypoint: "/sbin/zinit init",
        env: {
          SSH_KEY: finalSSHKey // Use the resolved SSH key
        }
      }],
      metadata: "",
      description: finalDescription // Use the resolved description
    };

    const response = await axios.post('http://localhost:3000/machines/deploy', payload);
    console.log('VM Deployed:', response.data);
  } catch (error) {
    console.error('Error deploying VM:', error.response?.data || error.message);
  } finally {
    rl.close();
  }
}

// Execute the script with help option based on user command line argument
const showHelp = process.argv.includes('--help') || process.argv.includes('-h');
deployVM(showHelp);