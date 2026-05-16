import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';

const OmniAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour, je suis votre assistant UPF-Ride. Comment puis-je vous aider ?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const notifyTripCreated = (message) => {
    if (message.action?.type === 'CREATE_TRIP' && message.action?.data?.createdTrip) {
      window.dispatchEvent(new CustomEvent('omni:trip-created'));
    }
  };

  const postMessage = async (text, options = {}) => {
    const { showUserMessage = true } = options;

    if (showUserMessage) {
      setMessages(prev => [...prev, { role: 'user', content: text }]);
    }

    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: text,
        history: messages.slice(1)
      });

      const aiMessage = {
        role: 'assistant',
        content: response.data.response,
        action: response.data.action
      };

      setMessages(prev => [...prev, aiMessage]);
      notifyTripCreated(aiMessage);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Desole, je n'ai pas pu traiter cette demande. Veuillez reessayer."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    postMessage(input.trim());
  };

  const confirmTripCreation = (action) => {
    setMessages(prev => prev.map(msg => (
      msg.action === action
        ? { ...msg, action: { ...msg.action, completed: true } }
        : msg
    )));

    postMessage(`[SYSTEM_CONFIRM] ${JSON.stringify(action.data || {})}`, {
      showUserMessage: false
    });
  };

  const cancelTripConfirmation = (action) => {
    setMessages(prev => prev.map(msg => (
      msg.action === action
        ? { ...msg, action: { ...msg.action, completed: true } }
        : msg
    )));

    postMessage('Non, je souhaite annuler ou modifier.', {
      showUserMessage: true
    });
  };

  const formatTripDate = (value) => {
    if (!value) return 'Date a confirmer';
    return new Date(value).toLocaleString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const seatsLabel = (seats) => {
    const count = Number(seats || 0);
    return `${seats || '-'} place${count > 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] max-w-[430px] h-[min(640px,calc(100vh-7rem))] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[28px] shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md ring-1 ring-white/20 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base leading-tight truncate">Omni-Agent</h3>
                <p className="text-xs text-blue-100 truncate">Assistant UPF-Ride</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition" aria-label="Fermer l'assistant">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="omni-scroll flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/80 px-5 py-5 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] overflow-hidden break-words whitespace-pre-wrap px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-md shadow-blue-600/20'
                    : 'bg-white text-slate-800 rounded-tl-md border border-slate-100'
                }`}>
                  {msg.content}

                  {msg.action?.type === 'SEARCH_TRIPS' && msg.action.data?.results && (
                    <div className="mt-4 space-y-3">
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Trajets disponibles</p>
                      {msg.action.data.results.map(trip => (
                        <div key={trip.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <span className="text-xs font-bold text-slate-900 truncate">{trip.driver.firstName}</span>
                            <span className="text-blue-600 font-bold text-xs shrink-0">{trip.driverPrice} DH</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTripDate(trip.departureTime)}
                          </div>
                          <button className="w-full mt-3 py-2 bg-slate-900 text-white text-xs rounded-xl hover:bg-blue-600 transition">
                            Reserver
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.action?.type === 'CREATE_TRIP' && msg.action.data?.createdTrip && (
                    <div className="mt-4 space-y-3">
                      <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Trajet cree avec succes</p>
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="mt-0.5 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="text-sm font-bold text-slate-900 leading-snug">
                            {msg.action.data.createdTrip.departureLocation.name} -&gt; {msg.action.data.createdTrip.destinationLocation.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                          <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTripDate(msg.action.data.createdTrip.departureTime)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {seatsLabel(msg.action.data.createdTrip.availableSeats)} libre{Number(msg.action.data.createdTrip.availableSeats) > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.action?.type === 'REQUEST_TRIP_CONFIRMATION' && (
                    <div className="mt-4 bg-blue-50 rounded-2xl p-4 border border-blue-100">
                      <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5 2a8 8 0 11-16 0 8 8 0 0116 0z" />
                          </svg>
                        </span>
                        Confirmer le trajet
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700 mb-4 bg-white p-3 rounded-2xl border border-blue-100">
                        <div className="min-w-0"><span className="text-slate-400 block text-[10px] uppercase tracking-wide font-bold">Depart</span>{msg.action.data?.departure}</div>
                        <div className="min-w-0"><span className="text-slate-400 block text-[10px] uppercase tracking-wide font-bold">Destination</span>{msg.action.data?.destination}</div>
                        <div className="min-w-0"><span className="text-slate-400 block text-[10px] uppercase tracking-wide font-bold">Date</span>{msg.action.data?.date}</div>
                        <div className="min-w-0"><span className="text-slate-400 block text-[10px] uppercase tracking-wide font-bold">Heure</span>{msg.action.data?.time}</div>
                        <div className="min-w-0 sm:col-span-2"><span className="text-slate-400 block text-[10px] uppercase tracking-wide font-bold">Details</span>{seatsLabel(msg.action.data?.seats)} - {msg.action.data?.price} DH</div>
                      </div>

                      {!msg.action.completed && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => confirmTripCreation(msg.action)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm shadow-sm shadow-blue-600/20"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => cancelTripConfirmation(msg.action)}
                            className="flex-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors text-sm border border-slate-200"
                          >
                            Annuler
                          </button>
                        </div>
                      )}

                      {msg.action.completed && (
                        <div className="mt-3 text-xs font-semibold text-blue-700 bg-white/70 border border-blue-100 rounded-xl px-3 py-2">
                          Confirmation envoyee, creation en cours...
                        </div>
                      )}
                    </div>
                  )}

                  {msg.action && !msg.action.data?.results && !msg.action.data?.createdTrip && msg.action.type !== 'REQUEST_TRIP_CONFIRMATION' && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                        Action: {msg.action.type?.replace('_', ' ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md flex gap-1 border border-slate-100 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ecrivez votre message..."
              className="min-w-0 flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm shadow-blue-600/20"
              aria-label="Envoyer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <style>{`
        .omni-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .omni-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
        .omni-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 bg-gradient-to-r from-blue-600 to-indigo-700 text-white"
          aria-label="Ouvrir l'assistant"
        >
          <div className="relative">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          </div>
        </button>
      )}
    </div>
  );
};

export default OmniAssistant;
