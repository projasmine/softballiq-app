import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Softball IQ"
                width={110}
                height={28}
                className="h-7 w-auto"
                priority
              />
            </Link>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              8U – 14U
            </Badge>
          </div>
          <div className="flex gap-3 text-sm">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/join"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Join Team
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
