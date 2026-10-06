/**
 * Smart phone mask for Russian phone numbers (+7 ...).
 * Allows smooth typing, pasting, and natural erasing with Backspace.
 */
export function formatRussianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  // If empty or only the country code without user input, clear completely
  if (!digits || digits === '7' || digits === '8') return '';

  let nationalDigits = digits;
  if (digits.startsWith('7') || digits.startsWith('8')) {
    nationalDigits = digits.slice(1);
  }
  nationalDigits = nationalDigits.slice(0, 10);
  if (nationalDigits.length === 0) return '';

  let formatted = '+7 (' + nationalDigits.slice(0, 3);
  if (nationalDigits.length > 3) {
    formatted += ') ' + nationalDigits.slice(3, 6);
  }
  if (nationalDigits.length > 6) {
    formatted += '-' + nationalDigits.slice(6, 8);
  }
  if (nationalDigits.length > 8) {
    formatted += '-' + nationalDigits.slice(8, 10);
  }
  return formatted;
}

export function handlePhoneInput(newVal: string, prevVal: string): string {
  // If user erased everything
  if (!newVal || newVal.trim() === '' || newVal === '+7' || newVal === '+7 ' || newVal === '+') {
    return '';
  }

  const prevDigits = prevVal.replace(/\D/g, '');
  const newDigits = newVal.replace(/\D/g, '');

  // If user pressed backspace (shorter string) but digits didn't decrease
  // (e.g. user deleted ')', ' ', or '-'), also remove the last digit
  if (newVal.length < prevVal.length && newDigits.length === prevDigits.length && newDigits.length > 0) {
    const trimmedDigits = newDigits.slice(0, -1);
    return formatRussianPhone(trimmedDigits);
  }

  return formatRussianPhone(newVal);
}

