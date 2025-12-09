const alphabet = "abcdefghijklmnopqrstuvwxyz";
const A_LETTER_CODEPOINT = "1f1e6";

const incrementCodepoint = (codePoint: string, incrementBy: number): string => {
  const decimal = parseInt(codePoint, 16);
  return (decimal + incrementBy).toString(16);
};

const codepoints: Record<string, string> = alphabet.split("").reduce(
  (obj, currentLetter, index) => ({
    ...obj,
    [currentLetter]: incrementCodepoint(A_LETTER_CODEPOINT, index),
  }),
  {}
);
export const getFlagCodepoint = (iso2: string) => {
  if (!iso2 || iso2.length !== 2) return "";
  const lower = iso2.toLowerCase();
  const first = codepoints[lower[0]];
  const second = codepoints[lower[1]];
  if (!first || !second) return "";
  return `${first}-${second}`;
};
