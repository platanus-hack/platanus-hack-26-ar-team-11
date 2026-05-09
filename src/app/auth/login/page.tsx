import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const params = await searchParams;
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-balance text-3xl font-black leading-tight sm:text-4xl">
          Bienvenido de nuevo
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Iniciá sesión para continuar entrenando tu Twin.
        </p>
      </div>
      <LoginForm returnTo={params.return_to} />
    </div>
  );
}
