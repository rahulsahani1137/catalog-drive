import fs from "fs";

function bigIntAbsolute(value) { 
  return value < 0n ? -value : value; 
}

function bigIntGreatestCommonDivisor(a, b) {
  a = bigIntAbsolute(a);
  b = bigIntAbsolute(b);
  while (b !== 0n) { 
    const temp = a % b; 
    a = b; 
    b = temp; 
  }
  return a;
}

class Fraction {
  constructor(numerator, denominator = 1n) {
    if (denominator === 0n) throw new Error("Division by zero in Fraction");
    if (denominator < 0n) { 
      numerator = -numerator; 
      denominator = -denominator; 
    }
    const gcd = bigIntGreatestCommonDivisor(numerator, denominator);
    this.numerator = numerator / gcd;
    this.denominator = denominator / gcd;
  }

  add(otherFraction) {
    return new Fraction(
      this.numerator * otherFraction.denominator + otherFraction.numerator * this.denominator,
      this.denominator * otherFraction.denominator
    );
  }

  sub(otherFraction) {
    return new Fraction(
      this.numerator * otherFraction.denominator - otherFraction.numerator * this.denominator,
      this.denominator * otherFraction.denominator
    );
  }

  mul(otherFraction) {
    return new Fraction(
      this.numerator * otherFraction.numerator,
      this.denominator * otherFraction.denominator
    );
  }

  div(otherFraction) {
    if (otherFraction.numerator === 0n) throw new Error("Division by zero in Fraction.div");
    let numerator = this.numerator * otherFraction.denominator;
    let denominator = this.denominator * otherFraction.numerator;
    if (denominator < 0n) { 
      numerator = -numerator; 
      denominator = -denominator; 
    }
    return new Fraction(numerator, denominator);
  }

  isInteger() { 
    return this.denominator === 1n; 
  }

  toString() { 
    return this.isInteger() ? this.numerator.toString() : `${this.numerator.toString()}/${this.denominator.toString()}`; 
  }
}

function charToDigitValue(character) {
  const lowerChar = character.toLowerCase();
  if (lowerChar >= '0' && lowerChar <= '9') return lowerChar.charCodeAt(0) - '0'.charCodeAt(0);
  if (lowerChar >= 'a' && lowerChar <= 'z') return 10 + (lowerChar.charCodeAt(0) - 'a'.charCodeAt(0));
  throw new Error(`Invalid digit '${character}'`);
}

function decodeStringToBigInt(numberString, base) {
  const bigBase = BigInt(base);
  let accumulator = 0n;
  for (const character of numberString.trim()) {
    const digitValue = charToDigitValue(character);
    if (digitValue >= base) throw new Error(`Digit '${character}' not valid for base ${base}`);
    accumulator = accumulator * bigBase + BigInt(digitValue);
  }
  return accumulator;
}

function lagrangeInterpolationAtZero(pointsArray) {
  let reconstructedSecret = new Fraction(0n, 1n);

  for (let i = 0; i < pointsArray.length; i++) {
    const [x_i, y_i] = pointsArray[i];
    let lagrangeTerm = new Fraction(y_i, 1n);

    for (let j = 0; j < pointsArray.length; j++) {
      if (i === j) continue;
      const [x_j] = pointsArray[j];
      const numerator = new Fraction(-x_j, 1n);
      const denominator = new Fraction(x_i - x_j, 1n);
      lagrangeTerm = lagrangeTerm.mul(numerator).div(denominator);
    }

    reconstructedSecret = reconstructedSecret.add(lagrangeTerm);
  }

  return reconstructedSecret;
}

function main() {
  const inputFile = process.argv[2] || "testcase2.json";
  const inputData = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

  if (!inputData.keys || typeof inputData.keys.k === "undefined") {
    throw new Error("Invalid JSON: missing keys.k");
  }
  const threshold = Number(inputData.keys.k);
  if (!Number.isInteger(threshold) || threshold < 2) {
    throw new Error("Invalid k");
  }

  const pointsList = [];
  for (const keyString of Object.keys(inputData)) {
    if (keyString === "keys") continue;
    const entry = inputData[keyString];
    if (!entry || typeof entry.base === "undefined" || typeof entry.value === "undefined") continue;
    const xCoord = BigInt(keyString);
    const baseNumber = Number(entry.base);
    if (!Number.isInteger(baseNumber) || baseNumber < 2 || baseNumber > 36) {
      throw new Error(`Unsupported base ${entry.base} for x=${keyString}`);
    }
    const yCoord = decodeStringToBigInt(entry.value, baseNumber);
    pointsList.push([xCoord, yCoord]);
  }

  if (pointsList.length < threshold) {
    throw new Error(`Not enough points. Have ${pointsList.length}, need k=${threshold}`);
  }

  pointsList.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const selectedPoints = pointsList.slice(0, threshold);

  const secretFraction = lagrangeInterpolationAtZero(selectedPoints);

  if (secretFraction.isInteger()) {
    console.log(secretFraction.numerator.toString());
  } else {
    console.log(secretFraction.toString());
  }
}

main();