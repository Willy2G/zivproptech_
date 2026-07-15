import Hero from '../components/sections/Hero.jsx';
import StatsBar from '../components/sections/StatsBar.jsx';
import TargetAudience from '../components/sections/TargetAudience.jsx';
import Solutions from '../components/sections/Solutions.jsx';
import About from '../components/sections/About.jsx';
import Testimonials from '../components/sections/Testimonials.jsx';
import Resources from '../components/sections/Resources.jsx';
import Faq from '../components/sections/Faq.jsx';
import Pricing from '../components/sections/Pricing.jsx';
import Contact from '../components/sections/Contact.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <TargetAudience />
      <Solutions />
      <About />
      <Testimonials />
      <Resources />
      <Faq />
      <Pricing />
      <Contact />
    </>
  );
}
