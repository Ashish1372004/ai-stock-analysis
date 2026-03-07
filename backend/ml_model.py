import pandas as pd
import yfinance as yf
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import numpy as np
import os
import pickle

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

class StockPredictor:
    def __init__(self, symbol: str):
        if not symbol.endswith(('.NS', '.BO')):
            symbol = f"{symbol}.NS"
        self.symbol = symbol
        self.model_path = os.path.join(MODEL_DIR, f"{symbol}_rf_model.pkl")
        self.model = None

        if not os.path.exists(MODEL_DIR):
            os.makedirs(MODEL_DIR)

    def fetch_training_data(self) -> pd.DataFrame:
        """Fetch historical data for training (5 years)."""
        ticker = yf.Ticker(self.symbol)
        df = ticker.history(period="5y")
        return df

    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate technical indicators as features."""
        if df.empty or len(df) < 50:
            return pd.DataFrame()

        # Target: Tomorrow's close price
        df['Target'] = df['Close'].shift(-1)

        # Features
        df['SMA_10'] = df['Close'].rolling(window=10).mean()
        df['SMA_50'] = df['Close'].rolling(window=50).mean()
        
        # RSI
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))

        # Volatility
        df['Volatility'] = df['Close'].rolling(window=20).std()

        # Price Momentum
        df['Momentum_5'] = df['Close'].pct_change(periods=5)
        df['Momentum_20'] = df['Close'].pct_change(periods=20)

        # Drop NaN values (due to rolling windows and shift)
        df = df.dropna()
        return df

    def train(self):
        """Train the Random Forest model and save it."""
        print(f"Training AI Model for {self.symbol}...")
        df = self.fetch_training_data()
        prepared_df = self.prepare_features(df)

        if prepared_df.empty:
            print(f"Not enough data to train model for {self.symbol}")
            return False

        features = ['Close', 'SMA_10', 'SMA_50', 'RSI', 'Volatility', 'Momentum_5', 'Momentum_20']
        X = prepared_df[features]
        y = prepared_df['Target']

        # Simple train/test split to get a confidence score
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # Calculate basic R^2 score for confidence mapping
        score = model.score(X_test, y_test)
        print(f"Model trained for {self.symbol}. R2 Score: {score:.2f}")

        # Save model
        with open(self.model_path, 'wb') as f:
            pickle.dump(model, f)
        
        self.model = model
        return True

    def load_model(self):
        """Load a trained model if it exists."""
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            return True
        return False

    def predict_next_day(self, live_df: pd.DataFrame) -> dict:
        """Predict the next day's price using the latest data."""
        if not self.model and not self.load_model():
            # If no model exists, skip prediction instead of training on-the-fly
            # Training should happen in a background process or via a separate endpoint
            return {"predicted_price": None, "confidence": 0}

        prepared_df = self.prepare_features(live_df.copy())
        if prepared_df.empty:
             return {"predicted_price": None, "confidence": 0}

        # We need the last row of features (excluding the Target which is NaN for the absolute latest data if we don't shift)
        # Actually, prepare_features shifts target, so the last row's features are what we use to predict tomorrow.
        
        # Re-calculate features specifically for the latest data point without dropping the last row
        latest_data = live_df.copy()
        features = ['Close', 'SMA_10', 'SMA_50', 'RSI', 'Volatility', 'Momentum_5', 'Momentum_20']
        
        latest_data['SMA_10'] = latest_data['Close'].rolling(window=10).mean()
        latest_data['SMA_50'] = latest_data['Close'].rolling(window=50).mean()
        delta = latest_data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        latest_data['RSI'] = 100 - (100 / (1 + rs))
        latest_data['Volatility'] = latest_data['Close'].rolling(window=20).std()
        latest_data['Momentum_5'] = latest_data['Close'].pct_change(periods=5)
        latest_data['Momentum_20'] = latest_data['Close'].pct_change(periods=20)
        
        latest_features = latest_data[features].iloc[-1:]
        
        if latest_features.isnull().values.any():
              return {"predicted_price": None, "confidence": 0}

        prediction = self.model.predict(latest_features)[0]
        
        # Heuristic confidence based on volatility (lower volatility = higher confidence typically)
        current_vol = latest_features['Volatility'].iloc[0]
        current_price = latest_features['Close'].iloc[0]
        vol_pct = current_vol / current_price if current_price > 0 else 0
        
        # Convert vol to a 0-100 confidence score (highly volatile = lower confidence)
        confidence = max(50.0, min(95.0, 100 - (vol_pct * 1000)))

        return {
            "predicted_price": round(float(prediction), 2),
            "confidence": round(float(confidence), 2)
        }

if __name__ == "__main__":
    # Simple test
    predictor = StockPredictor("RELIANCE")
    predictor.train()
    df = yf.Ticker("RELIANCE.NS").history(period="1y")
    result = predictor.predict_next_day(df)
    print(f"Prediction result: {result}")
