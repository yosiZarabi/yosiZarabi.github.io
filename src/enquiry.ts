export interface Enquiry {
  name: string;
  phone: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

export function validPhone(value: string): boolean {
  return /^[+\d\s().-]+$/.test(value) && /^\d{7,15}$/.test(value.replace(/\D/g, ''));
}

export function composeEmail(enquiry: Enquiry, labels: Record<keyof Enquiry, string>): string {
  return (Object.keys(enquiry) as (keyof Enquiry)[])
    .map((key) => `${labels[key]}: ${enquiry[key].trim()}`)
    .join('\n\n');
}

export function mailtoLink(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
