const axios = require('axios');

async function deployVM() {
  try {
    const nodeId = parseInt(process.env.NODE_ID, 10);
    if (isNaN(nodeId)) {
      throw new Error('NODE_ID environment variable is not set or is not a valid number');
    }

    const payload = {
      name: "testvm1",
      network: {
        ip_range: "10.201.0.0/16",
        name: "testnetwork1",
        addAccess: true
      },
      machines: [{
        name: "testmachine1",
        node_id: nodeId,
        disks: [
          {
            name: "testdisk1",
            size: 10,
            mountpoint: "/testmount"
          }
        ],
        public_ip: false,
        planetary: false,
        mycelium: true,
        cpu: 1,
        memory: 512,
        rootfs_size: 1,
        flist: "https://hub.grid.tf/tf-official-apps/base:latest.flist",
        entrypoint: "/sbin/zinit init",
        env: {
          SSH_KEY: process.env.SSH_KEY
        }
      }],
      metadata: "",
      description: "Test VM deployment"
    };

    const response = await axios.post('http://localhost:3000/machines/deploy', payload);
    console.log('VM Deployed:', response.data);
  } catch (error) {
    console.error('Error deploying VM:', error.response?.data || error.message);
  }
}

deployVM();