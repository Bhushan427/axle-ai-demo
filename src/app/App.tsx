import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { LoadCard } from './components/LoadCard';
import { BidInputPrompt } from './components/BidInputPrompt';
import { VehicleAttachForm } from './components/VehicleAttachForm';
import { EmptyState } from './components/EmptyState';
import { ConfirmationMessage } from './components/ConfirmationMessage';
import { QuickActions } from './components/QuickActions';
import { DemoInstructions } from './components/DemoInstructions';

type MessageType = 
  | { type: 'user'; text: string }
  | { type: 'ai'; text: string }
  | { type: 'loads'; loads: any[] }
  | { type: 'bid-input'; loadId: number | string; loadRoute: string }
  | { type: 'bid-confirmation'; bidAmount: number; loadRoute: string }
  | { type: 'my-bids'; bids: any[] }
  | { type: 'action-points'; awaitingArrival: any[]; uploadPOD: any[] }
  | { type: 'vehicle-form'; load: any }
  | { type: 'vehicle-confirmation' }
  | { type: 'empty'; emptyType: 'no-loads' | 'no-bids' | 'no-actions' }
  | { type: 'revise-bid-input'; bid: any }
  | { type: 'quick-actions' }
  | { type: 'demo-instructions' };

interface Message {
  id: number;
  content: MessageType;
  timestamp?: string;
}

// Mock data
const mockLoads = [
  {
    id: 1,
    route: { from: 'Delhi', to: 'Mumbai' },
    truckType: 'Closed truck 32FTXXL18 MT',
    material: 'Electronics',
    capacity: '7.5 ton',
    biddingEndTime: '2 hrs 15 min',
    targetPrice: 45000,
    status: 'open' as const,
    loadType: 'delhivery' as const,
  },
  {
    id: 2,
    route: { from: 'Delhi', to: 'Mumbai' },
    truckType: 'Closed truck 32FTXXL18 MT',
    material: 'Consumer Goods',
    capacity: '7.5 ton',
    biddingEndTime: '1 day 2 hrs',
    targetPrice: 42000,
    status: 'open' as const,
    loadType: 'client' as const,
  },
  {
    id: 3,
    route: { from: 'Delhi', to: 'Mumbai' },
    truckType: 'Closed truck 32FTXXL18 MT',
    material: 'FMCG',
    capacity: '7.5 ton',
    biddingEndTime: '3 hrs',
    targetPrice: 43500,
    status: 'open' as const,
    loadType: 'marketplace' as const,
  },
];

async function fetchLoads(queryText: string, history: any[] = []) {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: queryText, history }),
  });

  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  const data = await res.json();

  if (data.kind === "loads") return data.loads;          // ✅ array of cards
  throw new Error(data.text || "AI did not return loads");
}

async function callAI(
  text: string,
  history: Array<{ role: "user" | "ai"; text: string }>,
  lang: "en" | "hi"
) {
  const r = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, history, lang }), // ✅ send lang
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<
    | { kind: "text"; text: string }
    | { kind: "loads"; preface: string; loads: any[] }
    | { kind: "my_bids"; text: string; bids: any[] }
    | { kind: "action_points"; text: string; awaitingArrival: any[]; uploadPOD: any[] }
  >;
}

const mockBids = [
  {
    id: 1,
    route: { from: 'Kochi, Kerala', to: 'Jaipur, Rajasthan' },
    truckType: 'Open 32FTXXL18 MT',
    bidAmount: 48000,
    bidStatus: 'revised' as const,
    status: 'open' as const,
    biddingEndTime: '2 hrs 15 min',
    loadType: 'marketplace' as const,
  },
  {
    id: 2,
    route: { from: 'New Delhi', to: 'Pune' },
    truckType: 'Closed 32FTXXL18 MT',
    bidAmount: 46000,
    bidStatus: 'won' as const,
    status: 'awaiting-arrival' as const,
    loadType: 'delhivery' as const,
  },
  {
    id: 3,
    route: { from: 'Mumbai', to: 'Bangalore' },
    truckType: 'Open 20FT',
    bidAmount: 35000,
    bidStatus: 'lost' as const,
    status: 'closed' as const,
    loadType: 'client' as const,
  },
];

const mockActionPointsAwaitingArrival = [
  {
    id: 2,
    route: { from: 'New Delhi', to: 'Pune' },
    truckType: 'Closed 32FTXXL18 MT',
    status: 'awaiting-arrival' as const,
    bidAmount: 46000,
  },
  {
    id: 4,
    route: { from: 'Chennai', to: 'Hyderabad' },
    truckType: 'Open 14FTSXL',
    status: 'awaiting-arrival' as const,
    bidAmount: 28000,
  },
];

