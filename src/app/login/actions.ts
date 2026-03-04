"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (
    username === process.env.AUTH_USERNAME &&
    password === process.env.AUTH_PASSWORD
  ) {
    const cookieStore = await cookies();
    cookieStore.set("session", process.env.AUTH_SECRET!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    redirect("/");
  } else {
    redirect("/login?error=Credenciais+inv%C3%A1lidas");
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
