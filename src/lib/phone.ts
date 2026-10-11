/**
 * Smart phone mask for Russian and Kazakhstan phone numbers (+7 ...).
 * Allows smooth typing, pasting, and natural erasing with Backspace.
 */
export function formatRussianPhone(raw: string): string {
  if (raw === '+' || raw === '+7' || raw === '+7 ') return '+7 (';
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  let nationalDigits = digits;
  if (digits.startsWith('7') || digits.startsWith('8')) {
    nationalDigits = digits.slice(1);
  }

  // If user only entered '7' or '8', display '+7 (' so user sees the country code
  if (nationalDigits.length === 0) {
    return '+7 (';
  }

  nationalDigits = nationalDigits.slice(0, 10);

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
  if (!newVal || newVal.trim() === '') {
    return '';
  }

  // If user typed '+' directly into empty input
  if (newVal === '+' && (!prevVal || prevVal.trim() === '')) {
    return '+7 (';
  }

  // If user was backspacing (string is shorter)
  if (newVal.length < prevVal.length) {
    // If erased down to the prefix, clear completely
    if (newVal === '+' || newVal === '+7' || newVal === '+7 ' || newVal === '+7 (') {
      return '';
    }

    const prevDigits = prevVal.replace(/\D/g, '');
    const newDigits = newVal.replace(/\D/g, '');

    // If user deleted formatting symbol like ')', '-', or ' ', remove the preceding digit too
    if (newDigits.length === prevDigits.length && newDigits.length > 0) {
      const trimmed = newDigits.slice(0, -1);
      if (!trimmed || trimmed === '7' || trimmed === '8') return '';
      return formatRussianPhone(trimmed);
    }

    // If only '7' or '8' remain after erasing, clear the input
    if (newDigits === '7' || newDigits === '8' || newDigits.length <= 1) {
      return '';
    }
  }

  return formatRussianPhone(newVal);
}

