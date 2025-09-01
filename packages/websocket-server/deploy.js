#!/usr/bin/env node

/**
 * Deployment helper script for the WebSocket server
 * Usage: node deploy.js [--local|--docker|--railway]
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)
const mode = args[0] || '--local'

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`)
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with exit code ${code}`))
      }
    })
  })
}

function checkEnvFile() {
  const envPath = path.join(__dirname, '.env')
  if (!fs.existsSync(envPath)) {
    console.log('Creating .env file with default values...')
    const envContent = `# WebSocket Server Environment Variables
NODE_ENV=development
WS_PORT=1234
HEALTH_PORT=1235
LOG_LEVEL=debug
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
MAX_CONNECTIONS_PER_IP=10
`
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Created .env file with development defaults!')
  }
}

async function deployLocal() {
  console.log('🚀 Starting local development server...')
  checkEnvFile()
  
  try {
    await runCommand('npm', ['install'])
    console.log('✅ Dependencies installed')
    
    console.log('🔧 Building TypeScript...')
    await runCommand('npm', ['run', 'build'])
    console.log('✅ TypeScript compiled')
    
    console.log('🔧 Starting server in development mode...')
    await runCommand('npm', ['run', 'dev'])
  } catch (error) {
    console.error('❌ Local deployment failed:', error.message)
    process.exit(1)
  }
}

async function deployDocker() {
  console.log('🐳 Building and running Docker container...')
  
  try {
    await runCommand('docker', ['build', '-t', 'websocket-server', '.'])
    console.log('✅ Docker image built')
    
    console.log('🔧 Starting Docker container...')
    await runCommand('docker', ['run', '-p', '8080:8080', '-p', '8081:8081',
      '-e', 'NODE_ENV=production',
      '-e', 'WS_PORT=8080',
      '-e', 'HEALTH_PORT=8081',
      '-e', 'LOG_LEVEL=info',
      '-e', 'ALLOWED_ORIGINS=http://localhost:3000',
      'websocket-server'
    ])
  } catch (error) {
    console.error('❌ Docker deployment failed:', error.message)
    process.exit(1)
  }
}

function deployRailway() {
  console.log('🚂 Railway deployment instructions:')
  console.log('')
  console.log('1. Push your code to GitHub')
  console.log('2. Go to https://railway.app')
  console.log('3. Create new project → Deploy from GitHub repo')
  console.log('4. Set Root Directory to: packages/websocket-server')
  console.log('5. Add environment variables:')
  console.log('   - NODE_ENV=production')
  console.log('   - ALLOWED_ORIGINS=https://app.rayai.app')
  console.log('   - LOG_LEVEL=info')
  console.log('6. Deploy!')
  console.log('')
  console.log('📋 Files ready for Railway deployment:')
  console.log('   ✅ railway.toml (with TypeScript build)')
  console.log('   ✅ Dockerfile (with multi-stage build)')
  console.log('   ✅ package.json (with build scripts)')
  console.log('   ✅ TypeScript source code')
  console.log('')
  console.log('🔍 Health check available at: /health')
  console.log('🌐 WebSocket endpoint: wss://your-app.railway.app')
}

function showHelp() {
  console.log('WebSocket Server Deployment Helper')
  console.log('')
  console.log('Usage: node deploy.js [option]')
  console.log('')
  console.log('Options:')
  console.log('  --local    Start local development server (default)')
  console.log('  --docker   Build and run Docker container')
  console.log('  --railway  Show Railway deployment instructions')
  console.log('  --help     Show this help message')
  console.log('')
  console.log('Environment Variables:')
  console.log('  NODE_ENV          Environment mode (development/production)')
  console.log('  WS_PORT           WebSocket server port (default: 1234)')
  console.log('  HEALTH_PORT       Health check port (default: 1235)')
  console.log('  LOG_LEVEL         Logging level (debug/info/warn/error)')
  console.log('  ALLOWED_ORIGINS   Comma-separated list of allowed origins')
  console.log('  MAX_CONNECTIONS_PER_IP  Maximum connections per IP (default: 10)')
}

// Main execution
switch (mode) {
  case '--local':
    deployLocal()
    break
  case '--docker':
    deployDocker()
    break
  case '--railway':
    deployRailway()
    break
  case '--help':
    showHelp()
    break
  default:
    console.error(`Unknown option: ${mode}`)
    showHelp()
    process.exit(1)
}