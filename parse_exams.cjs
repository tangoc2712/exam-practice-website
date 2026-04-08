const { spawnSync } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'split_exams.cjs');
const result = spawnSync(process.execPath, [scriptPath], { stdio: 'inherit' });

if (result.status !== 0) {
  process.exit(result.status || 1);
}
