"use client";

import { Star } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";

type Testimonial = {
  initials: string;
  name: string;
  role: string;
  timeAgo: string;
  quote: string;
};

const TESTIMONIALS: readonly Testimonial[] = [
  {
    initials: "JD",
    name: "Jan D.",
    role: "Senior Backend Engineer",
    timeAgo: "2 days ago",
    quote:
      '"I usually freeze during system design rounds. Running my target JD through Blairify exposed my weak points in microservices. Got the Senior offer at a Fintech startup."',
  },
  {
    initials: "MK",
    name: "Michał K.",
    role: "Fullstack Developer",
    timeAgo: "1 week ago",
    quote:
      '"Way better than LeetCode. It actually drilled down into why I chose a specific database index, which is exactly what happened in my real interview."',
  },
  {
    initials: "AS",
    name: "Anna S.",
    role: "React Native Dev",
    timeAgo: "3 weeks ago",
    quote:
      '"The Action Plan is gold. It pointed me exactly to the React docs I needed to read instead of me guessing what I got wrong."',
  },
  {
    initials: "PT",
    name: "Piotr T.",
    role: "Cloud Architect",
    timeAgo: "1 month ago",
    quote:
      '"Felt exactly like talking to a strict Tech Lead. The behavioral telemetry feedback was a wake-up call. Highly recommend."',
  },
  {
    initials: "AL",
    name: "Alex L.",
    role: "Staff Engineer",
    timeAgo: "2 months ago",
    quote:
      '"Used it for a Staff Engineer role. The pushback I got on my distributed caching strategy prepared me perfectly."',
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="text-center mb-10 sm:mb-12">
          <Typography.Heading2 id="testimonials-heading" className="mb-3">
            Don't just take our word for it.
          </Typography.Heading2>
          <Typography.Body color="secondary">
            Engineers use Blairify to secure offers at top-tier companies.
          </Typography.Body>
        </header>

        <div className="relative">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16 bg-gradient-to-r from-card to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16 bg-gradient-to-l from-card to-transparent"
            aria-hidden="true"
          />

          <section className="group overflow-hidden" aria-label="Testimonials">
            <button
              type="button"
              className="sr-only focus:not-sr-only focus:mb-4 focus:inline-flex focus:items-center focus:justify-center focus:rounded-xl focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-border focus-visible:outline-offset-2"
            >
              <Typography.SubCaptionMedium>
                Pause scrolling testimonials
              </Typography.SubCaptionMedium>
            </button>
            <div className="outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-border focus-visible:outline-offset-4 rounded-2xl">
              <div className="flex w-max gap-6 pb-2 motion-reduce:animate-none animate-[scroll_48s_linear_infinite] group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]">
                {loopingTestimonials.map((t, index) => (
                  <article
                    key={`${t.name}-${index}`}
                    className="min-w-[18rem] max-w-[18rem] sm:min-w-[20rem] sm:max-w-[20rem] rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <header className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-foreground text-background flex items-center justify-center">
                          <Typography.SubCaptionBold>
                            {t.initials}
                          </Typography.SubCaptionBold>
                        </div>
                        <div>
                          <Typography.BodyBold>{t.name}</Typography.BodyBold>
                          <Typography.SubCaptionMedium color="secondary">
                            {t.role}
                          </Typography.SubCaptionMedium>
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
      </div>
    </section>
  );
}
