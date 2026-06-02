/**
 * --------------------------------------------------------------------------
 * System Console Logging Utility Module
 * --------------------------------------------------------------------------
 * Action item for Divya:
 * Type out descriptive JSDoc comments for the function parameters below!
 * Expound on the color escape codes (\x1b[32m, \x1b[31m) in your comments.
 * --------------------------------------------------------------------------
 */

function info(message) {
  // Hand-write a comment explaining how this prints in green!
  console.log('\x1b[32m%s\x1b[0m', `[INFO] ${message}`);
}

function warn(message) {
  // Hand-write a comment explaining how this prints in yellow!
  console.log('\x1b[33m%s\x1b[0m', `[WARN] ${message}`);
}

function error(message, err) {
  // Hand-write a comment explaining how this prints in red and handles exceptions!
  console.error('\x1b[31m%s\x1b[0m', `[ERROR] ${message}`);
  if (err) {
    console.error(err);
  }
}

module.exports = {
  info,
  warn,
  error
};
