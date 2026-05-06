import Image from "next/image"

export function AboutSection() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Full crystal background like hero */}
      <div className="absolute inset-0">
        <Image
          src="/images/crystal-bg-2.jpg"
          alt=""
          fill
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80" />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-light text-foreground mb-6">
            About Us
          </h2>
          <div className="max-w-3xl mx-auto space-y-6 text-foreground leading-relaxed text-lg">
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

        {/* Founders Section */}
        <div className="mt-20">
          <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground text-center mb-16">
            Meet the Founders
          </h3>
          
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Founder 1 - Noga */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-64 h-64 mb-8 overflow-hidden rounded-full border-4 border-background shadow-lg">
                <Image
                  src="/images/founder-noga.jpg"
                  alt="Noga Cohen Harris"
                  fill
                  className="object-cover"
                />
                {/* Placeholder overlay - remove when photo is added */}
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Photo</span>
                </div>
              </div>
              <h4 className="font-serif text-2xl font-light text-foreground mb-4">
                Noga Cohen Harris
              </h4>
              <p className="text-foreground leading-relaxed text-base max-w-md">
                Noga Cohen Harris is a matchmaker and coach based in New York City, dedicated to helping individuals cultivate deeper awareness and authentic connection in pursuit of meaningful relationships. With a multidisciplinary background that blends legal training, coaching, and trauma-informed care, Noga brings depth, empathy, and clarity to her work with clients. A licensed attorney, she holds law degrees from Tel Aviv University and American University Washington College of Law (LL.M.), and began her legal career representing the State of Israel in civil and national security cases at the District Attorney&apos;s Office in Jerusalem.
              </p>
              <p className="text-foreground leading-relaxed text-base max-w-md mt-4">
                Noga is a passionate mental health advocate. She serves on the board of Friends of Lev Hasharon, supporting Israel&apos;s leading psychiatric hospital, and volunteers with Sahar, offering emotional support to people in crisis. Her service as a Combat Fitness Instructor in the Israel Defense Forces, where she coached the physical and mental resilience of over 1,000 soldiers, continues to inform her commitment to empowerment, healing, and personal growth.
              </p>
            </div>

            {/* Founder 2 - Vanessa */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-64 h-64 mb-8 overflow-hidden rounded-full border-4 border-background shadow-lg">
                <Image
                  src="/images/founder-vanessa.jpg"
                  alt="Vanessa Gad"
                  fill
                  className="object-cover"
                />
                {/* Placeholder overlay - remove when photo is added */}
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Photo</span>
                </div>
              </div>
              <h4 className="font-serif text-2xl font-light text-foreground mb-4">
                Vanessa Gad
              </h4>
              <p className="text-foreground leading-relaxed text-base max-w-md">
                Vanessa is a matchmaker and business leader based in New York, with over seventeen years of experience as the CEO of a boutique real estate company serving families from around the world. Throughout her life and career, she has always believed that nothing is random and that people are placed in our path for a reason. Her work, whether in business or matchmaking, has always been deeply rooted in trust, intuition, human connection, and understanding people beyond what is visible on the surface.
              </p>
              <p className="text-foreground leading-relaxed text-base max-w-md mt-4">
                What started naturally over the years as helping singles, giving guidance, listening, and seeing connections others did not always see, slowly became a true calling. Vanessa believes that finding your soulmate is not only about chemistry or a checklist, but about timing, growth, and building a relationship with honesty, respect, and shared values. She approaches every person with warmth, compassion, and sincerity, understanding how vulnerable and emotional the process can be.
              </p>
              <p className="text-foreground leading-relaxed text-base max-w-md mt-4">
                Coming from a multicultural background, living in different countries, and speaking four languages fluently, Vanessa connects easily with people from many walks of life. Her approach to matchmaking is deeply personal and intuitive. She believes in truly getting to know each person, understanding their fears, strengths, patterns, and hopes, while guiding them with honesty, care, and encouragement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
