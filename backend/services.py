import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from .models import StockDB, StockPriceHistoryDB

class StockDataService:
    @staticmethod
    def fetch_live_data(symbol: str) -> Optional[Dict]:
        """Fetch live stock data from yfinance."""
        try:
            # Add .NS for NSE if not present
            if not symbol.endswith(('.NS', '.BO')):
                symbol = f"{symbol}.NS"
                
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            if not info or 'regularMarketPrice' not in info or info['regularMarketPrice'] is None:
                # Fallback: try fetching 5d history to get the latest close
                history = ticker.history(period="5d")
                if not history.empty:
                    last_quote = history.iloc[-1]
                    prev_quote = history.iloc[-2] if len(history) > 1 else last_quote
                    name = info.get('longName') or info.get('shortName') or symbol
                    return {
                        "symbol": symbol,
                        "name": name,
                        "last_price": float(last_quote['Close']),
                        "change_percent": float(((last_quote['Close'] - prev_quote['Close']) / prev_quote['Close']) * 100),
                        "market_cap": info.get('marketCap') or 0,
                        "pe_ratio": info.get('forwardPE') or 0,
                        "updated_at": datetime.utcnow()
                    }
                return None

            return {
                "symbol": symbol,
                "name": info.get('longName') or info.get('shortName') or symbol,
                "last_price": info.get('regularMarketPrice'),
                "change_percent": info.get('regularMarketChangePercent'),
                "market_cap": info.get('marketCap'),
                "pe_ratio": info.get('forwardPE'),
                "updated_at": datetime.utcnow()
            }
        except Exception as e:
            print(f"Error fetching live data for {symbol}: {e}")
            return None

    @staticmethod
    def fetch_historical_data(symbol: str, period: str = "1y") -> pd.DataFrame:
        """Fetch historical price data."""
        if not symbol.endswith(('.NS', '.BO')):
            symbol = f"{symbol}.NS"
        ticker = yf.Ticker(symbol)
        df = ticker.history(period=period)
        return df

    @staticmethod
    def fetch_news(symbol: Optional[str] = None) -> List[Dict]:
        """Fetch news for a symbol or general market news."""
        try:
            target = symbol if symbol else "^NSEI" # Default to Nifty 50 News
            if target and not target.startswith('^') and not target.endswith(('.NS', '.BO')):
                target = f"{target}.NS"
            
            ticker = yf.Ticker(target)
            return ticker.news
        except Exception as e:
            print(f"Error fetching news for {symbol}: {e}")
            return []

    @staticmethod
    def fetch_aggregated_indian_news() -> List[Dict]:
        """Aggregates news from major NSE indices and tickers for a broad feed."""
        broad_targets = ["^NSEI", "^BSESN", "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS"]
        all_news = []
        seen_titles = set()
        
        for target in broad_targets:
            try:
                ticker = yf.Ticker(target)
                news_items = ticker.news
                if news_items:
                    for item in news_items:
                        # Handle new nested structure
                        data = item.get('content') if isinstance(item.get('content'), dict) else item
                        title = data.get('title') or data.get('headline') or ''
                        
                        if title and title not in seen_titles:
                            # Add some meta data about the source
                            item['origin_target'] = target
                            all_news.append(item)
                            seen_titles.add(title)
            except Exception as e:
                print(f"Failed fetching news for {target}: {e}")
                continue
        
        # Sort by time descending
        all_news.sort(key=lambda x: x.get('providerPublishTime', 0), reverse=True)
        return all_news[:30]

    @staticmethod
    def calculate_technical_indicators(df: pd.DataFrame) -> Dict[str, float]:
        """Calculate basic technical indicators."""
        if df.empty:
            return {}
            
        # SMA
        df['SMA_50'] = df['Close'].rolling(window=50).mean()
        df['SMA_200'] = df['Close'].rolling(window=200).mean()
        
        # RSI
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        last = df.iloc[-1]
        return {
            "RSI": round(float(last['RSI']), 2) if not pd.isna(last['RSI']) else 50.0,
            "SMA_50": round(float(last['SMA_50']), 2) if not pd.isna(last['SMA_50']) else float(last['Close']),
            "SMA_200": round(float(last['SMA_200']), 2) if not pd.isna(last['SMA_200']) else float(last['Close']),
            "Price_vs_SMA50": round(float(((last['Close'] - last['SMA_50']) / last['SMA_50']) * 100), 2) if not pd.isna(last['SMA_50']) else 0.0
        }
