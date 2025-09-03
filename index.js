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