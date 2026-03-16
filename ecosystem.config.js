module.exports = {
  apps: [
    {
      name: 'tradepotion-frontend',
      cwd: '/home/tom/projects/tradepotion-public',
      script: 'node_modules/.bin/next',
      args: 'start -p 3001',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
        PORT: '3001'
      },
      restart_delay: 3000,
      max_restarts: 10
    },
    {
      name: 'tradepotion-backend',
      cwd: '/home/tom/projects/tradepotion-public/backend',
      script: '/home/tom/projects/tradepotion-public/backend/venv/bin/uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8090',
      interpreter: 'none',
      env: {
        DATABASE_URL: 'postgresql://tradepotion:a5be90b7555d9492766fe97618bb037f@127.0.0.1:5433/tradepotion_tracker'
      },
      restart_delay: 3000,
      max_restarts: 10
    }
  ]
}
