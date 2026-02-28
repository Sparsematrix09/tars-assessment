"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MessageSquare, Plus, Circle, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function ChatApplicationLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const router = useRouter();    
  const [searchText, setSearchText] = useState<string>("");
  //Skip queries until user is ready to prevent Unauthorized warnings
  const searchResults = useQuery(
    api.users.searchProfiles, 
    user && searchText ? { searchTerm: searchText } : "skip"
  );

  const activeConversations = useQuery(
    api.conversations.getUserChats, 
    user ? {} : "skip"
  );

  const startConversation = useMutation(api.conversations.findOrCreate);
  const isMobileChatActive = pathname !== "/chat";

  const handleSelectUser =async (targetUserId: Id<"users">) =>{
    try {
      const chatId = await startConversation({ targetUserId });
      router.push(`/chat/${chatId}`);
      setSearchText("");
    } catch (error) {
      console.error("Failed to establish conversation", error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">
      <aside 
        className={`w-full md:w-[380px] flex-col border-r bg-card/30 backdrop-blur-xl 
        ${isMobileChatActive ? "hidden md:flex" : "flex"}`}
      >
        <header className="flex items-center justify-between p-4 border-b h-[72px]">
          <div className="flex items-center gap-3">
            <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight leading-none mb-1">
                {user?.firstName || "Anonymous"}
              </span>
              <div className="flex items-center gap-1.5">
                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Now</span>
              </div>
            </div>
          </div>
        </header>

        <section className="p-4 border-b bg-muted/5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Find a friend..." 
              className="pl-9 bg-background/50 border-muted-foreground/10 focus-visible:ring-primary/40 rounded-xl h-10 text-sm"
              value={searchText}
              // This will no longer error because searchText is typed as string
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </section>

        <ScrollArea className="flex-1">
          <div className="py-2 space-y-0.5">
            {searchText && (
              <div className="px-4">
                <div className="py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  Discovered Users
                </div>
                {searchResults?.map((profile) => (
                  <button 
                    key={profile._id}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-all text-left group mb-1"
                    onClick={() => handleSelectUser(profile._id)}
                  >
                    <Avatar className="h-11 w-11 ring-2 ring-background shadow-md">
                      <AvatarImage src={profile.image} />
                      <AvatarFallback className="font-bold">{profile.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{profile.name}</p>
                      <p className="text-[11px] text-primary font-medium flex items-center gap-1 mt-0.5 opacity-80">
                        <Plus className="h-3 w-3" /> New Chat
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searchText && !activeConversations && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
              </div>
            )}

            {!searchText && activeConversations?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-sm font-semibold">No conversations yet</h3>
              </div>
            )}

            {!searchText && activeConversations?.map((convo) => {
              const isActive = pathname.includes(convo._id);
              return (
                <button 
                  key={convo._id}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left border-y border-transparent
                    ${isActive 
                      ? "bg-primary/10 border-primary/5 text-primary" 
                      : "hover:bg-muted/50 text-foreground"}
                  `}
                  onClick={() => router.push(`/chat/${convo._id}`)}
                >
                  <Avatar className={`h-12 w-12 shrink-0 border-2 shadow-sm ${isActive ? "border-primary/20" : "border-background"}`}>
                    <AvatarImage src={convo.otherUser?.image} />
                    <AvatarFallback className="font-bold">{convo.otherUser?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className={`text-sm font-bold truncate pr-2 ${isActive ? "text-primary" : "text-foreground"}`}>
                        {convo.otherUser?.name}
                      </p>
                      {convo.latestMsg && (
                        <span className={`text-[10px] shrink-0 font-medium ${isActive ? "text-primary/70" : "text-muted-foreground"}`}>
                          {format(new Date(convo.latestMsg._creationTime), "h:mm a")}
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-xs truncate max-w-[95%] ${isActive ? "text-primary/80 font-medium" : "text-muted-foreground"}`}>
                      {convo.latestMsg 
                        ? convo.latestMsg.content 
                        : <span className="italic opacity-60">Start chatting...</span>}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      <main className={`flex-1 flex flex-col relative ${!isMobileChatActive ? "hidden md:flex" : "flex"}`}>
        {children}
      </main>
    </div>
  );
}