import os
import sys
import pdfplumber
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up Gemini Configuration
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY not found in environment variables.")
    sys.exit(1)

genai.configure(api_key=api_key)

def extract_text_from_pdf(pdf_path):
    """Extracts text from all pages of the given PDF document."""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

def decode_policy(policy_text):
    """Sends the extracted policy text to Gemini to generate insights."""
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""
    You are an expert insurance actuary and a strict consumer advocate.
    Your task is to read the following health insurance policy text, extract the key numerical limits, and score the policy out of 100 based on a 'Perfect Policy' benchmark.

    ### 1. THE PERFECT POLICY BENCHMARK (Scoring Rubric)
    Evaluate the extracted data against these ideals. Deduct points proportionally for sub-standard terms:
    - Co-payment: Perfect is 0%. (Deduct heavily for zone-based or percentage copays).
    - Room Rent Limit: Perfect is 'No Limit' or 'Single Private Room'. (Deduct points if capped at 1% or 2% of sum insured, or specific monetary caps).
    - Pre-Existing Disease (PED) Waiting Period: Perfect is 2 years or less. (Deduct points for 3 or 4 years).
    - Specific Illness Waiting Period: Perfect is 1 year or less. (Deduct for 2+ years).
    - Pre/Post Hospitalization: Perfect is 60 days pre / 90 days post or better.
    - Disease-Specific Sub-limits (e.g., Cataract, Knee Replacement, Modern Treatments): Perfect is no sub-limits.
    - Restoration Benefit: Perfect is 100% restoration triggered on partial exhaustion, applicable to the same illness.

    ### 2. EXTRACTION RULES
    - If a specific metric is NOT mentioned in the text, do NOT guess or hallucinate. Explicitly state 'Not Specified' and deduct points for lack of transparency.
    - Look past marketing fluff; search for the actual terms and conditions.

    ### 3. OUTPUT FORMAT
    You must output your response EXACTLY in this Markdown format:

    # 📊 POLICY SCORECARD: [Insert Score]/100

    ## 🔢 KEY METRICS EXTRACTED:
    * **Co-pay:** [Extract % or 'Not Specified']
    * **Room Rent Limit:** [Extract limit or 'Not Specified']
    * **PED Waiting Period:** [Extract years or 'Not Specified']
    * **Specific Illness Waiting Period:** [Extract years or 'Not Specified']
    * **Pre/Post Hospitalization:** [Extract days or 'Not Specified']
    * **Restoration Benefit:** [Summarize terms or 'Not Specified']

    ## 🚩 SCORE JUSTIFICATION & PENALTIES:
    [Provide a concise, bulleted list explaining exactly why points were deducted compared to the perfect benchmark. Be specific about which clauses hurt the score.]

    ## 🚨 CRITICAL SURPRISES:
    [List 2-3 hidden exclusions or clauses that would surprise the average consumer at claim time.]

    ---
    Here is the raw policy text:
    {policy_text}
    """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error communicating with Gemini API: {e}")
        return None

if __name__ == "__main__":
    target_pdf = "my_health_policy.pdf"
    
    if not os.path.exists(target_pdf):
        print(f"Error: Target file '{target_pdf}' not found in the current directory.")
        sys.exit(1)
        
    print(f"Extracting text from {target_pdf}...\n")
    extracted_text = extract_text_from_pdf(target_pdf)
    
    if extracted_text:
        print("Decoding policy with FinePrint AI...\n")
        print("-" * 50)
        generated_insights = decode_policy(extracted_text)
        if generated_insights:
            sys.stdout.buffer.write((generated_insights + "\n").encode("utf-8", errors="replace"))
            sys.stdout.buffer.flush()
        print("-" * 50)
