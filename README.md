# FinePrint AI

## The Problem
Consumers are often blinded by 80-page insurance PDFs filled with legal jargon, making it incredibly difficult to understand what is actually covered, what is hidden in the exclusions, and what surprises might await at claim time.

## The Solution
FinePrint AI is an AI-powered extraction engine that translates these impenetrable 80-page insurance PDFs into plain English. We uncover the truth hidden in the fine print.

## Core Features
Our engine processes your policy and explicitly outputs:
1. **A Plain English Summary:** What your policy actually means without the legal speak.
2. **Hidden Exclusions:** Exactly what they won't cover, explicitly stated.
3. **'Surprise' Factors:** 3 unexpected things you'll find out at claim time.

## Quick Start
1. Create a virtual environment: `python -m venv venv`
2. Activate the virtual environment: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
3. Install dependencies: `pip install -r requirements.txt`
4. Set up your `.env` file with `GEMINI_API_KEY=your_api_key_here`
5. Place your policy PDF as `my_health_policy.pdf` in the root directory.
6. Run the decoder: `python decoder.py`