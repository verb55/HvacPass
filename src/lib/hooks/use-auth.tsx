"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/stores";
import type { Profile } from "@/types";

export function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { profile, setProfile, reset } = useAppStore();

  const isAuthenticated = !!profile;

  // Check current session on mount
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch profile if not already set
        if (!profile || profile.id !== session.user.id) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (data) {
            setProfile(data as Profile);
          }
        }
      }
    };

    checkSession();
  }, [profile, setProfile, supabase]);

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        reset();
        router.push("/login");
      } else if (session?.user && !profile) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (data) {
          setProfile(data as Profile);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [profile, reset, setProfile, supabase, router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    reset();
    router.push("/login");
  };

  return {
    isAuthenticated,
    profile,
    signOut,
  };
}

// Require authentication HOC
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, profile } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated && !profile) {
        // Will be handled by middleware redirect
      }
    }, [isAuthenticated, profile, router]);

    if (!isAuthenticated && !profile) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Sprawdzanie autoryzacji...
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
