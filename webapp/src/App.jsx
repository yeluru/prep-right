import { useState, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import InputForm from './components/InputForm.jsx';
import ResultsView from './components/ResultsView.jsx';
import ApiKeyBanner from './components/ApiKeyBanner.jsx';

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('gemini');
  const [isGenerating, setIsGenerating] = useState(false);
  const [markdown, setMarkdown] = useState('');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef(null);
  const abortRef = useRef(null);

  const handleGenerate = useCallback(async ({ jdText, resumeText }) => {
    if (!apiKey) {
      setError(`Please enter your ${provider === 'gemini' ? 'Gemini' : provider === 'openai' ? 'OpenAI' : 'Claude'} API key first.`);
      return;
    }

    setIsGenerating(true);
    setMarkdown('');
    setError('');
    setShowResults(true);
    setProgress('Initializing AI model...');

    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, jdText, resumeText, provider }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Server error');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6);
          try {
            const event = JSON.parse(json);
            if (event.type === 'chunk') {
              setMarkdown((prev) => prev + event.text);
              setProgress('Generating your prep guide...');
            } else if (event.type === 'status') {
              setProgress(event.message);
            } else if (event.type === 'error') {
              setError(event.message);
              setIsGenerating(false);
              return;
            } else if (event.type === 'done') {
              setProgress('');
              setIsGenerating(false);
              return;
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      setIsGenerating(false);
      setProgress('');
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
      setIsGenerating(false);
    }
  }, [apiKey, provider]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    setProgress('');
  }, []);

  const handleReset = useCallback(() => {
    setMarkdown('');
    setShowResults(false);
    setError('');
    setProgress('');
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      {!showResults && <Hero />}
      <ApiKeyBanner apiKey={apiKey} setApiKey={setApiKey} provider={provider} setProvider={setProvider} />
      {!showResults ? (
        <InputForm onGenerate={handleGenerate} isGenerating={isGenerating} />
      ) : (
        <div ref={resultsRef}>
          <ResultsView
            markdown={markdown}
            isGenerating={isGenerating}
            progress={progress}
            error={error}
            onStop={handleStop}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
}
