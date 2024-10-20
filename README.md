<h1> TFGrid SDK HTTP Server with Docker </h1>

<h2>Table of Contents</h2>

- [Introduction](#introduction)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Logs](#logs)
- [Test the API](#test-the-api)
- [Requests with Curl](#requests-with-curl)
- [Requests with Javascript](#requests-with-javascript)
  - [Prerequisites](#prerequisites-1)
  - [Create a Farm](#create-a-farm)
  - [Deploy a VM](#deploy-a-vm)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Introduction

This project sets up a Docker container running the TFGrid SDK HTTP server, which provides an API for interacting with the ThreeFold Grid.

## Prerequisites

- Docker
- Docker Compose

## Setup

1. Clone this repository:
   ```
   git clone https://github.com/Mik-TF/grid_http_server_docker
   cd grid_http_server_docker
   ```

2. Create a `config.json` file in the project root with your configuration. You can use the file `config.json.template` as a template. Here is an example:
   ```json
   {
     "network": "dev",
     "mnemonic": "your TFGrid mnemonic here",
     "storeSecret": "some-secret"
     "keypairType": "sr25519"
   }
   ```
   Replace the values with your actual configuration.

3. Build the Docker image:
   ```
   docker buildx build -t grid_http_server .
   ```

## Usage

1. Start the server:
   ```
   docker-compose up -d
   ```

2. The server will be available at `http://localhost:3000`

3. To stop the server:
   ```
   docker-compose down
   ```

## API Endpoints

The server exposes several endpoints for interacting with the ThreeFold Grid. Here are some examples:

- `GET /`: Health check
- `POST /twins`: Create a new twin
- `GET /twins/:twinId`: Get twin information
- `POST /contracts`: Create a new contract
- `GET /contracts/:contractId`: Get contract information

For a full list of endpoints and their usage, please refer to the [TFGrid SDK documentation](https://github.com/threefoldtech/tfgrid-sdk-ts).

## Logs

To view the server logs:
```
docker-compose logs -f grid3_client
```

## Test the API

Once you set up the API, you can test it with a basic ping-pong request:

```
http://localhost:3000/ping
```

This in a browser should return `pong`.

You can also use curl:

```
curl http://localhost:3000/ping
```

## Requests with Curl

- Ping the server:
```bash
curl http://localhost:3000/ping
```

- Create a farm:
```bash
curl -X POST http://localhost:3000/farms/create \
     -H "Content-Type: application/json" \
     -d '{"name": "MyNewFarm", "publicIps": []}'
```

- Get farm info by farm ID:
```bash
curl http://localhost:3000/farms/getFarmByID \
     -H "Content-Type: application/json" \
     -d '{"id": 1}'
```

## Requests with Javascript

### Prerequisites

- Install axios
   ```
   npm install axios
   ```

### Create a Farm

- Create a farm
  - File name: `createFarm.js`
  - File content:
   ```js
   const axios = require('axios');

   async function createFarm() {
   try {
      const response = await axios.post('http://localhost:3000/farms/create', {
         name: "farm1230"
      });
      console.log('Farm created:', response.data);
   } catch (error) {
      console.error('Error creating farm:', error.response?.data || error.message);
   }
   }

   createFarm();
   ```
- Run the file
   ```
   node ./scripts/createFarm.js
   ```

### Deploy a VM

- Export the SSH key and node ID (e.g. with node 1)
   ```
   export SSH_KEY="$(cat ~/.ssh/id_rsa.pub)"
   export NODE_ID=1
   ```
- Deploy the VM
   ```
   node ./scripts/deployVm.js
   ```

## Troubleshooting

- If you encounter permission issues with the `config.json` file, ensure it has the correct read permissions.
- If the server isn't accessible, check that port 3000 isn't being used by another application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This repo is under the [Apache 2.0 license](./LICENSE).