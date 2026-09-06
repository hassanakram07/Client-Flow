"use client";

import { Document } from "@/lib/types";
import { ShieldCheck, Printer, X, Lock } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";

interface DigitalCertificateModalProps {
  document: Document;
  signerName?: string;
  signerEmail?: string;
  clientOrg?: string;
  onClose: () => void;
}

export function DigitalCertificateModal({
  document,
  signerName = "Ethan Blackwell",
  signerEmail = "ethan@halcyonventures.com",
  clientOrg = "Halcyon Ventures",
  onClose,
}: DigitalCertificateModalProps) {
  // Deterministic mock SHA-256 fingerprint from document id
  const hashSeed = (document.id + document.name + document.version).split("").reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
  }, 0);
  const mockSha256 = `sha256:${Math.abs(hashSeed).toString(16).padStart(16, "0")}8f4a7c29b0123e4d9c7f1a8e`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-8 shadow-2xl relative overflow-hidden flex flex-col space-y-6 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative security guilloche background pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-blue-100/40 via-transparent to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        {/* Modal Top Bar */}
        <div className="flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 font-mono">
                  NexOps Trust Layer
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Verified Sign-Off
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Certificate of Deliverable Approval
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Body Card */}
        <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-4 text-xs font-sans">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Authorized Deliverable Asset
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{document.name}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                Version {document.version}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              File Size: {formatFileSize(document.sizeBytes)} · Type: {document.mimeType}
            </p>
          </div>

          {/* Signer Details */}
          <div className="grid grid-cols-2 gap-3 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Executing Signatory
              </span>
              <span className="font-bold text-slate-900 block mt-0.5">{signerName}</span>
              <span className="text-[11px] text-slate-500 font-mono">{signerEmail}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Client Organization
              </span>
              <span className="font-bold text-slate-900 block mt-0.5">{clientOrg}</span>
              <span className="text-[11px] text-slate-500 font-mono">External Client Executive</span>
            </div>
          </div>

          {/* Ledger Hash & Timestamp */}
          <div className="space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Cryptographic Ledger Fingerprint (SHA-256)
              </span>
              <div className="mt-1 font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200 text-slate-800 break-all select-all flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>{mockSha256}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Timestamp: <strong className="text-slate-800 font-mono">{formatDate(document.createdAt)}</strong></span>
              <span>Ledger: <strong className="text-emerald-700 font-mono">Immutable · Verified</strong></span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[11px] text-slate-500 leading-relaxed">
          This digital certificate serves as verifiable cryptographic proof that electronic sign-off was provided by the authorized executive. This approval event has been permanently cataloged in the multi-tenant immutable audit trail under SOC-2 Type II standards.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={() => window.print()}
            className="btn btn-secondary text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Verification Slip</span>
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
