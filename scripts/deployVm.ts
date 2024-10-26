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

1. This script can deploy or delete a virtual machine (VM) based on user input or command line arguments.

2. You can set the following environment variables for deployment:
   - VMNAME: The name of the virtual machine.
   - MACHINENAME: The name of the machine to deploy.
   - DISKNAME: The name of the disk for the machine.
   - MOUNTPOINT: The mount point for the disk.
   - NETWORK_NAME: The name of the network for the VM.
   - DESCRIPTION: A description for the VM deployment (optional).
   - FLIST_URL: The URL of the flist to use for the VM.
   - NODE_ID: The node ID where the VM will be deployed (optional, defaults to 1).
   - SSH_KEY: The SSH key to access the deployed VM.

3. You can run the script with the following options:
   - Deploy a VM: \`node your-script.js\`
   - Delete a VM: \`node your-script.js --delete\`

Examples:

To delete a VM, specify the VM name when prompted.

$ node your-script.js --delete
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
    return;
  }

  try {
    // Define default values
    const defaultFlistUrl = 'https://hub.grid.tf/tf-official-apps/base:latest.flist';
    const defaultVMName = 'defaultvm';
    const defaultMachineName = 'defaultmachine';
    const defaultDiskName = 'defaultdisk';
    const defaultMountPoint = '/mnt/defaultdisk';
    const defaultNetworkName = 'defaultnetwork';
    const defaultDescription = "Basic VM deployment with grid client";
    const defaultNodeId = '1';
    const defaultSSHKeyPath = path.join(os.homedir(), '.ssh', 'id_rsa.pub');  // Default SSH Key path

    // Ask user for inputs
    const finalVMName = await askForInput('Enter the VM name', process.env.VMNAME || defaultVMName);
    const finalMachineName = await askForInput('Enter the machine name', process.env.MACHINENAME || defaultMachineName);
    const finalDiskName = await askForInput('Enter the disk name', process.env.DISKNAME || defaultDiskName);
    const finalMountPoint = await askForInput('Enter the mount point', process.env.MOUNTPOINT || defaultMountPoint);
    const finalNetworkName = await askForInput('Enter the network name', process.env.NETWORK_NAME || defaultNetworkName);
    const finalDescription = await askForInput('Enter a description', process.env.DESCRIPTION || defaultDescription);
    const finalFlistUrl = await askForInput('Enter the flist URL', process.env.FLIST_URL || defaultFlistUrl);
    
    const finalNodeId = await askForInput('Enter the Node ID', process.env.NODE_ID || defaultNodeId);
    const nodeId = parseInt(finalNodeId, 10);
    if (isNaN(nodeId)) {
      throw new Error('NODE_ID must be a valid number.');
    }

    // Determine the SSH key to use
    let finalSSHKey = process.env.SSH_KEY;
    if (!finalSSHKey) {
      // Prompt for SSH key with clear instructions about using the default path
      finalSSHKey = await askForInput(`Enter your SSH key (or press ENTER to use the SSH key from "${defaultSSHKeyPath}"):`, null);
    }

    // If still no SSH key provided, read from default file
    if (!finalSSHKey) {
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
          SSH_KEY: finalSSHKey
        }
      }],
      metadata: "",
      description: finalDescription
    };

    const response = await axios.post('http://localhost:3000/machines/deploy', payload);
    console.log('VM Deployed:', response.data);
  } catch (error) {
    console.error('Error deploying VM:', error.response?.data || error.message);
  } finally {
    rl.close();
  }
}

async function deleteVM() {
  try {
    // Ask for the machine name to delete
    const finalMachineName = await askForInput('Enter the name of the machine to delete: ', null);
    
    // Prepare the request payload (adjust as needed based on API requirements)
    const payload = { name: finalMachineName }; // Assuming the API expects a name in the payload
    
    const response = await axios.post('http://localhost:3000/machines/delete', payload); // Using POST, adjust if DELETE method is needed
    console.log('VM Deleted:', response.data);
  } catch (error) {
    console.error('Error deleting VM:', error.response?.data || error.message);
  } finally {
    rl.close();
  }
}

// Execute the script based on user command line argument
const showHelp = process.argv.includes('--help') || process.argv.includes('-h');
const shouldDelete = process.argv.includes('--delete') || process.argv.includes('-d');

if (shouldDelete) {
  deleteVM();
} else {
  deployVM(showHelp);
}