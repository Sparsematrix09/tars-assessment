import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareDashed } from "lucide-react";
export default function ChatLobbyView() {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/5 h-full">
      <Card className="w-[350px] border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center justify-center p-10 text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <MessageSquareDashed className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg tracking-tight">Your Messages</h3>
            <p className="text-sm text-muted-foreground">
              Select a conversation from the sidebar or search for a user to start a new chat.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}