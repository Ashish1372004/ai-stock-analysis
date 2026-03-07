import os
import pyotp
from SmartApi import SmartConnect
from logzero import logger
from dotenv import load_dotenv

load_dotenv()

class AngelOneService:
    def __init__(self):
        self.api_key = os.getenv("ANGEL_API_KEY")
        self.client_id = os.getenv("ANGEL_CLIENT_ID")
        self.password = os.getenv("ANGEL_PASSWORD")
        self.totp_secret = os.getenv("ANGEL_TOTP_SECRET")
        self.smart_api = None
        self.auth_token = None
        self.refresh_token = None
        self.feed_token = None

    def login(self):
        try:
            self.smart_api = SmartConnect(api_key=self.api_key)
            
            # Generate TOTP
            totp = pyotp.TOTP(self.totp_secret).now()
            
            # Login
            data = self.smart_api.generateSession(self.client_id, self.password, totp)
            
            if data['status']:
                self.auth_token = data['data']['jwtToken']
                self.refresh_token = data['data']['refreshToken']
                self.feed_token = self.smart_api.getfeedToken()
                logger.info("Angel One login successful")
                return True
            else:
                logger.error(f"Angel One login failed: {data['message']}")
                return False
        except Exception as e:
            logger.error(f"Error during Angel One login: {e}")
            return False

    def get_live_quote(self, symbol: str, exchange: str = "NSE"):
        """Fetch LTP and change for a specific symbol."""
        if not self.smart_api or not self.auth_token:
            if not self.login():
                return None
        
        try:
            # We need to find the token for the symbol first in a real scenario,
            # but for common NSE stocks we can use a lookup or just yfinance fallback if token unknown.
            # For this MVP, we'll implement a basic search or focus on specific tokens.
            # Example for RELIANCE (Token 2885 on NSE)
            token_map = {
                "RELIANCE": "2885",
                "TCS": "11536",
                "INFY": "1594",
                "HDFCBANK": "1333",
                "TATAMOTORS": "3456",
                "ITC": "1660",
                "ADANIENT": "25",
                "BHARTIARTL": "10604",
                "SBIN": "3045",
                "ICICIBANK": "4963",
                "AXISBANK": "5900",
                "WIPRO": "3787",
                "HCLTECH": "7229",
                "ADANIPORTS": "15083",
                "BAJFINANCE": "317",
                "ASIANPAINT": "236",
                "MARUTI": "10999",
                "SUNPHARMA": "3351",
                "TITAN": "3506",
                "ULTRACEMCO": "11532",
                "KOTAKBANK": "1922",
                "LT": "11483",
                "BAJAJFINSV": "16675",
                "JSWSTEEL": "11723"
            }
            
            clean_symbol = symbol.replace(".NS", "").replace(".BO", "")
            token = token_map.get(clean_symbol)
            
            if not token:
                logger.warning(f"Token not found for {symbol}, falling back...")
                return None

            quote = self.smart_api.ltpData(exchange, clean_symbol, token)
            if quote['status']:
                return {
                    "last_price": quote['data']['ltp'],
                    "change": 0, # quote['data'].get('change', 0)
                    "change_percent": 0 # quote['data'].get('changePercent', 0)
                }
        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {e}")
            return None

angel_one_service = AngelOneService()