const mockActionPointsUploadPOD = [
  {
    id: 5,
    route: { from: 'Ahmedabad', to: 'Surat' },
    truckType: 'Closed 19FT',
    status: 'unloaded' as const,
    bidAmount: 15000,
  },
];

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: { type: 'ai', text: 'Welcome to Axle AI! Please login to continue.' },
    },
    {
      id: 2,
      content: { type: 'demo-instructions' },
    },
    {
      id: 3,
      content: { type: 'ai', text: 'Enter your mobile number to get started.' },
    },
  ]);
  const [currentFlow, setCurrentFlow] = useState<'login' | 'main'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [awaitingOTP, setAwaitingOTP] = useState(false);
  const [selectedLoadForBid, setSelectedLoadForBid] = useState<number | string | null>(null);
  const [selectedBidForRevise, setSelectedBidForRevise] = useState<any | null>(null);
  const [selectedLoadForVehicle, setSelectedLoadForVehicle] = useState<any | null>(null);
  const [contextualHelp, setContextualHelp] = useState<string[]>([]);
  const [lang, setLang] = useState<"en" | "hi">("en");

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (content: MessageType) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), content, timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) },
    ]);
  };

  const handleUserMessage = async (text: string) => {
    addMessage({ type: 'user', text });

    // Handle login flow
    if (currentFlow === 'login') {
      if (!awaitingOTP && (text.includes('7718896629') || text.match(/^\d{10}$/))) {
        setAwaitingOTP(true);
        setTimeout(() => {
          addMessage({ type: 'ai', text: 'Please enter the OTP sent to your phone.' });
        }, 500);
      } else if (awaitingOTP && (text.includes('123456') || text.match(/^\d{6}$/))) {
        setIsLoggedIn(true);
        setCurrentFlow('main');
        setTimeout(() => {
          addMessage({ type: 'ai', text: '✅ Login successful! How can I help you today?' });
          setContextualHelp(['Search Load']);
        }, 500);
        setTimeout(() => {
          addMessage({ type: 'quick-actions' });
        }, 1000);
      }
      return;
    }

    // Build small chat history for AI (only text bubbles)
    const history: Array<{ role: "user" | "ai"; text: string }> = messages
      .filter((m) => m.content.type === "user" || m.content.type === "ai")
      .slice(-8)
      .map((m) => ({
        role: (m.content.type === "user" ? "user" : "ai") as "user" | "ai",
        text: (m.content as { text: string }).text,
      }));

    try {
      const result = await callAI(text, history, lang);

      if (result.kind === "text") {
        addMessage({ type: "ai", text: result.text });
        return;
      }

      if (result.kind === "my_bids") {
        addMessage({ type: "ai", text: result.text || "Here are your bids:" });
        addMessage({ type: "my-bids", bids: result.bids || [] });
        return;
      }

      if (result.kind === "action_points") {
        addMessage({ type: "ai", text: result.text || "Here are your action points:" });
        addMessage({
          type: "action-points",
          awaitingArrival: result.awaitingArrival || [],
          uploadPOD: result.uploadPOD || [],
        });
        return;
      }

      // default: kind === "loads"
      addMessage({ type: "ai", text: result.preface || "Here are the available loads:" });
      addMessage({ type: "loads", loads: result.loads });
    } catch (e: any) {
      addMessage({ type: "ai", text: "Sorry, something went wrong. Please try again." });
    }
  };

  const handlePlaceBid = (loadId: number | string, loadRoute: string) => {
    setSelectedLoadForBid(loadId);
    addMessage({ type: 'user', text: `Place bid on Load #${loadId}` });
    setTimeout(() => {
      addMessage({ type: 'bid-input', loadId, loadRoute });
      setContextualHelp([]);
    }, 500);
  };

  const handleBidSubmit = (amount: number) => {
    const load = mockLoads.find(l => l.id === selectedLoadForBid);
    const loadRoute = load ? `${load.route.from} → ${load.route.to}` : 'selected load';
    
    addMessage({ type: 'user', text: `₹${amount.toLocaleString('en-IN')}` });
    setTimeout(() => {
      addMessage({ type: 'bid-confirmation', bidAmount: amount, loadRoute });
      setContextualHelp(['Search Load', 'Show My Bids']);
    }, 500);
    setSelectedLoadForBid(null);
  };

  const handleReviseBid = (bid: any) => {
    setSelectedBidForRevise(bid);
    addMessage({ type: 'user', text: 'Revise the bid' });
    setTimeout(() => {
      addMessage({ type: 'revise-bid-input', bid });
      setContextualHelp([]);
    }, 500);
  };

  const handleReviseBidSubmit = (amount: number) => {
    addMessage({ type: 'user', text: `₹${amount.toLocaleString('en-IN')}` });
    setTimeout(() => {
      addMessage({
        type: 'ai',
        text: 'Bid updated successfully!',
      });
      addMessage({
        type: 'bid-confirmation',
        bidAmount: amount,
        loadRoute: `${selectedBidForRevise.route.from} → ${selectedBidForRevise.route.to}`,
      });
      setContextualHelp(['Search Load', 'Show My Bids']);
    }, 500);
    setSelectedBidForRevise(null);
  };

  const handleAttachVehicle = (load: any) => {
    setSelectedLoadForVehicle(load);
    addMessage({ type: 'user', text: `Attach vehicle for ${load.route.from} → ${load.route.to}` });
    setTimeout(() => {
      addMessage({ type: 'vehicle-form', load });
      setContextualHelp([]);
    }, 500);
  };

  const handleVehicleSubmit = (data: any) => {
    addMessage({ type: 'user', text: `Driver: ${data.driverName}, Mobile: ${data.driverMobile}, Vehicle: ${data.vehicleNumber}` });
    setTimeout(() => {
      addMessage({ type: 'vehicle-confirmation' });
      setContextualHelp(['Search Load', 'Action Points']);
    }, 500);
    setSelectedLoadForVehicle(null);
  };

  const handleUploadPOD = (load: any) => {
    addMessage({ type: 'user', text: `Upload POD for ${load.route.from} → ${load.route.to}` });
    setTimeout(() => {
      addMessage({ type: 'ai', text: 'Please upload your POD (Proof of Delivery) document. You can upload a JPG, PNG, or PDF file.' });
    }, 500);
    setTimeout(() => {
      addMessage({
        type: 'ai',
        text: '📎 Click here to upload POD document\n\n(In a real app, this would open a file picker)',
      });
      setContextualHelp(['Search Load', 'Action Points']);
    }, 1000);
  };

  const handleContextualClick = (action: string) => {
    const actionMap: { [key: string]: string } = {
      'Search Load': 'Search load from Delhi to Mumbai',
      'Place Bid': 'Place bid on this load',
      'Revise Bid': 'Show all loads where I have placed bids',
      'Attach Vehicle': 'I want to attach vehicle',
      'Upload POD': 'Show action points on me',
      'Show My Bids': 'Show all loads where I have placed bids',
      'Action Points': 'Show action points on me'
    };

    const command = actionMap[action] || action;
    handleUserMessage(command);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 max-w-2xl mx-auto lg:shadow-2xl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-5 py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/axle-logo.png"
              alt="Axle by Delhivery"
              className="h-9 w-auto object-contain"
            />
            <div>
              <p className="text-gray-500 text-[12px]">
                {isLoggedIn ? 'Managing your loads' : 'Fleet Management Assistant'}
              </p>
            </div>
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 rounded-full p-1 border border-gray-200">
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                    lang === "en" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("hi")}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                    lang === "hi" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  HI
                </button>
              </div>

              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-5">
        {messages.map((message) => {
          const { content } = message;

          if (content.type === 'user' || content.type === 'ai') {
            return (
              <ChatBubble
                key={message.id}
                message={content.text}
                isUser={content.type === 'user'}
              />
            );
          }

          if (content.type === 'loads') {
            return (
              <div key={message.id} className="mb-4">
                {content.loads.map((load) => (
                  <LoadCard
                    key={load.id}
                    route={load.route}
                    truckType={load.truckType}
                    material={load.material}
                    capacity={load.capacity}
                    biddingEndTime={load.biddingEndTime}
                    targetPrice={load.targetPrice}
                    status={load.status}
                    loadType={load.loadType}
                    onAction={() => handlePlaceBid(load.id, `${load.route.from} → ${load.route.to}`)}
                    actionLabel="Place Bid"
                  />
                ))}
              </div>
            );
          }

          if (content.type === 'bid-input') {
            return (
              <div key={message.id}>
                <ChatBubble message={`Enter your bid amount for ${content.loadRoute}`} isUser={false} />
                <BidInputPrompt onSubmit={handleBidSubmit} />
              </div>
            );
          }

          if (content.type === 'revise-bid-input') {
            return (
              <div key={message.id}>
                <ChatBubble message="Enter new bid amount" isUser={false} />
                <BidInputPrompt
                  onSubmit={handleReviseBidSubmit}
                  defaultValue={content.bid.bidAmount}
                  label="Enter new bid amount"
                />
              </div>
            );
          }

          if (content.type === 'bid-confirmation') {
            return (
              <div key={message.id}>
                <ConfirmationMessage
                  message="Bid placed successfully!"
                  subtext={`Your bid of ₹${content.bidAmount.toLocaleString('en-IN')} for ${content.loadRoute} has been submitted.`}
                  type="success"
                />
              </div>
            );
          }

          if (content.type === 'my-bids') {
            return (
              <div key={message.id} className="mb-4">
                {content.bids.length === 0 ? (
                  <EmptyState type="no-bids" />
                ) : (
                  content.bids.map((bid) => (
                    <LoadCard
                      key={bid.id}
                      route={bid.route}
                      truckType={bid.truckType}
                      bidAmount={bid.bidAmount}
                      status={bid.status}
                      bidStatus={bid.bidStatus}
                      biddingEndTime={bid.biddingEndTime}
                      loadType={bid.loadType}
                      onAction={
                        bid.status === 'awaiting-arrival'
                          ? () => handleAttachVehicle(bid)
                          : bid.bidStatus === 'placed' || bid.bidStatus === 'revised'
                          ? () => handleReviseBid(bid)
                          : undefined
                      }
                      actionLabel={
                        bid.status === 'awaiting-arrival'
                          ? 'Attach Vehicle'
                          : bid.bidStatus === 'placed' || bid.bidStatus === 'revised'
                          ? 'Revise Bid'
                          : undefined
                      }
                    />
                  ))
                )}
              </div>
            );
          }

          if (content.type === 'action-points') {
            return (
              <div key={message.id} className="mb-4">
                {content.awaitingArrival.length === 0 && content.uploadPOD.length === 0 ? (
                  <EmptyState type="no-actions" />
                ) : (
                  <>
                    {content.awaitingArrival.length > 0 && (
                      <>
                        <div className="mb-3">
                          <h3 className="font-semibold text-gray-700 text-[14px] mb-2 px-1">
                            ⚠️ Awaiting Arrival ({content.awaitingArrival.length})
                          </h3>
                          {content.awaitingArrival.map((load) => (
                            <LoadCard
                              key={load.id}
                              route={load.route}
                              truckType={load.truckType}
                              status={load.status}
                              bidAmount={load.bidAmount}
                              onAction={() => handleAttachVehicle(load)}
                              actionLabel="Attach Vehicle"
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {content.uploadPOD.length > 0 && (
                      <>
                        <div className="mb-3">
                          <h3 className="font-semibold text-gray-700 text-[14px] mb-2 px-1">
                            📄 Upload POD Required ({content.uploadPOD.length})
                          </h3>
                          {content.uploadPOD.map((load) => (
                            <LoadCard
                              key={load.id}
                              route={load.route}
                              truckType={load.truckType}
                              status={load.status}
                              bidAmount={load.bidAmount}
                              onAction={() => handleUploadPOD(load)}
                              actionLabel="Upload POD"
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            );
          }

          if (content.type === 'vehicle-form') {
            return (
              <div key={message.id}>
                <VehicleAttachForm
                  route={content.load.route}
                  onSubmit={handleVehicleSubmit}
                />
              </div>
            );
          }

          if (content.type === 'vehicle-confirmation') {
            return (
              <div key={message.id}>
                <ConfirmationMessage
                  message="Vehicle attached successfully!"
                  subtext="The driver will be notified and tracking will begin."
                  type="success"
                />
              </div>
            );
          }

          if (content.type === 'empty') {
            return (
              <div key={message.id}>
                <EmptyState type={content.emptyType} />
              </div>
            );
          }

          if (content.type === 'quick-actions') {
            return (
              <div key={message.id}>
                <QuickActions onActionClick={handleUserMessage} />
              </div>
            );
          }

          if (content.type === 'demo-instructions') {
            return (
              <div key={message.id}>
                <DemoInstructions />
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Input Area */}
      <ChatInput 
        onSend={handleUserMessage} 
        contextualHelp={contextualHelp}
        onContextualClick={handleContextualClick}
        lang={lang}
      />
    </div>
  );
}

export default App;
