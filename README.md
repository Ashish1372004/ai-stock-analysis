# AI-Stock Market Analysis Dashboard

A premium, AI-powered stock market analysis tool tailored for the Indian market (NSE). This application provides real-time technical analysis, AI-driven investment recommendations, and a social-style market news feed.

## 🚀 Key Features

-   **Deep Technical Analysis**: Automated RSI, SMA, and trend detection.
-   **AI Recommendations**: Intelligent "Buy/Hold/Sell" suggestions based on market sentiment.
-   **Market Intel Feed**: Aggregated financial news from Nifty 50 and major blue-chips.
-   **Persistent Tracking**: SQLite backend for storage of alerts and watchlists.
-   **Premium UI**: Sleek, glassmorphism design with responsive navigation.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **npm** (v9+)

### 2. Backend Setup (FastAPI)
Navigate to the root directory and set up a virtual environment:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
```

The API will be available at `http://localhost:8001`.

### 3. Frontend Setup (React + Vite)
Open a new terminal session and navigate to the `frontend` directory:

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev -- --port 3000
```

The dashboard will be available at `http://localhost:3000`.

---

## 📂 Project Structure

-   `backend/`: FastAPI application, models, and analysis services.
-   `frontend/`: React components, state management, and Tailwind styles.
-   `data/`: (Auto-generated) Local SQLite database storage.

## 📈 Data Source
All market intelligence is pulled in real-time using `yfinance`, covering NSE India tickers (e.g., `RELIANCE.NS`, `HDFCBANK.NS`).

---
*Created with ❤️ for Indian Market Investors*
