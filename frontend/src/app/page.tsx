"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const loadingPhrases = [
  "Extracting raw text from PDF...",
  "Bypassing legal jargon...",
  "Scanning for hidden exclusions...",
  "Evaluating against perfect benchmark...",
  "Finalizing scorecard..."
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Loading Phrases Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 3000);
    } else {
      setPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult('');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
      setResult('');
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/evaluate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setResult(data.scorecard);
      } else {
        setError(data.message || "An error occurred during evaluation.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-200">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 drop-shadow-sm">
            Decode Your Policy.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Upload your health insurance PDF. We find the hidden exclusions before claim time.
          </p>
        </motion.div>

        {/* Main Interface */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* Upload Zone */}
            {!loading && !result && (
              <motion.div
                key="upload-zone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12"
              >
                <div 
                  className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                    ${file ? 'border-blue-400 bg-blue-50/30' : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/20'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".pdf" 
                    className="hidden" 
                  />
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {file ? (
                      <div className="flex flex-col items-center gap-4 text-slate-700">
                        <div className="p-4 bg-emerald-100 rounded-full shadow-inner shadow-emerald-200/50">
                          <CheckCircle className="w-12 h-12 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-lg text-slate-900 border-b border-transparent hover:border-slate-300 transition-colors inline-block">{file.name}</h3>
                          <p className="text-sm text-slate-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB PDF Document</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6">
                        <div className="p-5 bg-white rounded-full shadow-md shadow-slate-200/50 ring-1 ring-slate-100">
                          <UploadCloud className="w-10 h-10 text-blue-500" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xl font-semibold text-slate-800">
                            Drop your policy here
                          </p>
                          <p className="text-sm text-slate-500 max-w-xs mx-auto">
                            PDF format up to 80 pages supported for instant analysis.
                          </p>
                        </div>
                        <button className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-md shadow-slate-900/20 transition-all active:scale-95">
                          Select PDF
                        </button>
                      </div>
                    )}
                  </motion.div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-start gap-3 border border-red-100 font-medium">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {file && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex justify-end"
                  >
                    <button
                      onClick={handleSubmit}
                      className="px-8 py-4 rounded-xl text-lg font-bold text-white shadow-lg shadow-blue-600/30 bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                    >
                      <FileText className="w-5 h-5" />
                      Decode Policy
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Processing UI */}
            {loading && (
              <motion.div
                key="processing-zone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center space-y-8 min-h-[400px]"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-60"></div>
                  <div className="relative bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full p-5 shadow-inner shadow-white/30">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2 h-16">
                  <AnimatePresence mode="wait">
                    <motion.h3
                      key={phraseIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="text-2xl font-bold text-slate-800"
                    >
                      {loadingPhrases[phraseIndex]}
                    </motion.h3>
                  </AnimatePresence>
                  <p className="text-slate-500 font-medium">This usually takes 10-15 seconds.</p>
                </div>
                
                {/* Progress bar visual */}
                <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-full h-full bg-blue-500 rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Results UI */}
            {result && !loading && (
              <motion.div
                key="results-zone"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white text-slate-900 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-lg tracking-tight">AI Evaluation Complete</h2>
                      <p className="text-xs text-slate-500 font-medium">{file?.name}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setResult(''); setFile(null); }}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors px-4 py-2 hover:bg-slate-200 rounded-lg"
                  >
                    Analyze Another
                  </button>
                </div>
                
                <div className="p-8 md:p-12">
                  <div className="prose max-w-none prose-slate text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-ul:text-slate-700 prose-li:text-slate-700">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
