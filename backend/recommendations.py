from typing import List
from .models import Recommendation, AnalysisResult, Factor
from .analysis import AnalysisEngine

class RecommendationService:
    @staticmethod
    def generate_recommendation(symbol: str) -> Recommendation:
        analysis = AnalysisEngine.analyze_stock(symbol)
        
        action = "HOLD"
        if analysis.overall_score >= 80: action = "STRONG_BUY"
        elif analysis.overall_score >= 65: action = "BUY"
        elif analysis.overall_score <= 30: action = "STRONG_SELL"
        elif analysis.overall_score <= 45: action = "SELL"
        
        factors = []
        rsi = analysis.indicators.get("RSI", 50.0)
        factors.append(Factor(
            name="Technical RSI",
            value=str(rsi),
            impact="POSITIVE" if rsi < 40 else ("NEGATIVE" if rsi > 70 else "NEUTRAL"),
            weight=0.4
        ))
        
        price_vs_sma = analysis.indicators.get("Price_vs_SMA50", 0.0)
        factors.append(Factor(
            name="Trend (Price vs SMA50)",
            value=f"{price_vs_sma}%",
            impact="POSITIVE" if price_vs_sma > 0 else "NEGATIVE",
            weight=0.3
        ))
        
        return Recommendation(
            symbol=symbol,
            action=action,
            confidence=analysis.confidence,
            rationale=f"Analysis suggests a {action} position. Predicted trend is {analysis.trend} with a potential target of ₹{analysis.target_price}.",
            key_factors=factors,
            direction="UP" if analysis.trend == "UP" else "DOWN",
            risk_level=analysis.risk_level,
            recommended_holding=analysis.recommended_holding,
            target_price=analysis.target_price
        )
