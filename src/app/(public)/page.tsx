import { getCurrentUser } from "@/lib/auth/server";
import { Hero } from "@/components/landing/Hero";
import { StepStack } from "@/components/landing/StepStack";
import { UseCases } from "@/components/landing/UseCases";
import { CallToAction } from "@/components/landing/CallToAction";
import { LandingFooter } from "@/components/landing/Footer";

export const metadata = {
  title: "Twin Protocol — Tu yo digital, conectado a todas tus apps",
  description:
    "Creá tu Twin una vez y usalo en todas tus apps. Recomendaciones personalizadas, sin perder el control de tus datos.",
};

export default async function HomePage() {
  const user = await getCurrentUser();
  const isAuthenticated = Boolean(user);

  return (
    <>
      <Hero isAuthenticated={isAuthenticated} />
      <StepStack />
      <UseCases />
      <CallToAction isAuthenticated={isAuthenticated} />
      <LandingFooter isAuthenticated={isAuthenticated} />
    </>
  );
}
