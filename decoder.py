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
        You are an expert insurance policy decoder. Analyze the following insurance policy text and extract the key information in plain English.
        
        Please explicitly output the following sections:
        1. Explicitly Covered: A concise description of what is actually covered.
        2. Explicitly Excluded: A clear and concise list of hidden or explicit exclusions.
        3. 3 Surprises at claim time: 3 unexpected factors, limits, or gotchas a consumer would likely be surprised by when filing a claim.
        
        Policy Text:
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
            print(generated_insights)
        print("-" * 50)
