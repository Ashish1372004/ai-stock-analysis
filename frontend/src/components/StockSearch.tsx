import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface StockSearchProps {
    onSelect: (symbol: string) => void;
    placeholder?: string;
}

const COMMON_STOCKS = [
    "RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS", "ITC", "ADANIENT", "BHARTIARTL",
    "SBIN", "ICICIBANK", "AXISBANK", "WIPRO", "HCLTECH", "ADANIPORTS", "BAJFINANCE", "ASIANPAINT"
];

const StockSearch: React.FC<StockSearchProps> = ({ onSelect, placeholder = "Search Stock..." }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length > 0) {
            const filtered = COMMON_STOCKS.filter(s => s.toLowerCase().includes(query.toLowerCase()));
            setResults(filtered);
            setIsOpen(true);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [query]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value.toUpperCase())}
                    placeholder={placeholder}
                    className="w-full bg-slate-800/95 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 focus:border-accent outline-none text-sm font-bold"
                />
                <Search className="absolute left-3 top-3.5 text-slate-500 w-4 h-4" />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    {results.map((res, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                onSelect(res);
                                setQuery('');
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-xs font-bold text-slate-300 hover:bg-accent/10 hover:text-accent transition-colors border-b border-slate-800/50 last:border-0"
                        >
                            {res}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StockSearch;
