import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { showToast } from '../../hooks/useToast.js';
import {
  Database, Server, ShieldCheck, CheckCircle2, Copy, Play,
  Code, Layers, Search, Plus, RefreshCw, X, ChevronRight, Terminal
} from 'lucide-react';

interface MongoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MongoStudioModal: React.FC<MongoStudioModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'steps' | 'architecture' | 'crud'>('steps');
  const [architectureData, setArchitectureData] = useState<any>(null);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // CRUD Simulator states
  const [selectedOperation, setSelectedOperation] = useState<'find' | 'insert' | 'aggregate'>('find');
  const [selectedCollection, setSelectedCollection] = useState<'services' | 'providers' | 'bookings' | 'users'>('services');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryExplanation, setQueryExplanation] = useState<string>('');
  const [runningQuery, setRunningQuery] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form for live insert test
  const [insertServiceName, setInsertServiceName] = useState('Balcony Waterproofing & Sealant');
  const [insertPrice, setInsertPrice] = useState(899);

  useEffect(() => {
    if (isOpen) {
      loadArchitecture();
    }
  }, [isOpen]);

  const loadArchitecture = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/mongodb/overview');
      if (res.success) {
        setArchitectureData(res.data);
        setLiveStats(res.liveStats);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load MongoDB specs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunQuery = async () => {
    setRunningQuery(true);
    try {
      const payload = selectedOperation === 'insert' ? {
        name: insertServiceName,
        category: 'plumbing',
        basePrice: insertPrice,
        description: 'Doorstep waterproofing service with polyurethane sealant.'
      } : {};

      const res = await api.post('/api/mongodb/query', {
        operation: selectedOperation,
        collection: selectedCollection,
        payload
      });

      if (res.success) {
        setQueryResult(res.result);
        setQueryExplanation(res.queryExplanation);
        showToast('MongoDB Query executed successfully!', 'success');
        if (selectedOperation === 'insert') {
          loadArchitecture();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Query execution failed', 'error');
    } finally {
      setRunningQuery(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    showToast('Code copied to clipboard', 'info');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FBF7F0] w-full max-w-5xl max-h-[92vh] rounded-[28px] border border-stone-200/90 shadow-2xl flex flex-col overflow-hidden text-stone-900">
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-white border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-serif-display text-stone-900">
                  MongoDB Architecture & Engine Hub
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold uppercase tracking-wider">
                  Mongoose / MongoDB
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Service, Provider, Customer, Date, Time & Location management specifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-stone-100/80 border-b border-stone-200 flex items-center justify-between gap-4 overflow-x-auto text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('steps')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'steps'
                  ? 'bg-white text-[#0F4C5C] shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Steps to Build MongoDB
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-white text-[#0F4C5C] shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Schema Architecture & Location Specs
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('crud')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                activeTab === 'crud'
                  ? 'bg-white text-[#0F4C5C] shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Live CRUD Operations Simulator
            </button>
          </div>

          {liveStats && (
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-stone-500">
              <span className="flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live DB Connected
              </span>
              <span>Services: <strong className="text-stone-800">{liveStats.serviceCount}</strong></span>
              <span>Providers: <strong className="text-stone-800">{liveStats.providerCount}</strong></span>
              <span>Bookings: <strong className="text-stone-800">{liveStats.bookingCount}</strong></span>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: STEPS TO BUILD MONGODB */}
          {activeTab === 'steps' && (
            <div className="space-y-6">
              
              {/* Introduction Banner */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                <span className="text-[11px] font-semibold text-[#0F4C5C] uppercase tracking-wider">
                  Comprehensive Blueprint
                </span>
                <h3 className="text-lg font-bold font-serif-display text-stone-900">
                  How HomeHaven is Built on MongoDB
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  HomeHaven manages services, craftspeople, customers, dates, time slots, and Indian geographic locations using MongoDB. Follow these five verified steps to build, validate, and scale the database layer.
                </p>
              </div>

              {/* 5 Sequential Steps */}
              <div className="space-y-4">
                {architectureData?.stepsToBuild?.map((step: any) => (
                  <div
                    key={step.step}
                    className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center font-bold text-xs font-mono">
                          0{step.step}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900">
                          {step.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(step.codeSnippet, `step_${step.step}`)}
                        className="text-xs text-stone-400 hover:text-[#0F4C5C] flex items-center gap-1 cursor-pointer"
                        title="Copy code"
                      >
                        {copiedCode === `step_${step.step}` ? (
                          <span className="text-emerald-700 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Copied</span>
                        ) : (
                          <span className="flex items-center gap-1"><Copy className="w-3.5 h-3.5" /> Copy Code</span>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="relative bg-stone-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-stone-800">
                      <pre><code>{step.codeSnippet}</code></pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SCHEMA ARCHITECTURE & LOCATION SPECS */}
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-2">
                <span className="text-[11px] font-semibold text-[#0F4C5C] uppercase tracking-wider">
                  Data Modeling Breakdown
                </span>
                <h3 className="text-lg font-bold font-serif-display text-stone-900">
                  Managing Service, Provider, Customer, Date, Time & Location in MongoDB
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                    <strong className="text-stone-900 block mb-1">📅 Date & Time Locking</strong>
                    <span className="text-stone-600">Compound partial unique index on (providerId + date + timeSlot) excludes cancelled jobs and prevents double bookings.</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                    <strong className="text-stone-900 block mb-1">📍 Indian Location & Geo</strong>
                    <span className="text-stone-600">Embedded addresses with line, city, PIN code, and GeoJSON 2dsphere points for proximity sorting.</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                    <strong className="text-stone-900 block mb-1">🔐 Auth & Credentials</strong>
                    <span className="text-stone-600">Mongoose pre-save hook with bcryptjs (10 salt rounds) + signed JWT tokens with RBAC claims.</span>
                  </div>
                </div>
              </div>

              {/* Collections Schemas */}
              <div className="space-y-4">
                {architectureData?.collections?.map((col: any) => (
                  <div
                    key={col.name}
                    className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-100 font-mono font-bold text-xs text-[#0F4C5C]">
                          db.{col.name}
                        </span>
                        <span className="text-xs text-stone-500">{col.description}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(col.schemaDefinition, `col_${col.name}`)}
                        className="text-xs text-stone-400 hover:text-[#0F4C5C] flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Schema</span>
                      </button>
                    </div>

                    <div className="bg-stone-950 text-teal-300 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-stone-800 max-h-60">
                      <pre><code>{col.schemaDefinition}</code></pre>
                    </div>

                    {/* Indexes list */}
                    {col.indexes && (
                      <div className="pt-2 border-t border-stone-100">
                        <span className="text-[11px] font-semibold text-stone-700 block mb-1.5">
                          Indexes Configured:
                        </span>
                        <div className="flex flex-wrap gap-2 text-[11px]">
                          {col.indexes.map((idx: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-mono border border-stone-200">
                              {idx.fields} ({idx.type})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE CRUD OPERATIONS SIMULATOR */}
          {activeTab === 'crud' && (
            <div className="space-y-6">
              
              <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs space-y-3">
                <span className="text-[11px] font-semibold text-[#0F4C5C] uppercase tracking-wider">
                  Interactive MongoDB Playground
                </span>
                <h3 className="text-lg font-bold font-serif-display text-stone-900">
                  Execute Real CRUD Queries on the Live Database
                </h3>
                <p className="text-xs text-stone-600">
                  Select an operation and collection to execute live Mongoose commands against the running backend engine.
                </p>

                {/* Operation Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Operation</label>
                    <select
                      value={selectedOperation}
                      onChange={e => setSelectedOperation(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    >
                      <option value="find">READ (find + populate)</option>
                      <option value="insert">CREATE (insertOne)</option>
                      <option value="aggregate">ANALYZE (aggregate $group)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">Target Collection</label>
                    <select
                      value={selectedCollection}
                      onChange={e => setSelectedCollection(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                    >
                      <option value="services">db.services (8 categories)</option>
                      <option value="providers">db.providers (Specialists)</option>
                      <option value="bookings">db.bookings (Appointments)</option>
                      <option value="users">db.users (Customers/Admins)</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleRunQuery}
                      disabled={runningQuery}
                      className="w-full py-2.5 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{runningQuery ? 'Running...' : 'Execute MongoDB Query'}</span>
                    </button>
                  </div>
                </div>

                {/* If insert selected, show inputs */}
                {selectedOperation === 'insert' && (
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-stone-600 font-medium block mb-1">Service Name</label>
                      <input
                        type="text"
                        value={insertServiceName}
                        onChange={e => setInsertServiceName(e.target.value)}
                        className="w-full p-2 bg-white rounded-lg border border-stone-200"
                      />
                    </div>
                    <div>
                      <label className="text-stone-600 font-medium block mb-1">Base Price in INR (₹)</label>
                      <input
                        type="number"
                        value={insertPrice}
                        onChange={e => setInsertPrice(Number(e.target.value))}
                        className="w-full p-2 bg-white rounded-lg border border-stone-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Execution Console & Live Output */}
              <div className="bg-stone-950 rounded-2xl p-5 border border-stone-800 text-stone-200 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-stone-400 text-xs">MongoDB Query Shell Output</span>
                  </div>
                  {queryExplanation && (
                    <span className="text-[11px] text-teal-400">
                      {queryExplanation}
                    </span>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {queryResult ? (
                    <pre className="text-emerald-400 leading-relaxed">
                      {JSON.stringify(queryResult, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-stone-500 italic">
                      Click "Execute MongoDB Query" above to inspect the live response document.
                    </p>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0F4C5C]" />
            <span>MongoDB Data Protection: Passwords Bcrypt Hashed · Compound Slots Guard Active</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
