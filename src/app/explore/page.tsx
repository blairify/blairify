import Footer from "@/components/organisms/footer";
import JobList from "@/components/organisms/job-list";
import Navbar from "@/components/organisms/landing-page-navbar";

export default function ExplorePage() {
  const scrollThreshold = 500; // optional if your navbar changes on scroll

  return (
    <>
      <main className="bg-[color:var(--background)] text-[color:var(--foreground)] min-h-screen">
        {/* Navbar */}
        <Navbar scrollThreshold={scrollThreshold} />

        {/* Hero / Intro Section */}
        <section className="relative py-24">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Explore Programming Jobs
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Discover the latest active programming roles from top companies
              around the world. Filter by keyword, page size, and find your next
              opportunity.
            </p>
          </div>
        </section>

        {/* Jobs Section */}
        <section className="container mx-auto px-6 py-16">
          <JobList initialQuery="developer" initialPerPage={50} />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
