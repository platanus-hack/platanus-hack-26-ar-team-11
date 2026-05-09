import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-balance text-3xl font-black leading-tight sm:text-4xl">
          Creá tu Twin
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Tu Twin aprende de vos para responder por vos.
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
