import { PhoneCall } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2250708531111"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-transform transform hover:scale-110 z-50 flex items-center justify-center"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <PhoneCall className="h-6 w-6" />
    </a>
  );
}
