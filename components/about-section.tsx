import Image from "next/image"

import { FounderBio } from "@/components/founder-bio"
import { Reveal } from "@/components/reveal"

export function AboutSection() {
  return (
    <section
      id="about"
      className="flex min-h-[100svh] flex-col items-center justify-center bg-background px-6 py-32"
    >
      <Reveal className="max-w-xl text-center">
        <p className="label text-foreground/40">The house</p>
        <h2 className="display mt-8 text-[clamp(2.2rem,5vw,4.4rem)]">
          Noga Cohen
          <br />
          <span className="display-italic">&amp; Vanessa Gad</span>
        </h2>
        <p className="mx-auto mt-8 max-w-md text-[15px] leading-[1.85] text-foreground/55">
          They run TOIMOI in New York. You answer in conversation. Matching is chosen from those
          answers, not a profile you swipe past.
        </p>
      </Reveal>

      <div className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-6 sm:gap-12">
        <article className="flex flex-col items-center text-center">
          <div
            className="relative h-28 w-28 overflow-hidden rounded-full sm:h-36 sm:w-36"
            data-cursor="image"
          >
            <Image
              src="/images/founder-noga.jpg"
              alt="Noga Cohen"
              fill
              sizes="144px"
              className="object-cover object-top"
            />
          </div>
          <p className="label mt-6 text-foreground/40">Co-founder</p>
          <h3 className="display mt-2 text-2xl sm:text-3xl">Noga Cohen</h3>
          <div className="mt-5 w-full text-left">
            <FounderBio>
              <p>
                Noga Cohen is a matchmaker and coach based in New York City, dedicated to helping
                individuals cultivate deeper awareness and authentic connection in pursuit of
                meaningful relationships. With a multidisciplinary background that blends legal
                training, coaching, and trauma-informed care, Noga brings depth, empathy, and
                clarity to her work with clients. A licensed attorney, she holds law degrees from
                Tel Aviv University and American University Washington College of Law (LL.M.), and
                began her legal career representing the State of Israel in civil and national
                security cases at the District Attorney&apos;s Office in Jerusalem.
              </p>
              <p>
                Noga is a passionate mental health advocate. She serves on the board of Friends of
                Lev Hasharon, supporting Israel&apos;s leading psychiatric hospital, and volunteers
                with Sahar, offering emotional support to people in crisis. Her service as a Combat
                Fitness Instructor in the Israel Defense Forces, where she coached the physical and
                mental resilience of over 1,000 soldiers, continues to inform her commitment to
                empowerment, healing, and personal growth.
              </p>
            </FounderBio>
          </div>
        </article>

        <article className="flex flex-col items-center text-center">
          <div
            className="relative h-28 w-28 overflow-hidden rounded-full sm:h-36 sm:w-36"
            data-cursor="image"
          >
            <Image
              src="/images/founder-vanessa.jpg"
              alt="Vanessa Gad"
              fill
              sizes="144px"
              className="object-cover object-[center_20%]"
            />
          </div>
          <p className="label mt-6 text-foreground/40">Co-founder</p>
          <h3 className="display mt-2 text-2xl sm:text-3xl">Vanessa Gad</h3>
          <div className="mt-5 w-full text-left">
            <FounderBio>
              <p>
                Vanessa Gad is a matchmaker, writer, and business leader based in New York, with
                over seventeen years of experience as the CEO of a boutique real estate company
                serving families from around the world. Throughout her life and career, she has
                always believed that nothing is random and that people are placed in our path for a
                reason.
              </p>
              <p>
                For the past three years, Vanessa has also been writing inspirational messages
                focused on trust, faith, and learning how to build a deeper connection with Hashem.
                She believes Hashem guides every single step of our journey, even during the moments
                we may not fully understand.
              </p>
              <p>
                Her work, whether in business, writing, or matchmaking, has always been deeply
                rooted in trust, intuition, human connection, and understanding people beyond what
                is visible on the surface.
              </p>
              <p>
                Coming from a multicultural background, living in different countries, and speaking
                four languages fluently, Vanessa connects easily with people from many walks of
                life. Her approach to matchmaking is deeply personal and intuitive. She believes in
                truly getting to know each person, understanding their fears, strengths, patterns,
                and hopes, while guiding them with honesty, care, and encouragement.
              </p>
            </FounderBio>
          </div>
        </article>
      </div>
    </section>
  )
}
