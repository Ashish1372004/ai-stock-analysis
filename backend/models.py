from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class StockDB(Base):
    __tablename__ = "stocks"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    name = Column(String)
    sector = Column(String)
    last_price = Column(Float)
    change_percent = Column(Float)
    market_cap = Column(Float)
    pe_ratio = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow)

class StockPriceHistoryDB(Base):
    __tablename__ = "price_history"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    timestamp = Column(DateTime, index=True)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Integer)

class AlertDB(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True)
    symbol = Column(String, index=True)
    type = Column(String)
    condition = Column(String)
    threshold = Column(Float)
    is_active = Column(Integer, default=1) # Boolean as int for SQLite
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class Factor(BaseModel):
    name: str
    value: str
    impact: str  # POSITIVE, NEGATIVE, NEUTRAL
    weight: float

class OHLC(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int

class NewsItem(BaseModel):
    title: str
    link: str
    publisher: str
    providerPublishTime: datetime
    type: str
    recency: str # FRESH (today/yesterday), PREVIOUS (2 days ago), OLD

class Alert(BaseModel):
    id: str
    symbol: str
    type: str # PRICE_TARGET, TREND_CHANGE, RISK_ALERT
    condition: str
    threshold: float
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AnalysisResult(BaseModel):
    symbol: str
    name: Optional[str] = None
    overall_score: float
    confidence: float
    technical_score: float
    fundamental_score: float
    market_score: float
    indicators: Dict[str, float]
    trend: str # UP, DOWN, SIDEWAYS
    risk_level: str # LOW, MODERATE, HIGH
    recommended_holding: str # SHORT_TERM, MEDIUM_TERM, LONG_TERM
    last_price: float = 0.0
    change_percent: float = 0.0
    target_price: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AdviserSummary(BaseModel):
    overview: str
    top_picks: List[AnalysisResult]
    risk_assessment: str
    market_mood: str # BULLISH, BEARISH, NEUTRAL

class Recommendation(BaseModel):
    symbol: str
    action: str  # STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL
    confidence: float
    rationale: str
    key_factors: List[Factor]
    direction: str # UP, DOWN
    risk_level: str
    recommended_holding: str
    target_price: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
