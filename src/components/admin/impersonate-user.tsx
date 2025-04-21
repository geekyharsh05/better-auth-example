"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface IImpersonateUserProps {
  userId: string;
}

export default function ImpersonateUser({ userId }: IImpersonateUserProps) {
  const router = useRouter();

  const handleImpersonateUser = async () => {
    try {
      await authClient.admin.impersonateUser({
        userId: userId,
      });
      router.push("/");
      toast.success("Impersonated user", {
        description: "You are now impersonating this user",
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to impersonate user:", error);
    }
  };

  return (
    <Button onClick={handleImpersonateUser} variant="outline" size="sm">
      Impersonate
    </Button>
  );
}
