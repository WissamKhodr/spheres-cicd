'use client';
import { logout } from "@/lib/auth";
import { useActionState } from "react";

export default function Logout() {
  const [state, action, pending] = useActionState(logout, null);
  return (
    <div>
        <form action={action}>
            <button
                type="submit"
                disabled={pending}
            >
                Logout
            </button>
        </form>
    </div>
  );
}