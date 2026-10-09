import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { showToast } from '../hooks/useToast.js';
import {
  Database, Server, ShieldCheck, CheckCircle2, Copy, Play,
  Code, Layers, Search, Plus, RefreshCw, ChevronRight, Terminal, ArrowLeft
} from 'lucide-react';

interface MongoArchitecturePageProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const MongoArchitecturePage: React.FC<MongoArchitecturePageProps> = ({ onNavigate }) => {
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
    loadArchitecture();
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
              Database Engineering & Specs
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              MongoDB Connected
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900">
            MongoDB Architecture & CRUD Implementation
          </h1>

          <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
            Detailed guide for managing service, provider, customer, appointment dates, conflict-free time slots, and Indian geolocation addresses using MongoDB document schemas and aggregation pipelines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start md:self-auto cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('steps')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            activeTab === 'steps'
              ? 'bg-[#0F4C5C] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          1. Steps to Build MongoDB
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            activeTab === 'architecture'
              ? 'bg-[#0F4C5C] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          2. Schema Design (Service, Provider, Customer, Date, Time, Location)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('crud')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
            activeTab === 'crud'
              ? 'bg-[#0F4C5C] text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          3. Live CRUD Operations Playground
        </button>
      </div>

      {/* TAB 1: STEPS TO BUILD MONGODB */}
      {activeTab === 'steps' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[
              { num: '01', title: 'Connection & Pool', desc: 'Mongoose Atlas connection string & error listeners' },
              { num: '02', title: 'Schemas & Indexes', desc: 'Partial unique & 2dsphere location indexes' },
              { num: '03', title: 'Auth & Encryption', desc: 'Bcrypt password hashing & JWT token payload' },
              { num: '04', title: 'CRUD Endpoints', desc: 'REST API controllers for all collections' },
              { num: '05', title: 'Aggregations', desc: 'Grouping revenue & calculating provider trust' }
            ].map(item => (
              <div key={item.num} className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
                <span className="text-xl font-bold font-serif-display text-[#E36414] font-mono block mb-1">
                  {item.num}
                </span>
                <h4 className="font-semibold text-stone-900 text-xs">{item.title}</h4>
                <p className="text-[11px] text-stone-500 mt-1 leading-normal">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {architectureData?.stepsToBuild?.map((step: any) => (
              <div
                key={step.step}
                className="bg-white p-6 rounded-[22px] border border-stone-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center font-bold text-xs font-mono">
                      0{step.step}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-stone-900">
                      {step.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(step.codeSnippet, `step_${step.step}`)}
                    className="text-xs text-stone-400 hover:text-[#0F4C5C] flex items-center gap-1 cursor-pointer"
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

      {/* TAB 2: SCHEMA DESIGN */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[22px] border border-stone-200/90 shadow-2xs space-y-4">
            <h3 className="text-lg font-bold font-serif-display text-stone-900">
              Detailed Description: Managing Entities in MongoDB
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <span className="text-base">🛠️</span>
                <h4 className="font-bold text-stone-900">Service Collection</h4>
                <p className="text-stone-600 leading-relaxed">
                  Stores 8 repair categories, descriptions, INR rate cards, labor durations, and keywords for problem-first text search indexing.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <span className="text-base">🧑‍🔧</span>
                <h4 className="font-bold text-stone-900">Provider Collection</h4>
                <p className="text-stone-600 leading-relaxed">
                  Maintains craftspeople references, trade experience years, ratings, trust scores, and weekly working day/slot availability arrays.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <span className="text-base">👤</span>
                <h4 className="font-bold text-stone-900">Customer (User) Collection</h4>
                <p className="text-stone-600 leading-relaxed">
                  Stores authentication credentials, bcrypt password hashes, contact phones, and embedded Indian residential addresses.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <span className="text-base">📅</span>
                <h4 className="font-bold text-stone-900">Date & Time Slot Engine</h4>
                <p className="text-stone-600 leading-relaxed">
                  Enforces zero slot conflicts using a compound partial unique index on <code className="text-[#0F4C5C] font-mono">providerId + date + timeSlot</code>.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <span className="text-base">📍</span>
                <h4 className="font-bold text-stone-900">Location Management</h4>
                <p className="text-stone-600 leading-relaxed">
                  Handles Indian style addresses with Flat/House No, Building, Street, Area, City, PIN code and GeoJSON 2dsphere points for geospatial distance queries.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5">
                <span className="text-base">⭐</span>
                <h4 className="font-bold text-stone-900">Review & Trust Engine</h4>
                <p className="text-stone-600 leading-relaxed">
                  Post-save hooks automatically compute provider average ratings and increment jobs done upon verified work completion.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {architectureData?.collections?.map((col: any) => (
              <div
                key={col.name}
                className="bg-white p-6 rounded-[22px] border border-stone-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg bg-stone-100 font-mono font-bold text-xs text-[#0F4C5C]">
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

                <div className="bg-stone-950 text-teal-300 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-stone-800 max-h-64">
                  <pre><code>{col.schemaDefinition}</code></pre>
                </div>

                {col.indexes && (
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="font-semibold text-stone-700">Indexes:</span>
                    {col.indexes.map((idx: any, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-mono border border-stone-200">
                        {idx.fields} ({idx.type})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE CRUD PLAYGROUND */}
      {activeTab === 'crud' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[22px] border border-stone-200/90 shadow-2xs space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-[#0F4C5C] uppercase tracking-wider">
                Live Query Runner
              </span>
              <h3 className="text-lg font-bold font-serif-display text-stone-900 mt-0.5">
                Execute CRUD Operations on MongoDB
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Trigger real Mongoose operations on the active backend and view raw query output.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Operation Type</label>
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
                <label className="text-xs font-semibold text-stone-700 block mb-1">Collection</label>
                <select
                  value={selectedCollection}
                  onChange={e => setSelectedCollection(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 font-medium"
                >
                  <option value="services">db.services</option>
                  <option value="providers">db.providers</option>
                  <option value="bookings">db.bookings</option>
                  <option value="users">db.users</option>
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
                  <span>{runningQuery ? 'Running...' : 'Run MongoDB Query'}</span>
                </button>
              </div>
            </div>

            {selectedOperation === 'insert' && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-stone-600 font-medium block mb-1">New Service Name</label>
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

          <div className="bg-stone-950 rounded-2xl p-5 border border-stone-800 text-stone-200 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-stone-400 text-xs">MongoDB Query Output</span>
              </div>
              {queryExplanation && (
                <span className="text-[11px] text-teal-400">
                  {queryExplanation}
                </span>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {queryResult ? (
                <pre className="text-emerald-400 leading-relaxed">
                  {JSON.stringify(queryResult, null, 2)}
                </pre>
              ) : (
                <p className="text-stone-500 italic">
                  Select parameters above and click "Run MongoDB Query" to test live execution.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
