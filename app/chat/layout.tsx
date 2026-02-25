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
import { Search, MessageSquare, Plus } from "lucide-react";
import { format } from "date-fns";

export default function ChatApplicationLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  
  const [searchPhrase, setSearchPhrase] = useState("");

  const discoveredUsers = useQuery(api.users.searchProfiles, { query: searchPhrase });
  const activeChats = useQuery(api.conversations.getUserChats);
  const establishChat = useMutation(api.conversations.findOrCreate);

  const isViewingSpecificChat = pathname !== "/chat";

  const handleStartChat = async (targetUserId: Id<"users">) => {
    try {
      const newChatId = await establishChat({ targetUserId });
      router.push(`/chat/${newChatId}`);
      setSearchPhrase(""); 
    } catch (error) {
      console.error("Failed to start chat", error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <aside 
        className={`w-full md:w-[380px] flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
        ${isViewingSpecificChat ? "hidden md:flex" : "flex"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b h-[72px]">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight">{user?.firstName || "My Profile"}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
              </span>
            </div>
          </div>
        </div>

        {/* Search Area */}
        <div className="p-4 border-b bg-muted/10">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input 
              placeholder="Search to start a chat..." 
              className="pl-9 bg-background border-muted-foreground/20 focus-visible:ring-primary/50 rounded-full shadow-sm"
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 bg-muted/5">
          <div className="p-3 space-y-2">
            
            {/* SEARCH RESULTS */}
            {searchPhrase && (
              <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Search Results
              </div>
            )}
            {searchPhrase && discoveredUsers?.map((u) => (
              <button 
                key={u._id}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/80 transition-all text-left group"
                onClick={() => handleStartChat(u._id)}
              >
                <Avatar className="h-12 w-12 border border-background shadow-sm group-hover:scale-105 transition-transform">
                  <AvatarImage src={u.image} />
                  <AvatarFallback className="bg-primary/10 text-primary">{u.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold truncate">{u.name}</p>
                  <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
                    <Plus className="h-3 w-3" /> Start conversation
                  </p>
                </div>
              </button>
            ))}

            {/* EMPTY STATE */}
            {!searchPhrase && activeChats?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs text-muted-foreground mt-1">Search for a user above to break the ice.</p>
              </div>
            )}

            {/* ACTIVE CONVERSATIONS */}
            {!searchPhrase && activeChats?.map((chat) => (
              <button 
                key={chat._id}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left
                  ${pathname.includes(chat._id) ? "bg-primary/10 border-primary/20 shadow-sm" : "hover:bg-muted/60 border border-transparent"}
                `}
                onClick={() => router.push(`/chat/${chat._id}`)}
              >
                <Avatar className="h-12 w-12 border shadow-sm">
                  <AvatarImage src={chat.otherUser?.image} />
                  <AvatarFallback>{chat.otherUser?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-sm font-semibold truncate">{chat.otherUser?.name}</p>
                    {chat.latestMsg && (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {format(new Date(chat.latestMsg._creationTime), "h:mm a")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {chat.latestMsg ? chat.latestMsg.content : <span className="italic text-primary/70">New conversation started...</span>}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <main className={`flex-1 flex flex-col bg-background ${!isViewingSpecificChat ? "hidden md:flex" : "flex"}`}>
        {children}
      </main>
    </div>
  );
}