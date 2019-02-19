module.exports = {
  apps: [{
    "name": "app",
    "script": "index.js",
    "node_args": [],
    "merge_logs": true,
    "vizion": true,
    "autorestart": true,
    "watch": true,
    "ignore_watch": ["node_modules", "data", "public", ".git"],
    "instance_var": "NODE_APP_INSTANCE",
    "pmx": true,
    "automation": true,
    "treekill": true,
    "username": "dingyin.ou",
    "windowsHide": true,
    "kill_retry_time": 100,
    "write": true,
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}