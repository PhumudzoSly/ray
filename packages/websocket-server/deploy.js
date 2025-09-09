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
JWT_SECRET=your-development-jwt-secret-change-in-production
NODE_ENV=development
PORT=8080
`
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Created .env file. Please update JWT_SECRET for production!')
  }
}

async function deployLocal() {
  console.log('🚀 Starting local development server...')
  checkEnvFile()
  
  try {
    await runCommand('npm', ['install'])
    console.log('✅ Dependencies installed')
    
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
    await runCommand('docker', ['run', '-p', '8080:8080', 
      '-e', 'JWT_SECRET=development-secret',
      '-e', 'NODE_ENV=production',
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
  console.log('   - JWT_SECRET=your-production-secret')
  console.log('   - NODE_ENV=production')
  console.log('6. Deploy!')
  console.log('')
  console.log('📋 Files ready for Railway deployment:')
  console.log('   ✅ railway.toml')
  console.log('   ✅ Dockerfile')
  console.log('   ✅ package.json')
  console.log('   ✅ server.js')
  console.log('   ✅ src/ directory')
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