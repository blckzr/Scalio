import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Award, ShieldCheck, Loader2 } from 'lucide-react';

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      // Simulate backend fetch
      await new Promise(r => setTimeout(r, 800));
      setCertData({
        userName: "CLARENCE",
        courseName: courseId?.replace(/-/g, ' ').toUpperCase() || "ROADMAP",
        date: "January 16, 2026",
        id: `SCALIO-${Math.random().toString(36).toUpperCase().substring(7)}`
      });
      setLoading(false);
    };
    fetchCert();
  }, [courseId]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-zinc-900 font-sans">
      <Loader2 className="animate-spin mr-3" /> Verifying Credential...
    </div>
  );

  return (
    /* Changed bg-[#09090b] to bg-zinc-50 for a clean look, or use bg-white */
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center p-6 md:p-12 text-zinc-900 overflow-x-hidden font-sans">
      
      {/* 1. UI HEADER: Hidden in print */}
      <div className="w-full max-w-[1000px] flex justify-between items-center mb-10 print:hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="text-zinc-400 hover:text-zinc-900 flex items-center gap-2 font-bold transition-all"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all hover:bg-blue-700 shadow-lg"
        >
          <Printer size={18} /> Download PDF
        </button>
      </div>

      {/* 2. CERTIFICATE CONTAINER */}
      <div className="certificate-wrapper shadow-2xl">
        <div className="certificate-content bg-white aspect-video relative overflow-hidden">
          <div className="h-full w-full flex flex-col items-center justify-center p-12 md:p-20 border-[12px] border-white box-border text-zinc-900">
            
            {/* Design Borders */}
            <div className="absolute inset-4 border border-zinc-100" />
            <div className="absolute inset-6 border-[6px] border-blue-600" />
            
            <div className="z-10 text-center mb-6">
              <h1 className="text-2xl font-black uppercase text-zinc-800 tracking-tighter">Scalio Academy</h1>
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
                <p className="border-b-2 border-zinc-200 px-10 font-serif italic text-2xl text-zinc-800 leading-none pb-2">Official Signature</p>
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
        .certificate-wrapper { width: 100%; max-width: 1000px; background: white; }

        @media print {
          /* 1. Hide everything on the page */
          body * { 
            visibility: hidden !important; 
          }

          /* 2. Reset backgrounds for PDF */
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* 3. Re-show ONLY the certificate */
          .certificate-wrapper, .certificate-wrapper * { 
            visibility: visible !important; 
          }

          .certificate-wrapper {
            position: fixed !important;
            left: 0 !important; 
            top: 0 !important;
            width: 100vw !important; 
            height: 100vh !important;
            display: flex !important; 
            align-items: center !important; 
            justify-content: center !important;
            background-color: white !important;
            box-shadow: none !important;
          }

          .certificate-content {
            width: 100% !important;
            aspect-ratio: 16 / 9 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @page { 
            size: landscape; 
            margin: 0; 
          }
        }
      `}</style>
    </div>
  );
};

export default CertificatePage;