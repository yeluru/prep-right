import { useState } from 'react';
import { Key, ExternalLink, Eye, EyeOff, Check } from 'lucide-react';

export default function ApiKeyBanner({ apiKey, setApiKey }) {
  const [showKey, setShowKey] = useState(false);
  const [inputValue, setInputValue] = useState(apiKey);

  const handleSave = () => {
    setApiKey(inputValue.trim());
  };

  const isSet = apiKey.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
      <div className={`glass rounded-xl p-4 ${isSet ? 'border-emerald-500/20' : 'border-gold-400/20 pulse-glow'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Key className={`w-4 h-4 ${isSet ? 'text-emerald-400' : 'text-gold-400'}`} />
            <span className="text-sm font-medium text-slate-200">
              {isSet ? 'Gemini API Key set' : 'Enter your free Gemini API Key'}
            </span>
          </div>

          <div className="flex-1 flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500/50 pr-10 font-mono"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              onClick={handleSave}
              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                inputValue.trim() && inputValue.trim() !== apiKey
                  ? 'bg-navy-600 hover:bg-navy-500 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-default'
              }`}
              disabled={!inputValue.trim() || inputValue.trim() === apiKey}
            >
              {isSet ? <Check className="w-4 h-4" /> : 'Save'}
            </button>
          </div>

          {!isSet && (
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 text-xs text-navy-400 hover:text-navy-300 transition-colors"
            >
              Get free key <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
