"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { Typography } from "@/components/common/atoms/typography";

type Testimonial = {
  initials: string;
  name: string;
  role: string;
  timeAgo: string;
  quote: string;
  imageUrl: string;
  hp: number;
  imageType:
    | "avatar"
    | "avatarGitHub"
    | "personPortrait"
    | "urlPicsumPhotos"
    | "dataUri";
};

const TESTIMONIALS: readonly Testimonial[] = [
  {
    initials: "JD",
    name: "Jan D.",
    role: "Middle Backend",
    timeAgo: "2 days ago",
    quote:
      "ngl way better than just grinding LeetCode. It actually asked why I picked certain DB indexes etc, which literally came up in my interview I got the job just trying to land a highend pay at startup",
    imageUrl: "https://avatars.githubusercontent.com/u/26708505",
    hp: 18420,
    imageType: "avatarGitHub",
  },
  {
    initials: "MK",
    name: "vvar00o",
    role: "Fullstack Developer",
    timeAgo: "1 week ago",
    quote:
      "ngl way better than just grinding LeetCode. It actually asked why I picked certain DB indexes etc, which literally came up in my interview I got the job just trying to land a highend pay at startup",
    imageUrl: "https://avatars.githubusercontent.com/u/47417165",
    hp: 42780,
    imageType: "avatarGitHub",
  },
  {
    initials: "AS",
    name: "Anna Sullivan",
    role: "React Native Dev",
    timeAgo: "3 weeks ago",
    quote:
      "The feature knowledge gaps is actually super useful. It just told me what React docs to read instead of me guessing what I did wrong lol",
    imageUrl: "https://avatars.githubusercontent.com/u/47417999",
    hp: 9630,
    imageType: "personPortrait",
  },
  {
    initials: "PT",
    name: "Piotr_B",
    role: "Cloud Architect",
    timeAgo: "1 month ago",
    quote:
      "felt like talking to a kinda strict tech lead lol. the behavioral feedback was a bit of a wake up call but yeah, in a good way. would recommend",
    imageUrl: "https://picsum.photos/seed/V7n6qwoBt/128/128?grayscale",
    hp: 31140,
    imageType: "urlPicsumPhotos",
  },
  {
    initials: "TV",
    name: "Théa Vaillant",
    role: "Staff Engineer",
    timeAgo: "2 months ago",
    quote:
      "lo usé para un puesto de staff engineer. el feedback sobre mi estrategia de cache distribuido me ayudó bastante, iba mucho mejor preparado después",
    imageUrl:
      "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/128/86.jpg",
    hp: 39860,
    imageType: "personPortrait",
  },
  {
    initials: "EJ",
    name: "Emmixx",
    role: "Frontend Developer",
    timeAgo: "2 weeks ago",
    quote:
      "React questions were actually on point. helped me get thru the component architecture part which I usually mess up",
    imageUrl: "https://picsum.photos/seed/nk0Nin/128/128?blur=2",
    hp: 12470,
    imageType: "urlPicsumPhotos",
  },
  {
    initials: "RW",
    name: "Robert",
    role: "DevOps Engineer",
    timeAgo: "1 week ago",
    quote:
      " CI/CD stuff was basically what I got in my interview. kubernetes questions were especially useful tbh",
    imageUrl:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4Ij48cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgZmlsbD0iIzNiODJmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Uk88L3RleHQ+PC9zdmc+",
    hp: 27390,
    imageType: "dataUri",
  },
  {
    initials: "SR",
    name: "Sarah Russel",
    role: "Product Manager",
    timeAgo: "3 days ago",
    quote:
      "I did not really want a job but this helped a lot tbh. Feel way more confident talking to engineers now",
    imageUrl:
      "https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/256/86.jpg?blur=3",
    hp: 16840,
    imageType: "personPortrait",
  },
] as const;

export default function TestimonialsSection() {
  const loopingTestimonials = [...TESTIMONIALS, ...TESTIMONIALS] as const;

  return (
    <section
      className="bg-card border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="testimonials-heading"
      data-analytics-id="home-testimonials"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(251,146,60,0.06),transparent_60%)]"
        aria-hidden="true"
      />
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 w-[90%]">
        <header className="text-center mb-10 sm:mb-12">
          <Typography.HeroSubHeading id="testimonials-heading" className="mb-3">
            Don't just take our word for it.
          </Typography.HeroSubHeading>
          <Typography.Body color="secondary">
            Engineers use Blairify to secure offers at top-tier companies.
          </Typography.Body>
        </header>

        <div className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32 bg-gradient-to-r from-card via-card/80 to-transparent z-10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32 bg-gradient-to-l from-card via-card/80 to-transparent z-10"
            aria-hidden="true"
          />

          <section className="group overflow-hidden" aria-label="Testimonials">
            <button
              type="button"
              className="sr-only focus:not-sr-only focus:mb-4 focus:inline-flex focus:items-center focus:justify-center focus:rounded-xl focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:outline-none focus-visible:outline focus-visible:outline-border focus-visible:outline-offset-2"
            >
              <Typography.SubCaptionMedium>
                Pause scrolling testimonials
              </Typography.SubCaptionMedium>
            </button>
            <div className="outline-none focus-visible:outline focus-visible:outline-border focus-visible:outline-offset-4 rounded-2xl">
              <div className="flex w-max gap-6 py-2 motion-reduce:animate-none animate-[scroll_48s_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
                {loopingTestimonials.map((t, index) => (
                  <article
                    key={`${t.name}-${index}`}
                    className="min-w-[18rem] max-w-[18rem] sm:min-w-[20rem] sm:max-w-[20rem] rounded-2xl bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <header className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full overflow-hidden bg-muted flex items-center justify-center relative">
                          <Image
                            src={t.imageUrl}
                            alt={`${t.name} avatar`}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized={t.imageType === "dataUri"}
                          />
                        </div>
                        <div>
                          <Typography.BodyBold>{t.name}</Typography.BodyBold>
                          <Typography.SubCaptionMedium color="secondary">
                            {t.role}
                          </Typography.SubCaptionMedium>
                          <div className="flex items-center gap-1">
                            <Typography.SubCaption>
                              Score: {t.hp.toLocaleString()}
                            </Typography.SubCaption>
                          </div>
                        </div>
                      </div>
                      <Typography.SubCaptionMedium color="secondary">
                        {t.timeAgo}
                      </Typography.SubCaptionMedium>
                    </header>

                    <div
                      className="flex items-center gap-1 text-primary mb-3"
                      role="img"
                      aria-label="5 star rating"
                    >
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="size-4 fill-current"
                          aria-hidden="true"
                        />
                      ))}
                    </div>

                    <Typography.Body color="secondary">
                      {t.quote}
                    </Typography.Body>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <Typography.Body color="secondary" className="max-w-2xl mx-auto">
            We update reviews monthly. Want to see your story here? Earn the
            "Competent Communicator" achievement and reach "Gold I - Solid
            Performer" status, and we'll reach out for your feedback.
          </Typography.Body>
        </div>
      </div>
    </section>
  );
}
