from typing import Dict, List
from .models import AnalysisResult, Factor
from .services import StockDataService

class AnalysisEngine:
    @staticmethod
    def analyze_stock(symbol: str) -> AnalysisResult:
        """Perform comprehensive stock analysis."""
        live_data = StockDataService.fetch_live_data(symbol)
        if not live_data:
            return AnalysisResult(
                symbol=symbol,
                overall_score=0,
                confidence=0,
                technical_score=0,
                fundamental_score=0,
                market_score=0,
                indicators={},
                trend="SIDEWAYS",
                target_price=0.0
            )
            
        history = StockDataService.fetch_historical_data(symbol)
        tech_indicators = StockDataService.calculate_technical_indicators(history)
        
        # Scoring Logic
        tech_score = AnalysisEngine._calculate_tech_score(tech_indicators)
        fund_score = AnalysisEngine._calculate_fund_score(live_data)
        
        # Prediction Logic
        trend = "UP" if tech_score > 60 else ("DOWN" if tech_score < 40 else "SIDEWAYS")
        last_price = live_data.get("last_price", history['Close'].iloc[-1] if not history.empty else 0)
        target_price = last_price * (1 + (tech_score - 50) / 100) # Simple prediction factor
        
        # Risk & Holding Logic
        volatility = history['Close'].pct_change().std() * (252**0.5) if not history.empty else 0.2
        risk_level = "HIGH" if volatility > 0.3 else ("MODERATE" if volatility > 0.15 else "LOW")
        
        holding = "LONG_TERM" if fund_score > 70 else ("MEDIUM_TERM" if fund_score > 50 else "SHORT_TERM")
        
        # Weighted Score (40% Tech, 40% Fund, 20% Mock Market Context)
        overall_score = (tech_score * 0.4) + (fund_score * 0.4) + (70 * 0.2)
        
        return AnalysisResult(
            symbol=symbol,
            name=live_data.get("name", symbol),
            overall_score=round(overall_score, 2),
            confidence=85.0 if not history.empty else 50.0,
            technical_score=tech_score,
            fundamental_score=fund_score,
            market_score=70.0,
            indicators=tech_indicators,
            trend=trend,
            risk_level=risk_level,
            recommended_holding=holding,
            last_price=float(last_price),
            change_percent=float(live_data.get("change_percent", 0.0)),
            target_price=round(target_price, 2)
        )

    @staticmethod
    def _calculate_tech_score(indicators: Dict[str, float]) -> float:
        score = 50.0
        rsi = indicators.get("RSI", 50.0)
        
        # RSI Scoring (30-70 range)
        if rsi < 30: score += 20  # Oversold (Bullish)
        elif rsi > 70: score -= 20 # Overbought (Bearish)
        else: score += (50 - abs(50 - rsi)) / 5
            
        # Price vs SMA50
        price_diff = indicators.get("Price_vs_SMA50", 0.0)
        if price_diff > 0: score += min(15, price_diff)
        else: score -= min(15, abs(price_diff))
            
        return max(0, min(100, score))

    @staticmethod
    def _calculate_fund_score(data: Dict) -> float:
        score = 60.0 # Base fundamental score
        pe = data.get("pe_ratio")
        
        if pe:
            if pe < 15: score += 15
            elif pe > 30: score -= 10
            
        return max(0, min(100, score))
