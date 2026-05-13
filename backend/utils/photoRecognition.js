/**
 * Optional meal photo analysis.
 * Replace with TensorFlow.js model inference or call Google Vision / other API.
 *
 * @param {Buffer} _buffer - raw image bytes (unused in stub)
 * @returns {Promise<{ label: string, confidence: number, estimatedCalories: number | null }>}
 */
async function analyzeMealPhoto(_buffer) {
  return {
    label: "unknown_meal",
    confidence: 0,
    estimatedCalories: null,
  };
}

module.exports = { analyzeMealPhoto };
