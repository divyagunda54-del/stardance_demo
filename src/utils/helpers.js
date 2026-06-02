/**
 * --------------------------------------------------------------------------
 * Core Formatting and Telemetry Helper Utilities
 * --------------------------------------------------------------------------
 * Action item for Divya:
 * Type out your own helper functions inside this module!
 * You can write:
 * 1. A function to format the current date/time nicely.
 * 2. A helper to parse username strings safely.
 * --------------------------------------------------------------------------
 */

/**
 * Returns a human-readable, formatted timestamp
 * @returns {string} The formatted timestamp
 */
function getTimestamp() {
  // Hand-write your timestamp logic or write detailed comments here!
  return new Date().toISOString();
}

/**
 * Cleans user input strings by stripping special markdown codes
 * @param {string} input - The raw input string
 * @returns {string} The sanitized clean string
 */
function sanitizeInput(input) {
  // Hand-write comments explaining how to parse raw text safely!
  return input.trim();
}

module.exports = {
  getTimestamp,
  sanitizeInput
};
