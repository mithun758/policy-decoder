from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from decoder import extract_text_from_pdf, decode_policy
import os
import shutil

app = FastAPI(title="FinePrint AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/evaluate")
async def evaluate_policy(file: UploadFile = File(...)):
    # Create a temporary file path
    temp_file_path = f"temp_{file.filename}"
    
    try:
        # Save the uploaded file temporarily to disk
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Run extraction
        extracted_text = extract_text_from_pdf(temp_file_path)
        
        if not extracted_text:
            return {"status": "error", "message": "Failed to extract text from PDF."}
            
        # Run decoding
        scorecard = decode_policy(extracted_text)
        
        if not scorecard:
            return {"status": "error", "message": "Failed to generate scorecard."}
            
        return {"status": "success", "scorecard": scorecard}
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
        
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
