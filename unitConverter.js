export function convertUnits(value, sourceUnit, targetUnit) {
  const s = sourceUnit.toLowerCase();
  const t = targetUnit.toLowerCase();

  // Temperature
  if (s === "celsius" && t === "fahrenheit") {
    return (value * 9/5) + 32;
  }

  if (s === "fahrenheit" && t === "celsius") {
    return (value - 32) * 5/9;
  }

  // Distance
  if ((s === "kilometers" || s === "km") &&
      (t === "miles" || t === "mi")) {
    return value * 0.621371;
  }

  if ((s === "miles" || s === "mi") &&
      (t === "kilometers" || t === "km")) {
    return value / 0.621371;
  }

  // Weight
  if ((s === "kilograms" || s === "kg") &&
      (t === "pounds" || t === "lb")) {
    return value * 2.20462;
  }

  if ((s === "pounds" || s === "lb") &&
      (t === "kilograms" || t === "kg")) {
    return value / 2.20462;
  }

  throw new Error(`Conversion from ${s} to ${t} not supported.`);
}