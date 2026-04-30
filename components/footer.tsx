import Link from "next/link"

export function Footer() {
  return (
    <footer className="py-16 px-6 bg-foreground text-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8 text-sm text-background/70">
            <Link href="#contact" className="hover:text-background transition-colors duration-300">
              Contact Us
            </Link>
            <Link href="#privacy" className="hover:text-background transition-colors duration-300">
              Privacy
            </Link>
          </div>

          <p className="text-sm text-background/50">
            Discreet & Confidential
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-background/10 text-center">
          <p className="text-xs text-background/40 tracking-widest uppercase">
            Designed with intention
          </p>
        </div>
      </div>
    </footer>
  )
}
