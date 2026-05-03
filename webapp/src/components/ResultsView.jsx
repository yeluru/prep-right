import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, StopCircle, RotateCcw, ChevronDown, ChevronRight,
  Target, BookOpen, MessageSquare, Calendar, HelpCircle, Shield,
  AlertTriangle, Layers, FileText, Award, Sparkles, Briefcase,
  Building2, Users, Search, Lightbulb
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const SECTION_META = {
  'preface': { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  'the job description': { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  'company intelligence brief': { icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  'competitive context': { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  'decode the role': { icon: Search, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  'fit analysis': { icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  'gap briefings': { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  'knowledge domains': { icon: Lightbulb, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  'story arsenal': { icon: Award, color: 'text-gold-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  'mock q&a': { icon: MessageSquare, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  '30-60-90 day vision': { icon: Calendar, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  'questions to ask': { icon: HelpCircle, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
  'the hard questions': { icon: Shield, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  'multi-round strategy': { icon: Layers, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  'post-interview strategy': { icon: Briefcase, color: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/20' },
  'interview day reference card': { icon: Sparkles, color: 'text-gold-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
};

function getMetaForTitle(title) {
  const lower = title.toLowerCase();
  for (const [key, meta] of Object.entries(SECTION_META)) {
    if (lower.includes(key)) return meta;
  }
  return { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
}

function parseSections(markdown) {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const sections = [];
  let current = null;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) {
      if (current) sections.push(current);
      current = { title: h2Match[1].trim(), content: '' };
    } else if (current) {
      current.content += line + '\n';
    } else {
      // Content before first section
      if (!sections.length && line.trim()) {
        if (!current) current = { title: 'Overview', content: '' };
        current.content += line + '\n';
      }
    }
  }
  if (current) sections.push(current);
  return sections;
}

function SectionCard({ section, index, defaultOpen }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const meta = getMetaForTitle(section.title);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`glass rounded-2xl overflow-hidden border ${meta.border} glow-border`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${meta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-white truncate">{section.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {Math.ceil(section.content.split(/\s+/).length / 200)} min read
          </p>
        </div>
        <div className="text-slate-500">
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 prose-rolefit">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SectionNav({ sections, activeIndex }) {
  return (
    <nav className="hidden lg:block fixed right-4 top-24 w-56 glass rounded-xl p-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Sections</div>
      {sections.map((s, i) => {
        const meta = getMetaForTitle(s.title);
        return (
          <button
            key={i}
            onClick={() => {
              const el = document.getElementById(`section-${i}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
              i === activeIndex ? 'bg-navy-600/20 text-navy-300' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${meta.color.replace('text-', 'bg-')}`} />
            <span className="truncate">{s.title}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default function ResultsView({ markdown, isGenerating, progress, error, onStop, onReset }) {
  const sections = useMemo(() => parseSections(markdown), [markdown]);

  return (
    <section className="pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto lg:mr-64">
        {/* Status bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-navy-400"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{progress || 'Generating...'}</span>
              </motion.div>
            )}
            {!isGenerating && markdown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-emerald-400"
              >
                <Sparkles className="w-4 h-4" />
                <span>Guide complete — {sections.length} sections</span>
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isGenerating && (
              <button
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                <StopCircle className="w-3.5 h-3.5" /> Stop
              </button>
            )}
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section, i) => (
            <div key={i} id={`section-${i}`}>
              <SectionCard
                section={section}
                index={i}
                defaultOpen={i < 3}
              />
            </div>
          ))}
        </div>

        {/* Streaming indicator */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 glass rounded-xl p-4 flex items-center gap-3"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-navy-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-navy-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-navy-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-slate-400">AI is writing your prep guide...</span>
          </motion.div>
        )}

        {/* Section navigation */}
        {sections.length > 2 && <SectionNav sections={sections} />}
      </div>
    </section>
  );
}
