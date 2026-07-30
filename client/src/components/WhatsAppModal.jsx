import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, MessageSquare } from 'lucide-react';

export const WhatsAppModal = ({ isOpen, onClose, bills = [], payments = [] }) => {
  const [copied, setCopied] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (isOpen) {
      const text = generateFormattedMessage();
      setMessageText(text);
    }
  }, [isOpen, bills, payments]);

  if (!isOpen) return null;

  function generateFormattedMessage() {
    let msg = `⚡ *GENTS-PG ELECTRICITY BILL SUMMARY* ⚡\n`;
    msg += `📍 *Jagmohan Nagar, Khandagiri, Bhubaneswar, Odisha*\n`;
    msg += `------------------------------------\n\n`;

    if (bills && bills.length > 0) {
      msg += `📋 *LATEST BILL DETAILS:*\n`;
      bills.slice(0, 3).forEach(b => {
        const meterName = b.meter?.name || 'Meter';
        msg += `• *${b.month} ${b.year}* (${meterName})\n`;
        msg += `  - Readings: ${b.previousReading} -> ${b.currentReading} (${b.unitsConsumed} units)\n`;
        msg += `  - Total Bill: ₹${b.totalAmount}\n`;
        msg += `  - Per Head Share: *₹${b.perHeadAmount}*\n\n`;
      });
    }

    if (payments && payments.length > 0) {
      const pendingList = payments.filter(p => p.status === 'Pending');
      msg += `🚨 *PENDING PAYMENTS STATUS (${pendingList.length}):*\n`;
      
      if (pendingList.length === 0) {
        msg += `✅ *All residents have cleared their payments! Thank you!*\n\n`;
      } else {
        pendingList.forEach(p => {
          const rName = p.resident?.name || 'Resident';
          const rRoom = p.resident?.roomNumber ? `(Room ${p.resident.roomNumber})` : '';
          msg += `❌ ${rName} ${rRoom}: *₹${p.amount}* [PENDING]\n`;
        });
        msg += `\n📌 *Please pay via UPI to Owner at your earliest convenience.* 🙏\n`;
      }
    }

    msg += `------------------------------------\n`;
    msg += `🏠 *GentsPG Electricity Manager* • Made for our PG family`;

    return msg;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(messageText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md">
              <MessageSquare className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">WhatsApp Shareable Text</h2>
              <p className="text-xs text-emerald-100">Ready to copy and share in the PG WhatsApp group</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Generated Message Preview</label>
            <textarea
              readOnly
              rows={11}
              value={messageText}
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Message Text
                </>
              )}
            </button>

            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
            >
              <Share2 className="w-4 h-4" /> Share on WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
