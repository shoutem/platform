const blacklist = require('metro/src/blacklist');

/**
 * Default configuration for the CLI.
 *
 * If you need to override any of this functions do so by defining the file
 * `rn-cli.config.js` on the root of your project with the functions you need
 * to tweak.
 */
const config = {
  /**
   * Returns a regular expression for modules that should be ignored by the
   * packager on a given platform.
   */
  getBlacklistRE() {
    return blacklist([
      /\/extensions\/.*\/server\/.*/,
      /\/extensions\/.*\/app\/build(\.js|\/.*)/,
      /\/scripts\/.*/,
      /\/packages\/.*/,
    ]);
  },
};

module.exports = config;
