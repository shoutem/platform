'use strict';

// This script is inspired by runAndroid script from React Native by Facebook

const childProcess = require('child_process');
const path = require('path');
const ps = require('ps-node');

function runWatchInNewWindow() {
  const scriptFile = /^win/.test(process.platform) ?
    'launchWatch.bat' :
    'launchWatch.command';
  const packagerDir = path.resolve(__dirname);
  const launchWatcherScript = path.resolve(packagerDir, scriptFile);
  ps.lookup({
    arguments: launchWatcherScript,
  }, (error, runningWatchers) => {
    if (error) {
      console.log(`Error: ${error} while searching for running watchers`);
    }
    if (!runningWatchers.length) {
      const procConfig = { cwd: packagerDir };

      if (process.platform === 'darwin') {
        childProcess.spawnSync('open', [launchWatcherScript], procConfig);
      } else if (process.platform === 'linux') {
        procConfig.detached = true;
        childProcess.spawn('sh', [launchWatcherScript], procConfig);
      } else if (/^win/.test(process.platform)) {
        procConfig.detached = true;
        procConfig.stdio = 'ignore';
        childProcess.spawn('cmd.exe', ['/C', 'start', launchWatcherScript], procConfig);
      } else {
        console.log(`Cannot start the watcher. Unknown platform ${process.platform}`);
      }
    } else {
      console.log('Watcher already running');
    }
  });
}

module.exports = runWatchInNewWindow;
