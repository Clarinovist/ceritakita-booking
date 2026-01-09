import {
  Navbar,
  HeroSection,
  AboutSection,
  PackagesGrid,
  WhyChooseUsSection,
  PromoSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from '@/components/homepage';

export default function Home() {
  return (
    <main className="bg-olive-900">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* About Section */}
      <AboutSection />

      {/* Package Categories Grid */}
      <PackagesGrid />

      {/* Why Choose Us */}
      <WhyChooseUsSection />

      {/* Promo Section */}
      <PromoSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
