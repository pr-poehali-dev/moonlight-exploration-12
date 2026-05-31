import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { KiraChat } from "@/components/KiraChat";
import { Security } from "@/components/Security";
import { ContactCTA } from "@/components/ContactCTA";

export default function Index() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <KiraChat />
      <Security />
      <ContactCTA />
    </>
  );
}