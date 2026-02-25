import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, Shield, Sparkles } from "lucide-react";
export default function Home() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl mx-auto space-y-8 mt-12">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Connect in <br className="hidden md:block" />
            <span className="text-5xl md:text-7xl font-extrabold tracking-tight ">
              Real-Time
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A lightning-fast, highly responsive chat platform. Find users, start conversations, and message seamlessly with instant sync.
          </p>
        </div>
        <div className="w-full pt-4 pb-12">
          <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignInButton mode="modal">
                <Button size="lg" className="w-full sm:w-40 rounded-full h-12 text-base shadow-lg shadow-primary/25 transition-all hover:scale-105">
                  Log In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="lg" variant="outline" className="w-full sm:w-40 rounded-full h-12 text-base bg-background/50 backdrop-blur-sm transition-all hover:scale-105 hover:bg-muted">
                  Create Account
                </Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <Link href="/chat">
              <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-lg shadow-primary/25 transition-all hover:scale-105 gap-2">
                Open Dashboard <MessageSquare className="h-5 w-5 ml-1" />
              </Button>
            </Link>
          </SignedIn>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border/50 w-full">
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Instant Sync</h3>
            <p className="text-xs text-muted-foreground mt-1">Used convex subscriptions.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Secure Auth</h3>
            <p className="text-xs text-muted-foreground mt-1">Protected by clerk identity management.</p>
          </div>
          <div className="flex flex-col items-center text-center p-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Responsive UI</h3>
            <p className="text-xs text-muted-foreground mt-1">Built with tailwind & shadcn.</p>
          </div>
        </div>       
      </div>
    </div>
  );
}