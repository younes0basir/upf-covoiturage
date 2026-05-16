import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';

const OmniAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your UPF-Ride Omni-Agent. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: input,
        history: messages.slice(1) // exclude initial welcome
      });

      const aiMessage = { 
        role: 'assistant', 
        content: response.data.response,
        action: response.data.action
      };

      setMessages(prev => [...prev, aiMessage]);

      // Notify dashboard to refresh if a trip was created
      if (aiMessage.action?.type === 'CREATE_TRIP' && aiMessage.action?.data?.createdTrip) {
        window.dispatchEvent(new CustomEvent('omni:trip-created'));
      }
      
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an issue. Please try again later." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendSystemMessage = async (text) => {
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: text,
        history: messages.slice(1) // exclude initial welcome
      });

      const aiMessage = { 
        role: 'assistant', 
        content: response.data.response,
        action: response.data.action
      };

      setMessages(prev => [...prev, aiMessage]);

      if (aiMessage.action?.type === 'CREATE_TRIP' && aiMessage.action?.data?.createdTrip) {
        window.dispatchEvent(new CustomEvent('omni:trip-created'));
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const confirmTripCreation = (action) => {
    action.completed = true;
    sendSystemMessage(`[SYSTEM_CONFIRM] ${JSON.stringify(action.data || {})}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 h-[500px] bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm">Omni-Agent</h3>
                <p className="text-[10px] text-blue-100">AI Concierge</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.content}
                  
                  {/* Render Search Results */}
                  {msg.action?.type === 'SEARCH_TRIPS' && msg.action.data?.results && (
                    <div className="mt-4 space-y-3">
                      <p className="text-[10px] font-bold text-blue-600 uppercase">Available Rides Found:</p>
                      {msg.action.data.results.map(trip => (
                        <div key={trip.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-gray-900">{trip.driver.firstName}</span>
                            <span className="text-blue-600 font-bold text-xs">{trip.driverPrice} DH</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(trip.departureTime).toLocaleString()}
                          </div>
                          <button className="w-full mt-3 py-1.5 bg-gray-900 text-white text-[10px] rounded-lg hover:bg-blue-600 transition">
                            Book Now
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Created Trip Success */}
                  {msg.action?.type === 'CREATE_TRIP' && msg.action.data?.createdTrip && (
                    <div className="mt-4 space-y-3">
                      <p className="text-[10px] font-bold text-green-600 uppercase">Trajet Créé Avec Succès :</p>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-gray-900">
                            {msg.action.data.createdTrip.departureLocation.name} → {msg.action.data.createdTrip.destinationLocation.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600 mb-1">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(msg.action.data.createdTrip.departureTime).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-600">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {msg.action.data.createdTrip.availableSeats} places libres
                        </div>
                      </div>
                    </div>
                  )}

                  {msg.action?.type === 'REQUEST_TRIP_CONFIRMATION' && (
                    <div className="mt-4 bg-white/60 rounded-xl p-4 border border-blue-100 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="text-blue-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Confirmer le trajet
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-700 mb-4 bg-white p-3 rounded-lg border border-gray-100">
                        <div><span className="text-gray-400 block text-xs uppercase tracking-wider">Départ</span>{msg.action.data?.departure}</div>
                        <div><span className="text-gray-400 block text-xs uppercase tracking-wider">Destination</span>{msg.action.data?.destination}</div>
                        <div><span className="text-gray-400 block text-xs uppercase tracking-wider">Date</span>{msg.action.data?.date}</div>
                        <div><span className="text-gray-400 block text-xs uppercase tracking-wider">Heure</span>{msg.action.data?.time}</div>
                        <div><span className="text-gray-400 block text-xs uppercase tracking-wider">Détails</span>{msg.action.data?.seats} places • {msg.action.data?.price} DH</div>
                      </div>
                      
                      {!msg.action.completed && (
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => {
                              confirmTripCreation(msg.action);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors text-sm"
                          >
                            Confirmer
                          </button>
                          <button 
                            onClick={() => {
                              msg.action.completed = true;
                              sendSystemMessage("Non, je souhaite annuler ou modifier.");
                            }}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors text-sm"
                          >
                            Annuler
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {msg.action && !msg.action.data?.results && !msg.action.data?.createdTrip && msg.action.type !== 'REQUEST_TRIP_CONFIRMATION' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
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
                <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-white text-gray-900 rotate-90' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
};

export default OmniAssistant;
