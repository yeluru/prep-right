import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link2, FileUp, Type, Loader2, ArrowRight, X, FileText } from 'lucide-react';

export default function InputForm({ onGenerate, isGenerating }) {
  const [jdMode, setJdMode] = useState('url'); // 'url' | 'text'
  const [jdUrl, setJdUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeMode, setResumeMode] = useState('file'); // 'file' | 'text'
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isFetchingJd, setIsFetchingJd] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setIsUploadingResume(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/upload-resume', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setResumeText(data.text);
    } catch (err) {
      setError(`Failed to extract resume: ${err.message}`);
      setResumeFile(null);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let finalJdText = jdText;

    if (jdMode === 'url') {
      if (!jdUrl.trim()) {
        setError('Please enter a job posting URL.');
        return;
      }
      setIsFetchingJd(true);
      try {
        const res = await fetch('/api/fetch-jd', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: jdUrl.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        finalJdText = data.text;
      } catch (err) {
        setError(`Failed to fetch job posting: ${err.message}. Try pasting the text directly.`);
        setIsFetchingJd(false);
        return;
      }
      setIsFetchingJd(false);
    }

    if (!finalJdText?.trim()) {
      setError('Please provide a job description.');
      return;
    }
    if (!resumeText?.trim()) {
      setError('Please provide your resume.');
      return;
    }

    onGenerate({ jdText: finalJdText, resumeText });
  };

  return (
    <motion.section
      className="max-w-4xl mx-auto px-4 sm:px-6 pb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Description */}
        <div className="glass rounded-2xl p-6 glow-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-navy-600/30 flex items-center justify-center">
                <span className="text-sm font-bold text-navy-400">1</span>
              </div>
              Job Description
            </h2>
            <div className="flex bg-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setJdMode('url')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  jdMode === 'url' ? 'bg-navy-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" /> URL
              </button>
              <button
                type="button"
                onClick={() => setJdMode('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  jdMode === 'text' ? 'bg-navy-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" /> Paste
              </button>
            </div>
          </div>

          {jdMode === 'url' ? (
            <input
              type="url"
              placeholder="https://jobs.company.com/role-title"
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500/50"
            />
          ) : (
            <textarea
              rows={6}
              placeholder="Paste the full job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500/50 resize-none"
            />
          )}
        </div>

        {/* Resume */}
        <div className="glass rounded-2xl p-6 glow-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-navy-600/30 flex items-center justify-center">
                <span className="text-sm font-bold text-navy-400">2</span>
              </div>
              Your Resume
            </h2>
            <div className="flex bg-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setResumeMode('file')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  resumeMode === 'file' ? 'bg-navy-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileUp className="w-3.5 h-3.5" /> Upload
              </button>
              <button
                type="button"
                onClick={() => setResumeMode('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  resumeMode === 'text' ? 'bg-navy-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" /> Paste
              </button>
            </div>
          </div>

          {resumeMode === 'file' ? (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              {resumeFile ? (
                <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3">
                  <FileText className="w-5 h-5 text-navy-400 shrink-0" />
                  <span className="text-sm text-slate-200 flex-1 truncate">{resumeFile.name}</span>
                  {isUploadingResume ? (
                    <Loader2 className="w-4 h-4 text-navy-400 animate-spin" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setResumeFile(null); setResumeText(''); }}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-700 hover:border-navy-500/50 rounded-xl py-8 flex flex-col items-center gap-2 transition-all group"
                >
                  <FileUp className="w-8 h-8 text-slate-600 group-hover:text-navy-400 transition-colors" />
                  <span className="text-sm text-slate-500 group-hover:text-slate-300">
                    Click to upload PDF, DOCX, or TXT
                  </span>
                </button>
              )}
            </div>
          ) : (
            <textarea
              rows={6}
              placeholder="Paste your resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-navy-500 focus:ring-1 focus:ring-navy-500/50 resize-none"
            />
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isGenerating || isFetchingJd}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full bg-gradient-to-r from-navy-600 to-navy-500 hover:from-navy-500 hover:to-navy-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-navy-500/20"
        >
          {isGenerating || isFetchingJd ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isFetchingJd ? 'Fetching job posting...' : 'Generating...'}
            </>
          ) : (
            <>
              Generate Prep Guide <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        <p className="text-center text-xs text-slate-600">
          Powered by Google Gemini Flash (free) &middot; Your data stays between you and the API
        </p>
      </form>
    </motion.section>
  );
}
