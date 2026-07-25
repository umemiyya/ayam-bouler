import { SignUp } from "@clerk/nextjs";
import { Bird } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="scan-grid relative hidden flex-col justify-between overflow-hidden border-r border-border-subtle bg-surface p-10 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent">
            <Bird className="h-5 w-5" />
          </div>
          <span className="font-display text-base font-semibold">Count AI</span>
        </div>
        <div className="max-w-sm">
          <p className="font-display text-3xl font-semibold leading-tight text-foreground">
            Get your team set up in minutes.
          </p>
          <p className="mt-3 text-sm text-muted">
            Create an account to start uploading imagery and tracking broiler
            counts across your operation.
          </p>
        </div>
        <p className="text-xs text-muted-2">© {new Date().getFullYear()} Count AI</p>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full max-w-sm",
              card: "w-full",
            },
          }}
        />
      </div>
    </div>
  );
}
