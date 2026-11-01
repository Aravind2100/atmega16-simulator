/**
 * Intel HEX format parser for ATmega16
 * Converts Intel HEX records (:LLAAAATT[DD...]CC) to a 16-bit word array for AVR8js progMem
 */

export interface ParsedHex {
  progMem: Uint16Array;
  bytesUsed: number;
  highestByteAddress: number;
}

export function parseIntelHex(hexString: string, flashWordCount = 8192): ParsedHex {
  // ATmega16 has 16KB Flash = 8192 words (16-bit each)
  const progMem = new Uint16Array(flashWordCount);
  let bytesUsed = 0;
  let highestByteAddress = 0;
  let extendedAddress = 0;

  const lines = hexString.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(':')) continue;

    const byteCount = parseInt(trimmed.substring(1, 3), 16);
    const address = parseInt(trimmed.substring(3, 7), 16);
    const recordType = parseInt(trimmed.substring(7, 9), 16);

    if (recordType === 0x00) {
      // Data Record
      const fullAddress = extendedAddress + address;
      for (let i = 0; i < byteCount; i++) {
        const byteVal = parseInt(trimmed.substring(9 + i * 2, 11 + i * 2), 16);
        const currByteAddr = fullAddress + i;
        const wordIndex = currByteAddr >> 1;

        if (wordIndex < flashWordCount) {
          if (currByteAddr % 2 === 0) {
            // Low byte of 16-bit instruction word
            progMem[wordIndex] = (progMem[wordIndex] & 0xff00) | byteVal;
          } else {
            // High byte of 16-bit instruction word
            progMem[wordIndex] = (progMem[wordIndex] & 0x00ff) | (byteVal << 8);
          }
          bytesUsed++;
          if (currByteAddr > highestByteAddress) {
            highestByteAddress = currByteAddr;
          }
        }
      }
    } else if (recordType === 0x01) {
      // End Of File
      break;
    } else if (recordType === 0x02) {
      // Extended Segment Address
      extendedAddress = parseInt(trimmed.substring(9, 13), 16) << 4;
    } else if (recordType === 0x04) {
      // Extended Linear Address
      extendedAddress = parseInt(trimmed.substring(9, 13), 16) << 16;
    }
  }

  return {
    progMem,
    bytesUsed,
    highestByteAddress: highestByteAddress + 1,
  };
}

/**
 * Encodes a progMem array into Intel HEX format string
 */
export function encodeIntelHex(progMem: Uint16Array, wordLength: number): string {
  const lines: string[] = [];
  const bytesPerLine = 16;

  for (let wordAddr = 0; wordAddr < wordLength; wordAddr += bytesPerLine / 2) {
    const byteAddr = wordAddr * 2;
    const bytesInThisLine = Math.min(bytesPerLine, (wordLength - wordAddr) * 2);
    let checksum = bytesInThisLine + ((byteAddr >> 8) & 0xff) + (byteAddr & 0xff) + 0x00;
    let dataHex = '';

    for (let i = 0; i < bytesInThisLine / 2; i++) {
      const word = progMem[wordAddr + i];
      const low = word & 0xff;
      const high = (word >> 8) & 0xff;
      dataHex += low.toString(16).padStart(2, '0').toUpperCase();
      dataHex += high.toString(16).padStart(2, '0').toUpperCase();
      checksum += low + high;
    }

    checksum = (~checksum + 1) & 0xff;
    const lenHex = bytesInThisLine.toString(16).padStart(2, '0').toUpperCase();
    const addrHex = byteAddr.toString(16).padStart(4, '0').toUpperCase();
    const csHex = checksum.toString(16).padStart(2, '0').toUpperCase();

    lines.push(`:${lenHex}${addrHex}00${dataHex}${csHex}`);
  }

  lines.push(':00000001FF');
  return lines.join('\n');
}
