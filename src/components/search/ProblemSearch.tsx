import React, { useState } from 'react';
import { matchProblemKeyword, PROBLEM_KEYWORD_MAP } from '../../utils/problemKeywords.js';
import { Search, ArrowRight, Wrench, Zap, Sparkles, Wind, Bug, Paintbrush } from 'lucide-react';

interface ProblemSearchProps {
  onSelectProblem?: (serviceId: string, query: string) => void;
  onNavigateToServices?: (searchQuery: string) => void;
}

export const ProblemSearch: React.FC<ProblemSearchProps> = ({
  onSelectProblem,
  onNavigateToServices
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const matched = query.trim() ? matchProblemKeyword(query) : [];

  const handleSelect = (serviceId: string, searchPhrase: string) => {
    if (onSelectProblem) {
      onSelectProblem(serviceId, searchPhrase);
    } else if (onNavigateToServices) {
      onNavigateToServices(searchPhrase);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      if (matched.length > 0) {
        handleSelect(matched[0].defaultServiceId, query);
      } else if (onNavigateToServices) {
        onNavigateToServices(query);
      }
    }
  };

  const popularIssues = [
    { label: 'Water leak', icon: Wrench, serviceId: 'srv_plumbing', query: 'leak' },
    { label: 'Fan not working', icon: Zap, serviceId: 'srv_electrical', query: 'fan' },
    { label: 'AC blowing warm', icon: Wind, serviceId: 'srv_ac_repair', query: 'ac' },
    { label: 'Pest infestation', icon: Bug, serviceId: 'srv_pest_control', query: 'cockroach' },
    { label: 'Deep house cleaning', icon: Sparkles, serviceId: 'srv_cleaning', query: 'clean' },
    { label: 'Room painting', icon: Paintbrush, serviceId: 'srv_painting', query: 'paint' }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto relative z-20">
      <div className="relative shadow-xl shadow-stone-900/5 rounded-2xl bg-white border border-stone-200/90 transition-all duration-200 focus-within:ring-2 focus-within:ring-[#0F4C5C]/20 focus-within:border-[#0F4C5C]">
        <div className="flex items-center px-4 py-3.5 gap-3">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what's wrong (e.g. 'faucet leaking', 'fan buzzing', 'cockroaches')..."
            className="w-full bg-transparent text-sm md:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                if (matched.length > 0) handleSelect(matched[0].defaultServiceId, query);
                else if (onNavigateToServices) onNavigateToServices(query);
              }}
              className="bg-[#0F4C5C] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#0A3642] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="hidden sm:inline-block text-[11px] text-stone-400 border border-stone-200 px-2 py-0.5 rounded font-mono">
              Press Enter
            </span>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isFocused && matched.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-stone-200 shadow-2xl p-2 space-y-1 max-h-80 overflow-y-auto z-50">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              Suggested Solutions for "{query}"
            </div>
            {matched.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={() => handleSelect(item.defaultServiceId, item.title)}
                className="w-full text-left p-3 rounded-xl hover:bg-stone-50 transition-colors flex items-start justify-between group"
              >
                <div>
                  <h5 className="text-sm font-semibold text-stone-900 group-hover:text-[#0F4C5C] flex items-center gap-2">
                    {item.title}
                  </h5>
                  <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                </div>
                <div className="flex items-center text-xs font-medium text-[#E36414] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Book Now</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Quick Problem Chips */}
      <div className="mt-3 flex items-center flex-wrap gap-2 text-xs text-stone-600">
        <span className="text-[11px] font-medium text-stone-400">Common issues:</span>
        {popularIssues.map(issue => {
          const Icon = issue.icon;
          return (
            <button
              key={issue.label}
              type="button"
              onClick={() => handleSelect(issue.serviceId, issue.label)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-stone-700 border border-stone-200/80 shadow-2xs hover:border-[#0F4C5C]/40 transition-all text-[11px] font-medium hover:text-[#0F4C5C]"
            >
              <Icon className="w-3 h-3 text-[#0F4C5C]" />
              <span>{issue.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
