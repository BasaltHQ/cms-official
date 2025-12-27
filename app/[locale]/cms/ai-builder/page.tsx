"use client";

import "regenerator-runtime/runtime";
import { useState, useEffect, useRef } from "react";
import { Mic, Send, Sparkles, StopCircle, RefreshCw, LayoutTemplate, ArrowLeft } from "lucide-react";
import Link from "next/link";

import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Render, Data } from "@measured/puck";
import { puckConfig } from "@/lib/puck.config";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import "@measured/puck/puck.css"; 
// New Components
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeploymentDropdown } from "@/components/landing/DeploymentDropdown";
import { saveAiBuilderDraft } from "@/actions/cms/save-ai-draft";
import { useRouter } from "next/navigation"; 
import { toast } from "sonner";

 

// Initial empty state
const initialData: Data = {
  content: [],
  root: { props: { title: "New Landing Page" } },
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AiBuilderPage() {
  const router = useRouter();

  // AI Chat Hook

  // Manual AI Chat Logic to bypass type issues
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);


  const append = async (message: Message) => {
    setMessages((prev) => [...prev, message]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-builder', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, message],
        }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedContent = "";

      // Optimistic AI message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        accumulatedContent += chunkValue;
        
        // Update last message
        setMessages((prev) => {
           const newMsg = [...prev];
           newMsg[newMsg.length - 1].content = accumulatedContent;
           return newMsg;
        });
      }

      // JSON Parsing & TTS logic
      try {
        const jsonPart = accumulatedContent.substring(accumulatedContent.indexOf('{'), accumulatedContent.lastIndexOf('}') + 1);
        if (jsonPart) {
            const newData = JSON.parse(jsonPart);
            if (newData.content && newData.root) {
                setPuckData(newData as Data);
                setStreamBuffer(""); 
                new Audio("/api/tts?text=Page%20updated").play().catch(() => {});
            }
        }
      } catch (e) {
         console.error("Failed to parse JSON", e);
      }

    } catch (error) {
       console.error(error);
    } finally {
       setIsLoading(false);
    }
  };


  const [puckData, setPuckData] = useState<Data>(initialData);
  const [streamBuffer, setStreamBuffer] = useState("");
  
  // Voice Recognition

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync voice transcript to input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    // Clearing input is handled by useChat append usually, or we can clear manually if we use setInput
    // useChat `append` sends the message instantly.
    
    resetTranscript();
    setStreamBuffer(""); 
    
    append({ role: "user", content: userMsg });
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar / Chat */}
      <div className="w-[400px] flex flex-col border-r border-white/10 bg-neutral-900/50 backdrop-blur-xl">
        <header className="h-16 border-b border-white/10 flex items-center px-6 gap-3">
          <Link href="/cms" className="mr-2 text-slate-400 hover:text-white transition-colors" title="Back to Dashboard">
             <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">

            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">AI Builder</h1>
        </header>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
             {messages.length === 0 && (
                <div className="text-center py-10 opacity-50">
                    <LayoutTemplate className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                    <p>Describe your landing page,<br/>and I'll build it in seconds.</p>
                </div>
             )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'bg-white/10 text-slate-200'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-white/10 text-slate-200 animate-pulse">
                        <Sparkles className="w-4 h-4 inline-block mr-2 animate-spin" />
                        Generating design...
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
          <form onSubmit={handleSubmit} className="relative flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={`rounded-xl border-white/10 bg-white/5 hover:bg-white/10 ${listening ? 'text-red-500 border-red-500/50 animate-pulse' : 'text-slate-400'}`}
              onClick={toggleListening} 
            >
              {listening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Make it pop..."
                className="bg-white/5 border-white/10 focus-visible:ring-indigo-500 rounded-xl h-10"
            />
            
            <Button 
                type="submit" 
                size="icon"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                disabled={!(input || '').trim() || isLoading}
            >
                <Send className="w-4 h-4" />
            </Button>
          </form>
          {mounted && browserSupportsSpeechRecognition && (
             <p className="text-[10px] text-center text-slate-600 mt-2">Voice input supported</p>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-[#121212] relative overflow-hidden flex flex-col">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Live Preview</span>
            </div>
            <div className="flex gap-2 items-center">
                 <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" onClick={() => setIsResetDialogOpen(true)}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Reset
                 </Button>
                 
                 <div className="w-px h-6 bg-white/10 mx-2" />

                 <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    onClick={async () => {
                        const result = await saveAiBuilderDraft(puckData);
                        if (result.success) {
                            toast.success("Draft saved!", { description: "Redirecting to Websites..." });
                            router.push('/cms/landing'); 
                        } else {
                            toast.error("Failed to save draft");
                        }
                    }}
                 >
                    <LayoutTemplate className="w-4 h-4 mr-2" /> Save Draft
                 </Button>

                 <div className="w-px h-6 bg-white/10 mx-2" />

                 {/* Deployment Dropdown - Passing empty ID, handled gracefully by component or action failure */}
                 <DeploymentDropdown 
                    pageId={""} // Cannot deploy until saved
                    pageSlug={"new-page"} 
                    lastPublishedAt={null} 
                    data={puckData}
                    wordPressPostId={null}
                    onSyncSuccess={() => {}}
                 />
            </div>
        </header>

        <ResetDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen} onConfirm={() => {
            setPuckData(initialData);
            setMessages([]);
            setIsResetDialogOpen(false);
        }} />


        <div className="flex-1 overflow-auto p-8 relative">

            <div className="max-w-6xl mx-auto bg-neutral-900 rounded-lg shadow-2xl min-h-[calc(100vh-10rem)] overflow-hidden ring-1 ring-white/10">
                 {/* Puck Renderer */}
                <Render config={puckConfig} data={puckData} />
            </div>
        </div>
      </div>
    </div>
  );
}

function ResetDialog({ open, onOpenChange, onConfirm }: { open: boolean, onOpenChange: (open: boolean) => void, onConfirm: () => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Reset Page?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to reset? All current progress will be lost.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm}>Reset Page</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
