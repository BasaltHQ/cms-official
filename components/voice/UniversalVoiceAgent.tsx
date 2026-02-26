
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, X, Maximize2, Minimize2, Phone, Ghost, MapPin, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { CMS_MODULES } from "@/app/[locale]/cms/config";

// Types
type AgentState = "idle" | "connecting" | "listening" | "speaking";

// Helper to generate sitemap string - moved inside component to access params

export function UniversalVoiceAgent() {
    const params = useParams();
    const locale = (params?.locale as string) || "en";
    const tenant = (params?.tenant as string) || "my-workspace";

    const sitemapContext = CMS_MODULES.map(m => {
        let base = `- ${m.label}: ${m.href(locale, tenant)}`;
        if (m.options) {
            return base + "\n" + m.options.map(o => `  * ${o.label}: ${o.href(locale, tenant)}`).join("\n");
        }
        return base;
    }).join("\n");

    const [isOpen, setIsOpen] = useState(false); // Minimized vs Expanded
    const [isActive, setIsActive] = useState(false); // Connected or not
    const [agentState, setAgentState] = useState<AgentState>("idle");
    const [transcript, setTranscript] = useState<string>("");

    // UI Helper State
    const [status, setStatus] = useState<string>("Ready");
    const [activeTool, setActiveTool] = useState<string | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    // Color mapping for tools
    const TOOL_COLORS: Record<string, string> = {
        navigate: "bg-blue-500",
        read_page_content: "bg-emerald-500",
        click_element: "bg-orange-500",
        fill_input: "bg-purple-500",
        default: "bg-indigo-500"
    };

    const currentColor = activeTool ? TOOL_COLORS[activeTool] : (isActive ? "bg-indigo-500" : "bg-slate-500");

    // WebRTC Refs
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const dcRef = useRef<RTCDataChannel | null>(null);
    const audioElRef = useRef<HTMLAudioElement | null>(null);
    const msRef = useRef<MediaStream | null>(null);

    // Tools
    const router = useRouter();
    const pathname = usePathname();

    // Toggle Visibility
    const toggleOpen = () => setIsOpen(!isOpen);

    // -------------------------------------------------------------------------
    // TOOL DEFINITIONS
    // -------------------------------------------------------------------------


    // -------------------------------------------------------------------------
    // PAGE CONTEXT & NAVIGATION LISTENER
    // -------------------------------------------------------------------------
    // Inject system message on navigation so agent knows context changed immediately
    useEffect(() => {
        if (!dcRef.current || dcRef.current.readyState !== "open") return;

        const msg = {
            type: "conversation.item.create",
            item: {
                type: "message",
                role: "system",
                content: [
                    { type: "input_text", text: `[System] User navigated to "${pathname}". Page loaded.` }
                ]
            }
        };
        dcRef.current.send(JSON.stringify(msg));
        dcRef.current.send(JSON.stringify({ type: "response.create" })); // Trigger response/acknowledgement if needed, or just let it be silent context.

    }, [pathname]);

    // ... existing useEffect ...

    const tools = {
        navigate: async ({ path }: { path: string }) => {
            setActiveTool("navigate");
            setStatus(`Navigating to ${path}...`);
            try {
                // toast.info(`Navigating to ${path}...`);
                console.log("Tool: Navigating to", path);
                router.push(path);
                return { success: true, message: `Navigated to ${path}` };
            } catch (e: any) {
                return { success: false, error: e.message };
            } finally {
                setTimeout(() => { setActiveTool(null); setStatus("Ready"); }, 2000);
            }
        },
        go_back: async () => {
            setActiveTool("navigate");
            setStatus("Going back...");
            try {
                // toast.info("Going back...");
                router.back();
                return { success: true, message: "Navigated back" };
            } catch (e: any) {
                return { success: false, error: e.message };
            } finally {
                setTimeout(() => { setActiveTool(null); setStatus("Ready"); }, 2000);
            }
        },
        get_current_page: async () => {
            return { path: pathname, title: document.title };
        },
        read_page_content: async () => {
            setActiveTool("read_page_content");
            setStatus("Reading page content...");
            try {
                // toast.info("Reading page content...");
                const main = document.querySelector("main")?.innerText || document.body.innerText;
                const cleanedText = main.replace(/\s+/g, " ").trim().substring(0, 2000);

                // Extract interactive elements with indices for duplicates
                const interactables: string[] = [];
                const counts: Record<string, number> = {};

                document.querySelectorAll("button, a").forEach(el => {
                    const element = el as HTMLElement;
                    let name = element.getAttribute("aria-label") || element.title || element.innerText?.trim() || element.textContent?.trim();
                    if (name && name.length < 50) {
                        if (!counts[name]) counts[name] = 0;
                        const idx = counts[name]++;
                        interactables.push(`${name} [Index: ${idx}]`);
                    }
                });

                // Extract Form Inputs
                const inputs: string[] = [];
                document.querySelectorAll("input, textarea, select").forEach(el => {
                    const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
                    if (input.type === "hidden" || input.style.display === "none") return;

                    let label = (input as any).placeholder || "";
                    if (!label && input.id) {
                        const labelEl = document.querySelector(`label[for="${input.id}"]`);
                        if (labelEl) label = labelEl.textContent?.trim() || "";
                    }
                    if (!label) label = input.getAttribute("aria-label") || input.name || "Untitled Input";

                    inputs.push(`[${input.tagName.toLowerCase()}] ${label} (Current: "${input.value}")`);
                });

                return {
                    content: cleanedText + "...",
                    actions: interactables.slice(0, 30),
                    inputs: inputs.slice(0, 15)
                };
            } catch (e: any) {
                return { success: false, error: "Failed to read content" };
            } finally {
                setTimeout(() => { setActiveTool(null); setStatus("Ready"); }, 2000);
            }
        },
        click_element: async ({ text, index = 0 }: { text: string, index?: number }) => {
            setActiveTool("click_element");
            setStatus(`Clicking "${text}"...`);
            try {
                console.log(`Tool: Clicking element "${text}" at index ${index}`);
                const search = text.toLowerCase();
                let matchCount = 0;
                let found = false;

                const elements = document.querySelectorAll("button, a");
                for (const el of Array.from(elements)) {
                    const element = el as HTMLElement;
                    const match = (element.innerText?.toLowerCase().includes(search)) ||
                        (element.getAttribute("aria-label")?.toLowerCase().includes(search)) ||
                        (element.title?.toLowerCase().includes(search)) ||
                        (element.textContent?.toLowerCase().includes(search));

                    if (match) {
                        if (matchCount === index) {
                            element.click();
                            found = true;
                            // toast.success(`Clicked "${text}"`);
                            break;
                        }
                        matchCount++;
                    }
                }

                if (!found) return { success: false, error: `Could not find element matching "${text}" at index ${index}` };
                return { success: true, message: `Clicked element "${text}"` };
            } catch (e: any) {
                return { success: false, error: e.message };
            } finally {
                setTimeout(() => { setActiveTool(null); setStatus("Ready"); }, 2000);
            }
        },
        fill_input: async ({ label, value }: { label: string, value: string }) => {
            setActiveTool("fill_input");
            setStatus(`Filling "${label}"...`);
            try {
                console.log(`Tool: Filling input "${label}" with "${value}"`);
                let input: HTMLInputElement | HTMLTextAreaElement | null = null;

                // 1. Try by Placeholder
                document.querySelectorAll("input, textarea").forEach(el => {
                    if ((el as HTMLInputElement).placeholder?.toLowerCase().includes(label.toLowerCase())) {
                        input = el as HTMLInputElement;
                    }
                });

                // 2. Try by Label (if not found)
                if (!input) {
                    const labels = Array.from(document.querySelectorAll("label"));
                    const matchingLabel = labels.find(l => l.innerText?.toLowerCase().includes(label.toLowerCase()));
                    if (matchingLabel && matchingLabel.htmlFor) {
                        input = document.getElementById(matchingLabel.htmlFor) as any;
                    }
                }

                if (!input) return { success: false, error: `Could not find input matching "${label}"` };

                // Set value and trigger React events
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
                if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(input, value);
                } else {
                    input.value = value;
                }

                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));

                // toast.success(`Filled ${label}`);
                return { success: true, message: `Filled input "${label}" with "${value}"` };

            } catch (e: any) {
                return { success: false, error: e.message };
            } finally {
                setTimeout(() => { setActiveTool(null); setStatus("Ready"); }, 2000);
            }
        }
    };

    const sessionConfig = {
        instructions: `
            You are "Gemini", a helpful voice assistant for the BasaltCMS application.
            - **Navigation**:
                - Use 'navigate' to go to SITEMAP paths. 
                - WAIT for the [System] message confirming page load before assuming you are there.
            - **Page Control**:
                - 'read_page_content' prioritizes OPEN MODALS. If a modal is open, focus on that.
                - Use 'click_element' and 'fill_input' to interact.
            - Be concise.
            - System: You are currently on page "${pathname}".
            
            AVAILABLE APP NAVIGATION (SITEMAP):
            ${sitemapContext}
        `,
        // ...
    };

    // UI RENDER
    // ...
    // Using z-[9999] to be above everything including Radix UI modals (usually z-50)


    // -------------------------------------------------------------------------
    // CONNECTION LOGIC
    // -------------------------------------------------------------------------
    const startSession = async () => {
        try {
            setAgentState("connecting");
            setIsActive(true);
            setIsOpen(true);

            // 1. Get Token
            const tokenRes = await fetch("/api/voice/token");
            if (!tokenRes.ok) throw new Error("Failed to get voice token");
            const { token, url: azureEndpoint } = await tokenRes.json();

            // 2. Init WebRTC
            const pc = new RTCPeerConnection();
            pcRef.current = pc;

            // Audio Setup
            audioElRef.current = document.createElement("audio");
            audioElRef.current.autoplay = true;

            // Handle Incoming Audio
            pc.ontrack = (e) => {
                if (audioElRef.current) {
                    audioElRef.current.srcObject = e.streams[0];
                }
            };

            // Add Microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            msRef.current = stream;
            pc.addTrack(stream.getTracks()[0], stream);

            // Data Channel for Events/Tools
            const dc = pc.createDataChannel("oai-events");
            dcRef.current = dc;

            dc.onopen = () => {
                setAgentState("idle");
                // Send Initial Config
                const event = {
                    type: "session.update",
                    session: sessionConfig
                };
                dc.send(JSON.stringify(event));
            };

            dc.onmessage = async (e) => {
                const msg = JSON.parse(e.data);

                // Handle different event types
                if (msg.type === "response.audio.transcript.delta") {
                    setTranscript(prev => prev + msg.delta);
                    setAgentState("speaking");
                }

                if (msg.type === "response.done") {
                    setAgentState("idle");
                }

                if (msg.type === "input_audio_buffer.speech_started") {
                    setAgentState("listening");
                    setTranscript(""); // Clear previous
                }

                // TOOL CALL HANDLING
                if (msg.type === "response.function_call_arguments.done") {
                    // Logic to handle function calls would normally go here in the official protocol
                    // Simplification: We wait for the 'response.output_item.added' which contains the call_id in standard API,
                    // but for Realtime API via WebRTC, we look for 'response.function_call_arguments.done'.
                    // NOTE: The Azure/OpenAI Realtime protocol is distinct.
                    // We stick to the standard 'response.done' scanning for tool calls if the delta approach is complex.
                }

                // Actual Tool Logic Loop (Simplified for robust demo)
                // When we receive a "response.function_call_arguments.done", we execute and send "conversation.item.create" with output.
                if (msg.type === "response.function_call_arguments.done") {
                    const { name, arguments: args, call_id } = msg;
                    try {
                        const toolFn = (tools as any)[name];
                        if (toolFn) {
                            const result = await toolFn(JSON.parse(args));

                            // Send Result Back
                            const responseEvent = {
                                type: "conversation.item.create",
                                item: {
                                    type: "function_call_output",
                                    call_id: call_id,
                                    output: JSON.stringify(result)
                                }
                            };
                            dc.send(JSON.stringify(responseEvent));

                            // Trigger response generation
                            dc.send(JSON.stringify({ type: "response.create" }));
                        }
                    } catch (err) {
                        console.error("Tool Execution Failed", err);
                    }
                }
            };

            // 3. Connect (Offer/Answer)
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Use the specific Realtime WebRTC URL provided by the user config 
            // (or fallback to what the token endpoint suggests)
            // The token endpoint returns `url` which we might use, OR we use the env-var based URL.
            // For the user provided `.../v1/realtimertc`, we POST the SDP there.

            // We need to append the deployment if it's not in the base URL, but for the "gateway" style,
            // query params are often used.
            // Let's rely on the token response to give us the best hint, or hardcode the user's pattern.

            // Pattern: NEXT_PUBLIC_AZURE_OPENAI_REALTIME_WEBRTC_URL + "?deployment=..." + "&api-version=..."
            const ep = process.env.NEXT_PUBLIC_AZURE_OPENAI_REALTIME_WEBRTC_URL
                || (azureEndpoint + "/openai/deployments/gpt-realtime/webrtc-checkin"); // Fallback

            const deploymentName = process.env.NEXT_PUBLIC_AZURE_OPENAI_REALTIME_DEPLOYMENT || "gpt-realtime";
            const apiVersion = process.env.NEXT_PUBLIC_AZURE_OPENAI_REALTIME_API_VERSION || "2024-10-01-preview";

            const handshakeUrl = `${ep}?deployment=${deploymentName}&api-version=${apiVersion}`;

            const sdpResponse = await fetch(handshakeUrl, {
                method: "POST",
                body: offer.sdp,
                headers: {
                    "Content-Type": "application/sdp",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!sdpResponse.ok) throw new Error("SDP Handshake failed");

            const answerSdp = await sdpResponse.text();
            await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

            toast.success("Voice Agent Connected");

        } catch (error) {
            console.error(error);
            toast.error("Failed to connect voice agent");
            disconnect();
        }
    };

    const disconnect = () => {
        if (pcRef.current) pcRef.current.close();
        if (msRef.current) msRef.current.getTracks().forEach(t => t.stop());
        pcRef.current = null;
        msRef.current = null;
        dcRef.current = null;
        setIsActive(false);
        setAgentState("idle");
    };

    // Auto-update session context when path changes
    useEffect(() => {
        if (isActive && dcRef.current && dcRef.current.readyState === "open") {
            const event = {
                type: "session.update",
                session: {
                    instructions: `Update: The user is now on page "${pathname}".`
                }
            };
            dcRef.current.send(JSON.stringify(event));
        }
    }, [pathname, isActive]);

    // Listen for global open event (e.g. from mobile nav)
    useEffect(() => {
        function handleOpen() {
            setIsOpen(true);
            if (!isActive) startSession();
        }
        window.addEventListener("basalt:open-agent", handleOpen);
        return () => window.removeEventListener("basalt:open-agent", handleOpen);
    }, [isActive]);




    // -------------------------------------------------------------------------
    // RENDER INTERFACE (SIDEBAR INTEGRATION)
    // -------------------------------------------------------------------------
    return (
        <div className="relative w-full flex items-center justify-center p-2 group">
            {/* 1. VISUALIZER (Rides up the sidebar) */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        className="absolute inset-x-0 bottom-0 pointer-events-none flex justify-center items-end gap-1 h-[200px] opacity-20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.2 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Simple CSS-based Audio Visualizer Emulation */}
                        {[1, 2, 3, 4, 3, 2, 1].map((bar, i) => (
                            <motion.div
                                key={i}
                                className={cn("w-1 rounded-t-full", currentColor)}
                                animate={{
                                    height: agentState === "speaking" ? [10, 40 * bar, 10] :
                                        agentState === "listening" ? [10, 20 * bar, 10] : 10
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: agentState === "speaking" ? 0.2 : 0.5,
                                    delay: i * 0.1
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. TRIGGER BUTTON */}
            <Button
                variant="ghost"
                onClick={() => isActive ? disconnect() : startSession()}
                className={cn(
                    "relative z-10 w-10 h-10 rounded-full transition-all duration-500 border overflow-hidden",
                    isActive ? "border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)] bg-indigo-950/30" : "border-transparent hover:bg-slate-800"
                )}
            >
                {/* Inner Icon / Status Indicator */}
                <div className={cn("absolute inset-0 flex items-center justify-center transition-all", isActive ? "opacity-100" : "opacity-50")}>
                    {isActive ? (
                        agentState === "speaking" ? <div className="animate-pulse"><Ghost className="w-5 h-5 text-indigo-400" /></div> :
                            agentState === "listening" ? <Mic className="w-5 h-5 text-emerald-400 animate-bounce" /> :
                                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                    ) : (
                        <Mic className="w-5 h-5 text-slate-400" />
                    )}
                </div>
            </Button>

            {/* 3. HOVER / DETAILS CARD (Pop-out) */}
            <AnimatePresence>
                {(showDetails || (isActive && agentState !== "idle")) && (
                    <motion.div
                        className="absolute bottom-full left-0 mb-4 w-64 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl z-50 overflow-hidden"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        style={{ transformOrigin: "bottom left" }}
                    >
                        {/* Status Header */}
                        <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
                            <div className={cn("w-2 h-2 rounded-full", currentColor)} />
                            <span className="text-xs font-medium text-slate-200 uppercase tracking-wider">{activeTool || agentState}</span>
                        </div>

                        {/* Live Transcript / Status */}
                        <div className="min-h-[40px] text-xs text-slate-300 font-mono leading-relaxed">
                            {status !== "Ready" ? status : (transcript || "Listening...")}
                        </div>

                        {/* Active Tool Indicator (If any) */}
                        {activeTool && (
                            <div className="mt-2 text-[10px] bg-white/5 rounded px-2 py-1 text-slate-400 border border-white/5 flex items-center justify-between">
                                <span>Executing Tool...</span>
                                <div className="flex gap-0.5">
                                    <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-1 h-1 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Invisible Hover Trigger Area covering the button and surrounding */}
            <div
                className="absolute inset-0 z-0"
                onMouseEnter={() => setShowDetails(true)}
                onMouseLeave={() => setShowDetails(false)}
            />
        </div>
    );
}
