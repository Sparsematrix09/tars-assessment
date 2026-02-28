"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api"; 

export function SyncUserProvider({ children }: {children: React.ReactNode }){
  const { user, isLoaded, isSignedIn } = useUser();
  const pushProfileToDatabase = useMutation(api.users.syncProfile);
  const [hasSynced, setHasSynced] = useState(false);
  useEffect(() =>{
    if (isLoaded && isSignedIn && user && !hasSynced) {
      const synchronize = async () => {
        try {
          const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() 
            || user.username 
            || "Unknown User";
          await pushProfileToDatabase({
            name: fullName,
            email: user.emailAddresses[0]?.emailAddress || "",
            image: user.imageUrl || "",
          });  
          setHasSynced(true);
        } catch (error) {
          console.error("Failed to sync user profile to Convex:", error);
        }
      };
      synchronize();
    }
  }, [user, isLoaded, isSignedIn, pushProfileToDatabase, hasSynced]);
  return <>{children}</>;
}