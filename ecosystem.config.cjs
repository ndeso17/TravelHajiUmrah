// PM2 ecosystem config — QA deploy Sistem Haji & Umroh
// Backend: port 3100 · Frontend: vite preview port 4174
// Tidak menyentuh PM2 apps lain (9router/SIPDIN/gnet) di port 3000/4173.
module.exports = {
  apps: [
    {
      name: 'hajiumroh-backend',
      cwd: './backend',
      script: 'src/server.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'production',
        PORT: '3100',
        FRONTEND_ORIGIN: 'http://100.98.91.68:4174',
      },
      max_memory_restart: '300M',
      autorestart: true,
      watch: false,
      time: true,
    },
    {
      name: 'hajiumroh-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'run preview -- --port 4174 --host',
      env: {
        NODE_ENV: 'production',
        VITE_PROXY_TARGET: 'http://localhost:3100',
      },
      autorestart: true,
      watch: false,
      time: true,
    },
  ],
};