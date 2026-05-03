import { useState } from 'react';
import { Key, ExternalLink, Eye, EyeOff, Check, ChevronDown } from 'lucide-react';

const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    placeholder: 'AIzaSy...',
    helpUrl: 'https://aistudio.google.com/apikey',
    helpText: 'Get free key',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpText: 'Get API key',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    id: 'claude',
    name: 'Claude',
    placeholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/settings/keys',
    helpText: 'Get API key',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
  },
];

export default function ApiKeyBanner({ apiKey, setApiKey, provider, setProvider }) {
  const [showKey, setShowKey] = useState(false);
  const [inputValue, setInputValue] = useState(apiKey);
  const [showDropdown, setShowDropdown] = useState(false);

  const currentProvider = PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  const handleSave = () => {
    setApiKey(inputValue.trim());
  };

  const handleProviderChange = (newProvider) => {
    setProvider(newProvider);
    setShowDropdown(false);
    // Clear the key when switching providers
    setInputValue('');
    setApiKey('');
  };

  const isSet = apiKey.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
      <div className={`glass rounded-xl p-4 ${isSet ? 'border-emerald-500/20' : 'border-gold-400/20 pulse-glow'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Provider selector */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentProvider.bgColor} border border-slate-700 hover:border-slate-600 transition-colors text-sm font-medium`}
            >
              <Key className={`w-4 h-4 ${currentProvider.color}`} />
              <span className={currentProvider.color}>{currentProvider.name}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 z-50 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleProviderChange(p.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-slate-700/50 transition-colors ${
                        p.id === provider ? 'bg-slate-700/30' : ''
                      }`}
                    >
                      <Key className={`w-4 h-4 ${p.color}`} />
                      <span className="text-slate-200">{p.name}</span>
                      {p.id === provider && <Check className="w-3 h-3 text-emerald-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-slate-200">
              {isSet ? `${currentProvider.name} key set` : `Enter your ${currentProvider.name} API Key`}
            </span>
          </div>

          <div className="flex-1 flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder={currentProvider.placeholder}
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
              href={currentProvider.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 text-xs text-navy-400 hover:text-navy-300 transition-colors"
            >
              {currentProvider.helpText} <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
