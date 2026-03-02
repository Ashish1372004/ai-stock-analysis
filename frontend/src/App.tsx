import React, { useState, useEffect } from 'react';
import api from './lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, TrendingUp, Shield, Layout, Newspaper } from 'lucide-react';
import CandleChart from './components/CandleChart';
import RecommendationCard from './components/RecommendationCard';
import StockTile from './components/StockTile';
import NewsFeed from './components/NewsFeed';
import { AlertsSystem, AdviserPanel } from './components/AdvisorySystem';
import { StockTileSkeleton } from './components/Skeleton';

const App: React.FC = () => {
    const [symbol, setSymbol] = useState('');
    const [analysis, setAnalysis] = useState<any>(null);
    const [recommendation, setRecommendation] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState<'dashboard' | 'analysis' | 'news' | 'alerts' | 'advisory'>(() => {
        return (localStorage.getItem('activeTab') as any) || 'dashboard';
    });

    useEffect(() => {
        localStorage.setItem('activeTab', view);
    }, [view]);

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchAnalysis = async (s: string) => {
        if (!s || s.trim() === "") return;
        setLoading(true);
        try {
            const [analysisRes, recRes, chartRes] = await Promise.all([
                api.get(`/api/analyze/${s}`),
                api.get(`/api/recommendation/${s}`),
                api.get(`/api/charts/${s}/candlestick`)
            ]);
            setAnalysis(analysisRes.data);
            setRecommendation(recRes.data);
            setChartData(chartRes.data);
            setView('analysis');
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWatchlist = async () => {
        setLoading(true); // Prioritize dashboard loading
        try {
            const res = await api.get('/api/watchlist');
            setWatchlist(res.data);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAnalysis(symbol);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar (Simplified) */}
            <aside className="w-20 lg:w-24 bg-slate-900 border-r border-slate-800 flex flex-col p-4 items-center">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-10 shadow-lg shadow-accent/20 cursor-pointer" onClick={() => setView('dashboard')}>
                    <TrendingUp className="text-white w-7 h-7" />
                </div>

                <nav className="flex-1 space-y-6">
                    {[
                        { icon: Layout, label: 'Dashboard', id: 'dashboard' },
                        { icon: Shield, label: 'Advisory', id: 'advisory' },
                        { icon: Bell, label: 'Alerts', id: 'alerts' },
                        { icon: Newspaper, label: 'Market News', id: 'news' }
                    ].map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => setView(item.id as any)}
                            className={`p-3 rounded-xl transition-all group relative ${view === item.id ? 'bg-accent/10 text-accent' : 'text-slate-500 hover:bg-slate-800/50 hover:text-accent'}`}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="absolute left-16 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <User className="w-5 h-5 text-slate-400" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <header className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
                        <div className="text-center lg:text-left cursor-pointer" onClick={() => setView('dashboard')}>
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-1">
                                <h1 className="text-4xl font-black tracking-tight">Investment Advisor</h1>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 animate-pulse uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                    NSE Live
                                </div>
                            </div>
                            <p className="text-slate-500 font-medium italic">Empowering your Indian market portfolio with AI metrics</p>
                        </div>

                        <div className="flex items-center gap-4 w-full lg:w-auto">
                            <form onSubmit={handleSearch} className="relative flex-1 lg:w-96 shadow-2xl shadow-accent/5">
                                <input
                                    type="text"
                                    value={symbol}
                                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                    placeholder="Search Stock (e.g. RELIANCE)"
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 focus:ring-4 focus:ring-accent/20 focus:border-accent outline-none transition-all backdrop-blur-xl font-bold"
                                />
                                <Search className="absolute left-4 top-4.5 text-slate-400 w-5 h-5" />
                            </form>
                        </div>
                    </header>

                    <AnimatePresence mode="wait">
                        {view === 'dashboard' && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black">Top Investment Ideas</h2>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/20">LOW RISK</span>
                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-full border border-amber-500/20">NSE ONLY</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {loading && watchlist.length === 0 ? (
                                        [...Array(6)].map((_, i) => <StockTileSkeleton key={i} />)
                                    ) : (
                                        watchlist.map((stock, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                            >
                                                <StockTile stock={stock} onClick={fetchAnalysis} />
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {view === 'news' && (
                            <motion.div
                                key="news"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto"
                            >
                                <h2 className="text-3xl font-black mb-8 underline decoration-emerald-500/30 underline-offset-8">Indian Market Intel</h2>
                                <NewsFeed />
                            </motion.div>
                        )}

                        {view === 'alerts' && (
                            <motion.div
                                key="alerts"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto"
                            >
                                <AlertsSystem />
                            </motion.div>
                        )}

                        {view === 'advisory' && (
                            <motion.div
                                key="advisory"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black mb-2">NSE Advisory Terminal</h2>
                                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">AI Strategic Planning & Risk Management</p>
                                </div>
                                <AdviserPanel />
                            </motion.div>
                        )}

                        {view === 'analysis' && (
                            <motion.div
                                key="analysis"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                            >
                                <button
                                    onClick={() => setView('dashboard')}
                                    className="mb-8 flex items-center gap-2 text-slate-500 hover:text-accent font-bold text-xs uppercase tracking-widest transition-colors"
                                >
                                    ← Back to Ideas
                                </button>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    <div className="lg:col-span-8 space-y-8">
                                        <div className="glass-card p-8">
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <h2 className="text-5xl font-black mb-2">{analysis?.symbol}</h2>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-slate-400 font-medium">{analysis?.name || 'Sector Analysis'}</p>
                                                        <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-black text-slate-500">NSE INDIA</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-4xl font-black text-white">₹{analysis?.last_price?.toLocaleString()}</p>
                                                    <p className={`text-lg font-bold ${analysis?.change_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {analysis?.change_percent >= 0 ? '+' : ''}{analysis?.change_percent?.toFixed(2)}%
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="h-px bg-slate-800 mb-8"></div>

                                            <div className="min-h-[400px]">
                                                {chartData.length > 0 ? (
                                                    <CandleChart data={chartData} />
                                                ) : (
                                                    <div className="h-[400px] flex items-center justify-center text-slate-500 italic">
                                                        Visualizing historical patterns...
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="glass-card p-6">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Risk Rating</span>
                                                <p className={`text-2xl font-black ${analysis?.risk_level === 'LOW' ? 'text-emerald-400' :
                                                    analysis?.risk_level === 'HIGH' ? 'text-rose-400' : 'text-amber-400'
                                                    }`}>{analysis?.risk_level}</p>
                                            </div>
                                            <div className="glass-card p-6">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Investment Horizon</span>
                                                <p className="text-2xl font-black text-white uppercase">{analysis?.recommended_holding.replace('_', ' ')}</p>
                                            </div>
                                            <div className="glass-card p-6">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">AI Confidence</span>
                                                <p className="text-2xl font-black text-accent">{analysis?.confidence}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4 space-y-8">
                                        {recommendation && <RecommendationCard recommendation={recommendation} />}
                                        <div className="glass-card p-6">
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Associated Market Intel</h3>
                                            <NewsFeed symbol={analysis?.symbol} compact={true} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default App;
