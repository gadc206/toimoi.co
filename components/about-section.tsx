import Image from "next/image"

import { CrystalBackdrop } from "@/components/crystal-backdrop"
import { SectionEyebrow } from "@/components/section-eyebrow"
import { SectionShell, sectionY } from "@/components/section-shell"
import { sectionSurfaceClass } from "@/lib/section-surfaces"
import { cn } from "@/lib/utils"

export function AboutSection() {
  return (
    <section
      id="about"
      className={cn(
        sectionY,
        sectionSurfaceClass("sand"),
        "relative overflow-hidden scroll-mt-36",
      )}
    >
      <CrystalBackdrop
        src="/images/crystal-bg-2.jpg"
        imageClassName="opacity-[0.18]"
        overlayClassName="bg-gradient-to-b from-[oklch(0.972_0.008_78/0.92)] via-[oklch(0.972_0.008_78/0.78)] to-[oklch(0.972_0.008_78/0.92)]"
      />
      <SectionShell maxWidth="6xl">
        <SectionEyebrow>About us</SectionEyebrow>
        <div className="mb-14 text-center">
          <h2 className="mb-6 font-serif text-3xl font-light text-foreground md:text-4xl">
            Who we are
          </h2>
          <div className="mx-auto max-w-prose space-y-5 text-lg leading-relaxed text-foreground">
            <p>
              We are not a big company or an app. We are real people who take the time to truly see you.
            </p>
            <p>
              What we do goes beyond experience or process. There is a deep level of intuition in the way we work, almost like a sixth sense. We listen not only to your words, but to what sits underneath them. We feel what is aligned and what is not, even when it is not obvious.
            </p>
            <p>
              Together, our thoughts and perspectives create clarity. We help you understand who you truly are, what your needs are, and what your soul is really searching for — not just what you think you want on the surface.
            </p>
            <p>
              This process is personal, it is intentional and honest. There is no template, no formula, no shortcut. Every person we work with receives individual care, real attention, and guidance that is tailored specifically to them.
            </p>
            <p>
              There is something powerful that happens when intuition, honesty, and timing align. That is where real connection begins.
            </p>
          </div>
        </div>

        <div className="mt-16 border-t border-border/60 pt-16">
          <h3 className="mb-12 text-center font-serif text-2xl font-light text-foreground md:text-3xl">
            Meet the Founders
          </h3>

          <div className="grid gap-14 md:grid-cols-2 md:gap-12 lg:gap-16">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6 h-56 w-56 overflow-hidden rounded-full border-4 border-background shadow-lg sm:h-64 sm:w-64">
                <Image
                  src="/images/founder-noga.jpg"
                  alt="Noga Cohen"
                  fill
                  className="object-cover"
                />
              </div>
              <h4 className="mb-3 font-serif text-2xl font-light text-foreground">
                Noga Cohen
              </h4>
              <div className="max-w-prose space-y-4 text-left text-base leading-relaxed text-foreground sm:text-center">
                <p>
                  Noga Cohen is a matchmaker and coach based in New York City, dedicated to helping individuals cultivate deeper awareness and authentic connection in pursuit of meaningful relationships. With a multidisciplinary background that blends legal training, coaching, and trauma-informed care, Noga brings depth, empathy, and clarity to her work with clients. A licensed attorney, she holds law degrees from Tel Aviv University and American University Washington College of Law (LL.M.), and began her legal career representing the State of Israel in civil and national security cases at the District Attorney&apos;s Office in Jerusalem.
                </p>
                <p>
                  Noga is a passionate mental health advocate. She serves on the board of Friends of Lev Hasharon, supporting Israel&apos;s leading psychiatric hospital, and volunteers with Sahar, offering emotional support to people in crisis. Her service as a Combat Fitness Instructor in the Israel Defense Forces, where she coached the physical and mental resilience of over 1,000 soldiers, continues to inform her commitment to empowerment, healing, and personal growth.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="relative mb-6 h-56 w-56 overflow-hidden rounded-full border-4 border-background shadow-lg sm:h-64 sm:w-64">
                <Image
                  src="/images/founder-vanessa.jpg"
                  alt="Vanessa Gad"
                  fill
                  className="object-cover"
                />
              </div>
              <h4 className="mb-3 font-serif text-2xl font-light text-foreground">
                Vanessa Gad
              </h4>
              <div className="max-w-prose space-y-4 text-left text-base leading-relaxed text-foreground sm:text-center">
                <p>
                  Vanessa Gad is a matchmaker, writer, and business leader based in New York, with over seventeen years of experience as the CEO of a boutique real estate company serving families from around the world. Throughout her life and career, she has always believed that nothing is random and that people are placed in our path for a reason.
                </p>
                <p>
                  For the past three years, Vanessa has also been writing inspirational messages focused on trust, faith, and learning how to build a deeper connection with Hashem. She believes Hashem guides every single step of our journey, even during the moments we may not fully understand.
                </p>
                <p>
                  Her work, whether in business, writing, or matchmaking, has always been deeply rooted in trust, intuition, human connection, and understanding people beyond what is visible on the surface.
                </p>
                <p>
                  Coming from a multicultural background, living in different countries, and speaking four languages fluently, Vanessa connects easily with people from many walks of life. Her approach to matchmaking is deeply personal and intuitive. She believes in truly getting to know each person, understanding their fears, strengths, patterns, and hopes, while guiding them with honesty, care, and encouragement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </section>
  )
}
