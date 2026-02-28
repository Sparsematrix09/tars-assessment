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
import { ArrowLeft, Send, Loader2, ShieldCheck } from "lucide-react";

const gentime = (unixTime: number) =>{
  const msgdate = new Date(unixTime);
  if (isToday(msgdate)) return format(msgdate, "h:mm a");
  if (isThisYear(msgdate)) return format(msgdate, "MMM d, h:mm a");
  return format(msgdate, "MMM d yyyy, h:mm a");
};

export default function ActiveConversationArea({ 
  params 
}: { 
  params: Promise<{ conversationId: string }> 
}) {
  const router = useRouter();
  const { conversationId } = use(params);
  const chatId = conversationId as Id<"conversations">;
  const [msgdraft, setMsgDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentUser = useQuery(api.users.me); 
  const chatMessages = useQuery(api.messages.fetchByChatId, { chatId });
  const sendmsg = useMutation(api.messages.send);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handlesendMsg = async (e: React.FormEvent)=>{
    e.preventDefault();
    const cleanContent = msgdraft.trim();

    if (!cleanContent || !chatId || isSending) return;    
    setMsgDraft("");
    setIsSending(true);
    
    try {
      await sendmsg({ chatId, text: cleanContent });
    } catch (error) {
      console.error("Failed to push message:", error);
      setMsgDraft(cleanContent);
    } finally {
      setIsSending(false);
    }
  };

  return(
    <div className="flex flex-col h-full bg-muted/5 relative overflow-hidden font-sans">      
      <header className="flex items-center p-4 h-[72px] border-b bg-background/80 backdrop-blur-md z-20 shadow-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/chat')} 
          className="mr-3 md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
       
        <div className="flex flex-col">
          <h2 className="font-bold text-sm tracking-tight">Conversation</h2>
          <div className="flex items-center gap-1 text-[10px] text-primary font-medium uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3" />
            <span>Secure Connection</span>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4 max-w-3xl mx-auto pb-6">
          
          {chatMessages?.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-20 text-center">
              <div className="p-4 bg-background rounded-2xl border shadow-sm max-w-xs">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Beginning of your encrypted chat history.
                </p>
              </div>
            </div>
          )}

          {chatMessages?.map((msg, index) =>{
            const isMe = currentUser?._id === msg.senderId;
            const isPrevSame = index > 0 && chatMessages[index - 1].senderId === msg.senderId;
            return(
              <div 
                key={msg._id} 
                className={`flex flex-col ${isMe ? "items-end" : "items-start"} ${isPrevSame ? "mt-1" : "mt-6"}`}
              >
                <div 
                  className={`px-4 py-2.5 max-w-[85%] md:max-w-[70%] shadow-sm text-[15px]
                    ${isMe 
                      // Replaced solid darkbkg with light bckg nd border
                      ? "bg-primary/15 text-primary border border-primary/20 rounded-2xl rounded-tr-sm" 
                      : "bg-background border border-border text-foreground rounded-2xl rounded-tl-sm"
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                
                {!isPrevSame &&(
                  <span className="text-[10px] text-muted-foreground mt-1.5 px-1 opacity-70 font-medium">
                    {gentime(msg._creationTime)}
                  </span>
                )}
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <footer className="p-4 bg-background border-t">
        <form 
          onSubmit={handlesendMsg} 
          className="max-w-3xl mx-auto flex gap-3 items-center"
        >
          <div className="relative flex-1">
            <Input 
              placeholder="Type your message..." 
              value={msgdraft}
              onChange={(e) => setMsgDraft(e.target.value)}
              className="rounded-xl bg-muted/30 border-none h-11 px-5 pr-12 text-[15px] focus-visible:ring-primary/30"
              disabled={isSending}
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost"
              className="absolute right-1 top-1 h-9 w-9 text-primary hover:bg-primary/10 transition-colors" 
              disabled={!msgdraft.trim() || isSending}
            >
              {isSending? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}