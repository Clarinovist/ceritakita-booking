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
  GallerySection,
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

      {/* Gallery Section */}
      <GallerySection />

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
