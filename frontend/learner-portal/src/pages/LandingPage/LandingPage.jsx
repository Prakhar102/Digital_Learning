import Navbar from "../../components/landing/Navbar";
import AIMentorDemo from "../../components/landing/AIMentorDemo";
import LearningCoreSection from "../../components/landing/LearningCoreSection";
import CertificateExperience from "../../components/landing/CertificateExperience";
import CareerPaths from "../../components/landing/CareerPaths";
//import RoadmapSection from "../../components/landing/RoadmapSection";
import HeroSection from "../../components/landing/HeroSection";
import GlowDivider from "../../components/common/GlowDivider";
import FinalCTA from "../../components/landing/FinalCTA";

import BackgroundEffects from "../../components/landing/BackgroundEffects";
import Particles from "../../components/landing/Particles";
import MouseGlow from "../../components/landing/MouseGlow";

import WhyDLM from "../../components/landing/WhyDLM";
import HowItWorks from "../../components/landing/HowItWorks";
import PlatformStats from "../../components/landing/PlatformStats";
import Footer from "../../components/landing/Footer";

function LandingPage() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden relative bg-[#0F1226] text-[#F1ECE0]">
      <MouseGlow />

      <Particles />

      <BackgroundEffects />

      <Navbar />

      <HeroSection />

      <GlowDivider />

      <WhyDLM />

      <GlowDivider />

      <HowItWorks />

      <GlowDivider />

      <AIMentorDemo />

      <GlowDivider />

      <LearningCoreSection />

      <GlowDivider />

      <CertificateExperience />

      <GlowDivider />

      <CareerPaths />

      <GlowDivider />

      <PlatformStats />

      <GlowDivider />

      <FinalCTA />

      <GlowDivider />
      <Footer />
    </div>
  );
}

export default LandingPage;