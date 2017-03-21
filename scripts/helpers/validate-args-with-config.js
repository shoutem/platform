function validateArgsWtihConfig(cliArgs, config) {
  if (config.platform !== cliArgs.platform) {
    // eslint-disable-next-line max-len
    console.error(`You are trying to run app on ${cliArgs.platform}, but it's prepared for ${config.platform}`);
    console.log(`Execute 'npm run prepare-${cliArgs.platform}' first.`);
    process.exit(1);
  }
}

module.exports = validateArgsWtihConfig;
