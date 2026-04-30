import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="px-6 md:px-12 lg:px-24 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-16">
            <div>
              <Link href="/" className="font-serif text-xl text-foreground">
                The Circle
              </Link>
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                Bespoke matchmaking for those who are truly ready.
              </p>
            </div>
            
            <div>
              <p className="text-sm tracking-wider uppercase text-muted-foreground mb-4">Connect</p>
              <nav className="flex flex-col gap-3">
                <Link href="#" className="text-foreground hover:text-accent transition-colors text-sm">
                  Instagram
                </Link>
                <Link href="#" className="text-foreground hover:text-accent transition-colors text-sm">
                  LinkedIn
                </Link>
              </nav>
            </div>

            <div>
              <p className="text-sm tracking-wider uppercase text-muted-foreground mb-4">Contact</p>
              <p className="text-foreground text-sm">hello@thecircle.com</p>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} The Circle. All rights reserved.
            </p>
            <nav className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
