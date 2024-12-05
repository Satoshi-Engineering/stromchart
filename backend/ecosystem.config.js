module.exports = {
  // PM2 Run Configuration
  apps: [
    {
      name: 'stromchart-backend',
      script: './build/backend/index.js',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'stromchart-backend-develop',
      script: './build/backend/index.js',
      env: {
      },
    },
  ],
}
