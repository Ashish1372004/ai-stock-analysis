from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import pandas as pd
from .models import AnalysisResult, Recommendation, OHLC, NewsItem, Alert, AdviserSummary
from .analysis import AnalysisEngine
from .recommendations import RecommendationService
from .services import StockDataService
from datetime import datetime
from typing import Optional
from .database import init_db, get_db
from sqlalchemy.orm import Session
from fastapi import Depends
import uuid
import os

# Initialize database on startup
init_db()

app = FastAPI(title="AI-Stock Market Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online", "message": "AI-Stock Market Analysis AI is active"}

@app.get("/api/analyze/{symbol}", response_model=AnalysisResult)
async def analyze_stock(symbol: str):
    if not symbol or symbol == "undefined":
        raise HTTPException(status_code=400, detail="Invalid symbol")
    result = AnalysisEngine.analyze_stock(symbol)
    if result.overall_score == 0:
        raise HTTPException(status_code=404, detail=f"Data for {symbol} not found")
    return result

@app.get("/api/recommendation/{symbol}", response_model=Recommendation)
async def get_recommendation(symbol: str):
    if not symbol or symbol == "undefined":
        raise HTTPException(status_code=400, detail="Invalid symbol")
    recommendation = RecommendationService.generate_recommendation(symbol)
    if recommendation.confidence <= 0:
        raise HTTPException(status_code=404, detail=f"Unable to generate recommendation for {symbol}")
    return recommendation

@app.get("/api/charts/{symbol}/candlestick", response_model=List[OHLC])
async def get_candlestick_data(symbol: str):
    try:
        if not symbol or symbol == "undefined":
            raise HTTPException(status_code=400, detail="Symbol cannot be empty")
            
        history = StockDataService.fetch_historical_data(symbol, period="1mo")
        if history.empty:
            # Try a longer period if 1mo fails
            history = StockDataService.fetch_historical_data(symbol, period="3mo")
            
        if history.empty:
            raise HTTPException(status_code=404, detail=f"No data for {symbol}")
        
        ohlc_data = []
        for index, row in history.iterrows():
            # Skip rows with NaN values which can cause 500 errors
            if pd.isna(row['Open']) or pd.isna(row['Close']):
                continue
                
            ohlc_data.append(OHLC(
                timestamp=index.to_pydatetime() if hasattr(index, 'to_pydatetime') else index,
                open=float(row['Open']),
                high=float(row['High']),
                low=float(row['Low']),
                close=float(row['Close']),
                volume=int(row['Volume']) if not pd.isna(row['Volume']) else 0
            ))
        return ohlc_data
    except Exception as e:
        import traceback
        print(f"Candlestick Data Error for {symbol}: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/news", response_model=List[NewsItem])
async def get_market_news(symbol: Optional[str] = None):
    try:
        if symbol:
            news = StockDataService.fetch_news(symbol)
        else:
            news = StockDataService.fetch_aggregated_indian_news()
            
        formatted_news = []
        now = datetime.utcnow()
        
        for item in news:
            try:
                # Handle nested 'content' from newer yfinance versions or flat dictionary
                data = item.get('content') if isinstance(item.get('content'), dict) else item
                
                title = data.get('title') or data.get('headline') or "Market Update"
                link = data.get('clickThroughUrl', {}).get('url') if isinstance(data.get('clickThroughUrl'), dict) else data.get('link', '#')
                publisher = data.get('providerName') or data.get('publisher') or "Market Intel"
                
                # Fetch timestamp (can be int or ISO string)
                raw_ts = data.get('pubDate') or data.get('providerPublishTime')
                ts = None
                
                if isinstance(raw_ts, int):
                    ts = datetime.fromtimestamp(raw_ts)
                elif isinstance(raw_ts, str):
                    try:
                        # ISO format: 2026-02-17T03:57:49Z
                        ts = datetime.fromisoformat(raw_ts.replace('Z', '+00:00'))
                    except:
                        pass
                
                if not ts:
                    continue
                
                # Normalize both to UTC-like for comparison if needed, or just compare naive
                # For simplicity, we compare aware if possible or naive
                if ts.tzinfo is not None:
                    # Compare aware with aware (now in UTC)
                    from datetime import timezone
                    diff = datetime.now(timezone.utc) - ts
                else:
                    diff = now - ts
                
                # Recency Logic (Inclusive of 14 days)
                total_hours = diff.total_seconds() / 3600
                if total_hours < 0: # Future news (TZ mismatch?)
                    recency = "FRESH"
                elif total_hours <= 48:
                    recency = "FRESH"
                elif total_hours <= 168: # 7 days
                    recency = "PREVIOUS"
                elif total_hours <= 336: # 14 days
                    recency = "PREVIOUS"
                else:
                    continue # Skip older than 14 days
                
                formatted_news.append(NewsItem(
                    title=title,
                    link=link,
                    publisher=publisher,
                    providerPublishTime=ts,
                    type=data.get('type', 'STORY'),
                    recency=recency
                ))
            except Exception as e:
                print(f"Error formatting news item: {e}")
                continue
        return formatted_news[:25]
    except Exception as e:
        print(f"General News Error: {e}")
        return []

