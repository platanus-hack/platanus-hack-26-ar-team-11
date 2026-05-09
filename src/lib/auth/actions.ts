"use server";

import { redirect } from "next/navigation";
import { signOut } from "./server";

export async function signOutAction() {
  await signOut();
  redirect("/");
}
