"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface Service {
  title: string
  description: string
  price: string
  cta: string
  href: string
  details?: string[]
  includes?: string
  note?: string
  featured?: boolean
}

interface ServiceCardProps {
  service: Service
  index: number
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const isFirst = index === 0

  if (service.featured) {
    return (
      <article className="py-12 md:py-16 border-t border-border">
        <div className="grid md:grid-cols-[1fr,1.5fr] gap-8 md:gap-16">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-4">
              {service.title}
            </h2>
          </div>
          <div className="flex flex-col gap-6">
            <p className="text-muted-foreground leading-relaxed text-lg">
              {service.description}
            </p>
            
            {service.details && (
              <ul className="flex flex-col gap-2">
                {service.details.map((detail, i) => (
                  <li key={i} className="text-foreground leading-relaxed">
                    {detail}
                  </li>
                ))}
              </ul>
            )}

            {service.includes && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm tracking-wider uppercase text-muted-foreground mb-2">Includes</p>
                <p className="text-foreground leading-relaxed">
                  {service.includes}
                </p>
              </div>
            )}

            {service.note && (
              <p className="text-foreground italic leading-relaxed">
                {service.note}
              </p>
            )}

            <p className="text-muted-foreground leading-relaxed text-sm">
              {service.price}
            </p>

            <Link
              href={service.href}
              className="group inline-flex items-center gap-3 text-foreground hover:text-accent transition-colors mt-4"
            >
              <span className="text-sm tracking-wider uppercase">{service.cta}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className={`py-12 md:py-16 ${!isFirst ? 'border-t border-border' : ''}`}>
      <div className="grid md:grid-cols-[1fr,1.5fr] gap-8 md:gap-16">
        <div>
          <h2 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-4">
            {service.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {service.price}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-muted-foreground leading-relaxed">
            {service.description}
          </p>
          <Link
            href={service.href}
            className="group inline-flex items-center gap-3 text-foreground hover:text-accent transition-colors"
          >
            <span className="text-sm tracking-wider uppercase">{service.cta}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  )
}
