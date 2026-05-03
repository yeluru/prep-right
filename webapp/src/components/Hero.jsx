import { motion } from 'framer-motion';
import { Sparkles, FileText, Target, Zap } from 'lucide-react';

const features = [
  { icon: Target, title: 'Fit Analysis', desc: 'Honest scoring against every JD requirement' },
  { icon: FileText, title: 'Story Arsenal', desc: 'CERT story cards from your real experience' },
  { icon: Sparkles, title: 'Mock Q&A', desc: '12+ model answers across interview layers' },
  { icon: Zap, title: 'Free AI', desc: 'Powered by Google Gemini — zero cost' },
];

export default function Hero() {
  return (
    <section className="pt-28 pb-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
            <span className="text-white">Your interview </span>
            <span className="gradient-text">advantage</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Paste a job posting and your resume. Get a comprehensive, AI-powered prep guide
            with fit analysis, gap briefings, story cards, and mock Q&A — all for free.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="glass rounded-xl p-4 glow-border hover:border-navy-400/30 transition-all duration-300"
            >
              <f.icon className="w-6 h-6 text-navy-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-white mb-1">{f.title}</div>
              <div className="text-xs text-slate-400">{f.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
