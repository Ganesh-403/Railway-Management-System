import React from "react";
import { ArrowLeft, Printer, CheckCircle, Train, ShieldCheck, Mail } from "lucide-react";

export default function TicketView({ setView, ticketData, user }) {
  if (!ticketData) {
    return (
      <div className="text-center py-12 glass-panel rounded-xl max-w-md mx-auto border border-gray-800">
        <h4 className="text-md font-semibold text-white font-black">No ticket data loaded</h4>
        <button onClick={() => setView("search")} className="mt-4 text-sm text-amber-500 hover:underline">
          Go to Search
        </button>
      </div>
    );
  }

  const { pnr, trainno, trainname, date, total_price, start, end, seats } = ticketData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl w-full mx-auto flex flex-col gap-6 print:my-0 print:p-0">
      <button 
        onClick={() => setView("search")} 
        className="text-sm text-amber-500 hover:text-amber-400 flex items-center gap-1.5 w-fit print:hidden"
      >
        <ArrowLeft size={16} /> Search Trains
      </button>

      {/* Success Notification */}
      <div className="glass-panel p-5 rounded-xl border border-emerald-900/40 bg-emerald-950/20 text-emerald-300 flex items-start gap-4 print:hidden">
        <CheckCircle className="shrink-0 text-emerald-500" size={24} />
        <div>
          <h4 className="text-md font-bold text-white">Booking Confirmed!</h4>
          <p className="text-xs mt-1 text-emerald-400/90 leading-relaxed">
            Your seats have been allocated successfully. A confirmation message with your ticket coordinates has been sent asynchronously to <span className="font-semibold underline text-white">{user?.email}</span>.
          </p>
        </div>
      </div>

      {/* Printable Ticket Receipt Card */}
      <div id="ticket-receipt" className="glass-panel rounded-xl border border-gray-800 p-8 shadow-2xl relative flex flex-col gap-6 print:border-transparent print:bg-white print:text-black print:shadow-none print:p-0">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none print:hidden"></div>

        {/* Ticket Header */}
        <div className="flex justify-between items-start border-b border-gray-800/80 pb-5 print:border-gray-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-800 text-amber-500 rounded-lg print:bg-gray-100 print:text-black">
              <Train size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white print:text-black">RAILEXP RESERVATION TICKET</h2>
              <span className="text-xs text-amber-500 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded uppercase font-bold tracking-wider mt-1 inline-block print:text-black print:bg-gray-100 print:border-gray-300">
                Confirmed (CNF)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">PNR NUMBER</span>
            <h3 className="text-xl font-black text-amber-500 print:text-black">{pnr}</h3>
          </div>
        </div>

        {/* Train & Journey details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-950/40 p-5 rounded-lg border border-gray-850 print:bg-gray-50 print:border-gray-200 print:text-black">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Service Details</span>
            <h4 className="text-sm font-bold text-white mt-1 print:text-black">{trainname}</h4>
            <p className="text-xs text-gray-400 mt-0.5 print:text-gray-600">Train Number: {trainno}</p>
            <p className="text-xs text-gray-400 print:text-gray-600">Travel Date: {date}</p>
          </div>
          <div className="sm:border-l sm:border-gray-850 sm:pl-6 print:border-gray-300">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Route Coordinates</span>
            <div className="flex items-center gap-2 mt-1.5 text-sm font-semibold text-white print:text-black">
              <span>{start}</span>
              <span className="text-gray-600">&rarr;</span>
              <span>{end}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1 print:text-gray-600">Boarding Point: {start}</p>
            <p className="text-xs text-gray-400 print:text-gray-600">Destination Point: {end}</p>
          </div>
        </div>

        {/* Seats and Fare summary */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-850 pb-2 print:text-black print:border-gray-300">Allocated Boarding Seats</h4>
          <div className="flex flex-wrap gap-3">
            {seats.map((seat, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 px-4 py-2 rounded-lg text-sm text-white print:bg-gray-100 print:border-gray-300 print:text-black">
                Passenger {i + 1}: <span className="font-bold text-amber-500 print:text-black">Seat {seat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Price footer */}
        <div className="border-t border-gray-800/80 pt-5 flex justify-between items-center print:border-gray-300">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck size={14} className="text-amber-500" /> Secure Booking verified by RailExp
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Total Price Paid</span>
            <h3 className="text-2xl font-black text-amber-500 print:text-black">INR {total_price}</h3>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex-1 text-white font-semibold py-3 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors border border-gray-700 flex items-center justify-center gap-2"
        >
          <Printer size={18} /> Print / Download PDF
        </button>
        <button 
          onClick={() => setView("search")}
          className="flex-1 text-white font-semibold py-3 rounded-lg gradient-bg hover:opacity-90 transition-opacity flex items-center justify-center"
        >
          Book Another Ticket
        </button>
      </div>
    </div>
  );
}
