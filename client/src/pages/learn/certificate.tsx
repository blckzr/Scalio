import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Award, ShieldCheck, Loader2 } from 'lucide-react';

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  // 1. STATE MANAGEMENT FOR BACKEND DATA
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 2. FETCH DATA FROM YOUR API
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true);
        // Replace with your actual endpoint: e.g., `/api/certificates/${courseId}`
        // const response = await fetch(`/api/certificates/${courseId}`);
        // const result = await response.json();
        
        // Simulating API Delay & Response
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData = {
          userName: "CLARENCE",
          courseName: courseId?.replace(/-/g, ' ').toUpperCase() || "ROADMAP",
          date: "January 16, 2026",
          id: `SCALIO-${courseId?.toUpperCase().substring(0, 3)}-${Date.now().toString(36).toUpperCase()}`
        };

        setCertData(mockData);
      } catch (err) {
        console.error("Error fetching certificate:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [courseId]);

  // Loading State UI
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2" /> Generating Secure Credential...
      </div>
    );
  }

  // Error State UI
  if (error || !certData) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <p className="text-red-400 mb-4">Failed to load certificate. Please try again.</p>
        <button onClick={() => navigate(-1)} className="text-zinc-400 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center p-6 md:p-12 text-white overflow-x-hidden">
      
      {/* HEADER - Hidden when printing */}
      <div className="w-full max-w-[1000px] flex justify-between items-center mb-10 print:hidden">
        <button onClick={() => navigate(-1)} className="text-zinc-500 hover:text-white flex items-center gap-2 font-bold transition-all">
          <ArrowLeft size={18} /> Back
        </button>
        <button onClick={() => window.print()} className="bg-white text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all">
          <Printer size={18} /> Download PDF
        </button>
      </div>

      {/* THE CERTIFICATE WRAPPER */}
      <div className="certificate-wrapper">
        <div className="certificate-content bg-white aspect-video relative overflow-hidden shadow-2xl">
          <div className="h-full w-full flex flex-col items-center justify-center p-12 md:p-20 border-[12px] border-white box-border text-zinc-900">
            
            <div className="absolute inset-4 border border-zinc-100" />
            <div className="absolute inset-6 border-[6px] border-blue-600" />
            
            <div className="z-10 text-center mb-6">
              <h1 className="text-2xl font-black uppercase text-zinc-800">Scalio Academy</h1>
              <p className="text-blue-600 font-bold uppercase tracking-[0.4em] text-[10px]">Credential of Achievement</p>
            </div>

            <div className="z-10 text-center flex-1 flex flex-col justify-center">
              <p className="text-zinc-400 italic mb-1 text-lg">This acknowledges that</p>
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-zinc-900 mb-6 border-b-2 border-zinc-100 pb-4 px-10">
                {certData.userName}
              </h2>
              <p className="text-zinc-500 max-w-sm mx-auto text-xs mb-4 uppercase font-bold tracking-widest leading-relaxed">
                Has successfully fulfilled all curriculum benchmarks for:
              </p>
              <h4 className="text-3xl md:text-5xl font-black text-blue-600 uppercase tracking-tight">
                {certData.courseName}
              </h4>
            </div>

            <div className="flex justify-between w-full px-4 md:px-12 mt-8 items-end z-10">
              <div className="text-center">
                <p className="border-b-2 border-zinc-200 px-10 font-serif italic text-2xl text-zinc-800">Official Signature</p>
                <p className="text-[9px] font-black uppercase mt-2 text-zinc-400">Authorized Official</p>
              </div>
              <div className="text-right">
                 <div className="flex items-center gap-2 text-blue-600 justify-end mb-1">
                   <ShieldCheck size={16} />
                   <span className="text-[9px] font-black uppercase tracking-widest">Verified</span>
                 </div>
                 <p className="text-lg font-bold text-zinc-900 leading-none">{certData.date}</p>
                 <p className="text-[8px] font-mono text-zinc-400 mt-1 uppercase">ID: {certData.id}</p>
              </div>
            </div>

            <Award size={350} className="absolute -bottom-20 -right-20 text-blue-600 opacity-[0.05] -rotate-12 pointer-events-none" />
          </div>
        </div>
      </div>

      <style>{`
        .certificate-wrapper { width: 100%; max-width: 1000px; }

        @media print {
          body * { visibility: hidden; }
          .certificate-wrapper, .certificate-wrapper * { visibility: visible; }
          .certificate-wrapper {
            position: fixed !important;
            left: 0 !important; top: 0 !important;
            width: 100vw !important; height: 100vh !important;
            display: flex !important; align-items: center !important; justify-content: center !important;
            background-color: white !important;
          }
          .certificate-content {
            width: 92% !important;
            aspect-ratio: 16 / 9 !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page { size: landscape; margin: 0; }
        }
      `}</style>
    </div>
  );
};

export default CertificatePage;