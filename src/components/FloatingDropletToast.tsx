import React from 'react';
import { Droplets, Sparkles, Check } from 'lucide-react';
import { usePermaculture } from '../context/PermacultureContext';

export const FloatingDropletToast: React.FC = () => {
  const { tipFeedbackList } = usePermaculture();

  if (tipFeedbackList.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none">
      {tipFeedbackList.map(item => (
        <div
          key={item.id}
          className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-emerald-500/50 shadow-2xl text-stone-900 dark:text-stone-100 animate-in slide-in-from-bottom duration-300"
        >
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Droplets className="h-5 w-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 font-mono font-bold text-cyan-600 dark:text-cyan-300 text-sm">
              <span>+{item.amount} Rain Drops 💧</span>
              {item.amount >= 500 && (
                <span className="text-xs text-emerald-400 font-normal">
                  ({(item.amount / 500).toFixed(1)} 🪣)
                </span>
              )}
              <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Planted the rain for {item.recipientName} 🌧️</p>
          </div>
        </div>
      ))}
    </div>
  );
};
