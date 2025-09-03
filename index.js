const fs = require('fs');

/**
 * Step 1: Convert a number string from any base (2 to 16) to decimal integer
 * @param {string} numberString - Number in string form
 * @param {number} base - Base of the input number (2 <= base <= 16)
 * @returns {number} Decimal integer equivalent
 */
function convertToDecimal(numberString, base) {
    if (base < 2 || base > 16) {
        throw new Error("Base must be between 2 and 16");
    }

    const validDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const upperCaseNumber = numberString.toUpperCase();
    let decimalValue = 0;

    for (let charIndex = 0; charIndex < upperCaseNumber.length; charIndex++) {
        const currentChar = upperCaseNumber[charIndex];
        const digitValue = validDigits.indexOf(currentChar);

        if (digitValue === -1 || digitValue >= base) {
            throw new Error(`Invalid digit '${currentChar}' for base ${base}`);
        }

        decimalValue = decimalValue * base + digitValue;
    }

    return decimalValue;
}

/**
 * Step 2: Perform Lagrange interpolation on given points to compute
 * the constant term of the polynomial.
 * @param {Array} points - Array of points [[x1, y1], [x2, y2], ...]
 * @returns {number} Interpolated constant term value
 */
function lagrangeInterpolation(points) {
    let interpolationResult = 0;
    const numberOfPoints = points.length;

    for (let i = 0; i < numberOfPoints; i++) {
        let term = points[i][1]; // y-value of the point

        for (let j = 0; j < numberOfPoints; j++) {
            if (j !== i) {
                term *= -points[j][0] / (points[i][0] - points[j][0]);
            }
        }

        interpolationResult += term;
    }
    
    return interpolationResult;
}

/**
 * Step 3: Parse input data, convert bases, select k points, and solve
 * for the polynomial's constant term using Lagrange interpolation.
 * @param {Object} data - Parsed JSON data representing the test case
 * @returns {number} Rounded constant term
 */
function solvePolynomial(data) {
    const polynomialDegree = data.keys.n;
    const pointsNeeded = data.keys.k;

    const dataPoints = [];

    for (const [key, value] of Object.entries(data)) {
        if (key !== "keys") {
            const xCoord = parseInt(key);
            const valueBase = parseInt(value.base);
            const yValue = convertToDecimal(value.value, valueBase);
            dataPoints.push([xCoord, yValue]);
        }
    }

    if (dataPoints.length < pointsNeeded) {
        throw new Error("Not enough points to solve the polynomial!");
    }

    // Use only the first k points for interpolation
    dataPoints.length = pointsNeeded;

    // Calculate and return the rounded constant term
    const constantTerm = lagrangeInterpolation(dataPoints);
    return Math.round(constantTerm);
}

/**
 * Step 4: Read multiple test case files asynchronously and solve each polynomial.
 * Output the constant term to console for each test case.
 */
const totalTestCases = 2;

for (let testCaseIndex = 1; testCaseIndex <= totalTestCases; testCaseIndex++) {
    fs.readFile(`testcase${testCaseIndex}.json`, 'utf8', (readError, jsonString) => {
        if (readError) {
            console.error(`Error reading file for test case ${testCaseIndex}:`, readError);
            return;
        }

        try {
            const testData = JSON.parse(jsonString);
            const constantResult = solvePolynomial(testData);
            console.log(`The constant term 'c' of the polynomial in test case ${testCaseIndex} is:`, constantResult);
        } catch (parseError) {
            console.error(`Error parsing JSON for test case ${testCaseIndex}:`, parseError);
        }
    });
}