@app.get("/api/alerts", response_model=List[Alert])
async def get_alerts(db: Session = Depends(get_db)):
    from .models import AlertDB
    alerts = db.query(AlertDB).all()
    return [
        Alert(
            id=a.id,
            symbol=a.symbol,
            type=a.type,
            condition=a.condition,
            threshold=a.threshold,
            is_active=bool(a.is_active),
            created_at=a.created_at
        ) for a in alerts
    ]

@app.post("/api/alerts", response_model=Alert)
async def create_alert(alert_data: dict, db: Session = Depends(get_db)):
    from .models import AlertDB
    new_alert = AlertDB(
        id=str(uuid.uuid4()),
        symbol=alert_data['symbol'],
        type=alert_data['type'],
        condition=alert_data['condition'],
        threshold=alert_data['threshold'],
        is_active=1
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return Alert(
        id=new_alert.id,
        symbol=new_alert.symbol,
        type=new_alert.type,
        condition=new_alert.condition,
        threshold=new_alert.threshold,
        is_active=True,
        created_at=new_alert.created_at
    )

@app.delete("/api/alerts/{alert_id}")
async def delete_alert(alert_id: str, db: Session = Depends(get_db)):
    from .models import AlertDB
    alert = db.query(AlertDB).filter(AlertDB.id == alert_id).first()
    if alert:
        db.delete(alert)
        db.commit()
    return {"status": "deleted"}

@app.get("/api/adviser/summary", response_model=AdviserSummary)
async def get_adviser_summary():
    try:
        # Real logic: Get Nifty 50 News to determine Market Mood
        news = StockDataService.fetch_news("^NSEI")
        mood = "NEUTRAL"
        positive_words = ["growth", "rally", "up", "buy", "bull", "surge", "gain", "strengthen", "high"]
        negative_words = ["drop", "fall", "sell", "bear", "crash", "loss", "low", "weaken", "concern"]
        
        score = 0
        if news:
            for item in news[:10]:
                title = (item.get('title') or '').lower()
                score += sum(1 for w in positive_words if w in title)
                score -= sum(1 for w in negative_words if w in title)
        
        mood = "BULLISH" if score > 2 else ("BEARISH" if score < -2 else "NEUTRAL")
        
        watchlist = ["RELIANCE", "TCS", "TATAMOTORS", "HDFCBANK", "INFY"]
        picks = []
        for s in watchlist:
            try:
                analysis = AnalysisEngine.analyze_stock(s)
                if analysis.overall_score > 0:
                    picks.append(analysis)
            except Exception as e: 
                print(f"Adviser failed analyzing {s}: {e}")
                continue
            
        return {
            "overview": f"The Indian market sentiment is currently {mood}. Based on recent intelligence, focus remains on large-cap stability.",
            "top_picks": picks[:4],
            "risk_assessment": "Moderate risk. Volatility in global markets may impact NSE sentiments.",
            "market_mood": mood
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/watchlist", response_model=List[AnalysisResult])
async def get_watchlist():
    # Diversified Indian Stocks for Investment Advisory MVP
    symbols = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "TATAMOTORS", "ITC", "ADANIENT", "BHARTIARTL"]
    results = []
    for s in symbols:
        try:
            analysis = AnalysisEngine.analyze_stock(s)
            if analysis.overall_score > 0:
                results.append(analysis)
        except Exception as e:
            print(f"Error pre-fetching {s}: {e}")
            continue
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
