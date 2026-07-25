import { SignIn } from "@clerk/nextjs";
import { Bird } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
  {/* Panel branding — bagian ini sepenuhnya kustom, bukan dikontrol oleh Clerk */}
  <div className="scan-grid relative hidden flex-col justify-between overflow-hidden border-r border-border-subtle bg-surface p-10 lg:flex">
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-accent">
        <Bird className="h-5 w-5" />
      </div>
      <span className="font-display text-base font-semibold">
        Count AI
      </span>
    </div>

    <div className="max-w-sm">
      <p className="font-display text-3xl font-semibold leading-tight text-foreground">
        Hitung setiap ayam, di setiap kandang, pada setiap proses analisis.
      </p>

      <p className="mt-3 text-sm text-muted">
        Masuk untuk melihat hasil deteksi, mengatur konfigurasi model AI,
        dan memantau jumlah ayam dari setiap kamera di peternakan.
      </p>
    </div>

    <p className="text-xs text-muted-2">
      © {new Date().getFullYear()} Count AI
    </p>
  </div>

  {/* Bagian kanan — Widget Clerk yang telah disesuaikan tampilannya melalui appearance di layout.tsx */}
  <div className="flex items-center justify-center bg-background p-6">
    <SignIn
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
