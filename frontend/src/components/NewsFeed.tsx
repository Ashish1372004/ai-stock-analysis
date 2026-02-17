import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ExternalLink, Clock, Newspaper } from 'lucide-react';
import { NewsCardSkeleton } from './Skeleton';

interface NewsItem {
    title: string;
    link: string;
    publisher: string;
    providerPublishTime: string;
    type: string;
    recency: string;
}

const NewsFeed: React.FC<{ symbol?: string; compact?: boolean }> = ({ symbol, compact = false }) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const url = symbol ? `/api/news?symbol=${symbol}` : '/api/news';
                const res = await axios.get(url);
                setNews(res.data);
            } catch (err) {
                console.error("News fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [symbol]);

    if (loading) return (
        <div className={compact ? "flex flex-wrap gap-2 animate-pulse" : "space-y-8 px-1"}>
            {compact ? (
                [...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 w-32 bg-slate-800 rounded-full"></div>
                ))
            ) : (
                <div className="space-y-4">
                    <div className="h-2 w-32 bg-slate-800 rounded animate-pulse mb-6"></div>
                    {[...Array(3)].map((_, i) => <NewsCardSkeleton key={i} />)}
                </div>
            )}
        </div>
    );

    if (news.length === 0) return (
        <div className="text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-3xl font-black uppercase text-[9px] tracking-widest">
            No recent intel
        </div>
    );

    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {news.map((item, idx) => (
                    <motion.a
                        key={idx}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="px-4 py-2 bg-slate-800/50 hover:bg-accent border border-slate-700/50 hover:border-accent rounded-full text-[10px] font-bold text-slate-300 hover:text-white transition-all whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                        title={item.title}
                    >
                        {item.title}
                    </motion.a>
                ))}
            </div>
        );
    }

    const freshNews = news.filter(n => n.recency === 'FRESH');
    const previousNews = news.filter(n => n.recency === 'PREVIOUS');

    return (
        <div className="space-y-12">
            <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <Newspaper className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">Market Pulse Feed</h2>
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest pl-11">Live Indian Market Intelligence Aggregator</p>
            </div>

            <div className="space-y-8">
                {freshNews.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 px-1 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            Live & Fresh (Breakthroughs)
                        </h3>
                        {freshNews.map((item, idx) => (
                            <NewsCard key={'fresh' + idx} item={item} idx={idx} />
                        ))}
                    </div>
                )}

                {previousNews.length > 0 && (
                    <div className="space-y-4 pt-6 border-t border-slate-800/50">
                        <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 px-1">
                            <Clock className="w-3 h-3" />
                            Previous Intel (Last 14 Days)
                        </h3>
                        {previousNews.map((item, idx) => (
                            <NewsCard key={'prev' + idx} item={item} idx={idx} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const NewsCard: React.FC<{ item: NewsItem; idx: number }> = ({ item, idx }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group bg-slate-900/60 border border-slate-800/50 rounded-[2.5rem] p-8 hover:bg-slate-800/80 hover:border-accent/40 transition-all shadow-2xl relative overflow-hidden"
    >
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Publisher Avatar & Metadata */}
            <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-emerald-500/20 flex items-center justify-center text-xs font-black text-accent border border-accent/10">
                            {item.publisher.substring(0, 1)}
                        </div>
                        <div>
                            <span className="block text-sm font-black text-slate-100">{item.publisher}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Intelligence Node</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live</span>
                    </div>
                </div>

                {/* News Title */}
                <h3 className="text-xl md:text-2xl font-black text-slate-50 group-hover:text-accent transition-colors leading-tight">
                    {item.title}
                </h3>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Clock className="w-4 h-4 text-accent/50" />
                            {new Date(item.providerPublishTime).toLocaleDateString()}
                        </div>
                        {item.recency === 'FRESH' && (
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black border border-emerald-500/20 uppercase tracking-tighter">New Alpha</span>
                        )}
                    </div>

                    <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group/btn"
                    >
                        Read Intel <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>

            {/* Side Branding/Thumbnail Placeholder */}
            <div className="hidden lg:flex w-32 h-32 rounded-[2rem] bg-slate-800/40 border border-slate-700/50 items-center justify-center overflow-hidden shrink-0 group-hover:bg-slate-700/20 transition-all">
                <div className="relative">
                    <Newspaper className="w-10 h-10 text-slate-600 group-hover:text-accent group-hover:scale-110 transition-all" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-slate-900 group-hover:animate-ping"></div>
                </div>
            </div>
        </div>
    </motion.div>
);

export default NewsFeed;
