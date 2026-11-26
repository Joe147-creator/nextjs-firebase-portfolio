import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Services from "@/components/Services";
import WhyMe from "@/components/WhyMe";
import Pricing from "@/components/Pricing";
import Projects from "@/components/Projects";
import Roadmap from "@/components/Roadmap";
import Contact from "@/components/Contact";
import ScrollToTop from "@/components/ScrollToTop";
import PortfolioAssistant from "@/components/PortfolioAssistant";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Services />
      <WhyMe />
      <Pricing />
      <Projects />
      <Roadmap />
      <Contact />

      <footer>
        <p>© 2026 John Erick. All Rights Reserved.</p>
      </footer>

      <PortfolioAssistant />
      <ScrollToTop />
    </>
  );
}