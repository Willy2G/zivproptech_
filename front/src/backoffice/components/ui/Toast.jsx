import { CheckCircle } from 'lucide-react';

export default function Toast({ message }) {
  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 z-50 toast-in">
      <CheckCircle className="h-5 w-5 text-green-400" />
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}
