import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ return_to?: string }>;
}) {
  const params = await searchParams;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bienvenido de nuevo</CardTitle>
        <CardDescription>Ingresá para continuar entrenando tu Twin.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm returnTo={params.return_to} />
      </CardContent>
    </Card>
  );
}
