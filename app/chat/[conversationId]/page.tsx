"use client";
import { useState, use, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { format, isToday, isThisYear } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

const generateSmartTimestamp = (unixTime: number) => {
  const messageDate = new Date(unixTime);
  if (isToday(messageDate)) return format(messageDate, "h:mm a");
  if (isThisYear(messageDate)) return format(messageDate, "MMM d, h:mm a");
  return format(messageDate, "MMM d yyyy, h:mm a");
};
export default function ActiveConversationArea({ 
  params 
}: { 
  params: Promise<{ conversationId: string }> 
}) {
  const router = useRouter();
  const { conversationId } = use(params);
  const chatId = conversationId as Id<"conversations">;
  const [draftMessage, setDraftMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = useQuery(api.users.me);
  const chatMessages = useQuery(api.messages.fetchByChatId, { chatId });
  const pushMessage = useMutation(api.messages.send);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);
  const handleDispatchMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftMessage.trim() || !chatId || isSending) return;
    
    const textToSend = draftMessage;
    setDraftMessage("");
    setIsSending(true);
    
    try {
      await pushMessage({ chatId, text: textToSend });
    } catch (error) {
      console.error("Failed to send message", error);
      setDraftMessage(textToSend); 
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-muted/10 relative">
      <div className="flex items-center p-4 h-[72px] border-b bg-background/95 backdrop-blur z-10 shadow-sm md:shadow-none">
        <Button variant="ghost" size="icon" onClick={() => router.push('/chat')} className="mr-2 md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h2 className="font-semibold text-sm">Conversation</h2>
            <p className="text-[11px] text-muted-foreground">End-to-end encrypted (Simulated)</p>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 md:p-6">
        <div className="space-y-6 flex flex-col justify-end min-h-full pb-4 max-w-3xl mx-auto">
          {chatMessages?.length === 0 && (
            <div className="text-center my-auto pt-20">
              <span className="bg-background px-4 py-2 rounded-full text-xs font-medium text-muted-foreground shadow-sm border border-border">
                This is the beginning of your chat history.
              </span>
            </div>
          )}
          {chatMessages?.map((msg, index) => {
            const isMe = currentUser?._id === msg.senderId;
            const isPrevSame = index > 0 && chatMessages[index - 1].senderId === msg.senderId;
            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${isPrevSame ? "-mt-4" : ""}`}>
                <div 
                  className={`px-4 py-2.5 max-w-[75%] md:max-w-[65%] shadow-sm text-[15px] leading-relaxed
                    ${isMe 
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" 
                      : "bg-background border border-border text-foreground rounded-2xl rounded-tl-sm"
                    }
                  `}
                >
                  <p>{msg.content}</p>
                </div>
                <span className={`text-[10px] text-muted-foreground mt-1 px-1 opacity-70 ${isPrevSame ? "hidden" : "block"}`}>
                  {generateSmartTimestamp(msg._creationTime)}
                </span>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="p-4 bg-background/95 backdrop-blur border-t z-10">
        <form onSubmit={handleDispatchMessage} className="max-w-3xl mx-auto relative flex gap-3 items-center">
          <Input 
            placeholder="Type your message..." 
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
            className="rounded-full bg-muted/40 border-muted-foreground/20 h-12 px-6 pr-14 text-[15px] focus-visible:ring-primary/50 shadow-inner"
            disabled={!chatId || isSending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full shadow-sm transition-all hover:scale-105" 
            disabled={!draftMessage.trim() || !chatId || isSending}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -ml-0.5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}