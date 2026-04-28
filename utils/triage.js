/**
 * AI Smart Triage Utility
 * Classifies emergency text into types and assigns priority.
 */
const classifyEmergency = (text = "") => {
  const input = text.toLowerCase();
  
  let type = 'other';
  let priority = 'MEDIUM';

  // Keyword mapping for classification
  const keywords = {
    fire: ['fire', 'smoke', 'burning', 'blast', 'explosion', 'short circuit'],
    medical: ['heart', 'breath', 'unconscious', 'injury', 'blood', 'pain', 'ambulance', 'pregnant'],
    accident: ['crash', 'collision', 'hit', 'road', 'traffic', 'stuck', 'car'],
    crime: ['robbery', 'theft', 'fight', 'weapon', 'gun', 'threat', 'violence', 'harassment']
  };

  // High priority triggers
  const criticalKeywords = ['die', 'dying', 'dead', 'not breathing', 'massive fire', 'trapped', 'gunshot', 'bleeding heavily'];

  // Classification logic
  if (keywords.fire.some(k => input.includes(k))) type = 'fire';
  else if (keywords.medical.some(k => input.includes(k))) type = 'medical';
  else if (keywords.accident.some(k => input.includes(k))) type = 'accident';
  else if (keywords.crime.some(k => input.includes(k))) type = 'crime';

  // Priority logic
  if (criticalKeywords.some(k => input.includes(k))) {
    priority = 'HIGH';
  } else if (input.length < 10) {
    priority = 'LOW';
  }

  return { type, priority };
};

module.exports = { classifyEmergency };
