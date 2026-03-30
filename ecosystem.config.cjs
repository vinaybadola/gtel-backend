/** @type {import('pm2').App[]} */
module.exports = {
  apps: [
    {
      name: 'gtel-backend',
      script: './index.js',
      node_args: "--trace-warnings",
      max_memory_restart: "500M",
      watch: false,

      /* ===== Watch settings ===== */
      ignore_watch: ['node_modules', 'uploads', 'utils/logs', 'public', ".git", ".git/**"],

      /* ===== Environments ===== */
      env: {
        NODE_ENV: 'development',
        WATCH_MODE: true,
        watch: true,
        PORT: 8000
      },
      env_production: {
        NODE_ENV: 'production',
        WATCH_MODE: false,
        watch: false
      },
      // error_file: "/var/log/gtel-backend/error.log",
      // out_file: "/var/log/gtel-backend/output.log",
      // log_date_format: "YYYY-MM-DD HH:mm:ss",
      // merge_logs: true,
      // time: true
    },
  ],
};
