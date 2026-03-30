module.exports = {
  apps: [{
    name: "gtel-backend",
    script: "./index.js",
    cwd: "/var/www/gtel-backend",
    instances: 1,
    exec_mode: "fork",
    autorestart: true,
    watch: false,
    max_memory_restart: "500M",
    env: {
      NODE_ENV: "development",
      PORT: 8000
    },
    env_production: {
      NODE_ENV: "production"
    },
    error_file: "/var/log/gtel-backend/error.log",
    out_file: "/var/log/gtel-backend/output.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true,
    time: true
  }]
};