"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Brain,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export function SignUpPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!firstName || !lastName || !email || !password) {
      setErrorMessage("Please fill in all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          password,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setErrorMessage(payload.message ?? "Unable to create account.");
        setIsSubmitting(false);
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        identifier: email,
        password,
      });

      if (result?.error) {
        setErrorMessage("Account created. Please sign in to continue.");
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Unable to reach authentication service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f4f5f6] px-5 py-10 dark:bg-[#1f2729]">
      <section className="w-full max-w-[520px] rounded-[12px] border border-[#dfe3e6] bg-white px-[44px] py-[48px] shadow-[0_35px_90px_rgba(15,23,42,0.12)] dark:border-[#343c3f] dark:bg-[#252c2e] dark:shadow-none">
        <div className="mb-[34px] flex items-center justify-center gap-[12px]">
        <Image
          src="/images/logo.png"
          alt="BKleads"
          width={150}
          height={300}
          className="h-[100px] w-[250px] dark:hidden"
        />

        <Image
          src="/images/logo.png"
          alt="BKleads"
          width={150}
          height={300}
          className="hidden h-[100px] w-[250px] dark:block"
        />
        </div>

        <div className="mb-[34px] grid h-[52px] grid-cols-2 rounded-[6px] bg-[#eef0f2] p-[4px] dark:bg-[#121819]">
          <Link
            href="/signin"
            className="flex items-center justify-center rounded-[4px] text-[15px] font-medium text-[#6e7880] transition hover:text-[#050607] dark:text-[#a6b0b7] dark:hover:text-white"
          >
            Sign in
          </Link>

          <button
            type="button"
            className="rounded-[4px] bg-white text-[15px] font-bold text-[#050607] shadow-[0_2px_6px_rgba(15,23,42,0.12)] dark:bg-[#252c2e] dark:text-white dark:shadow-none"
          >
            Create account
          </button>
        </div>

        <div className="mb-[34px] flex items-center gap-[18px]">
          <div className="h-px flex-1 bg-[#cfd5d9] dark:bg-[#4a5458]" />
          <span className="text-[13px] font-semibold uppercase tracking-[0.35em] text-[#7f8a92]">
            or
          </span>
          <div className="h-px flex-1 bg-[#cfd5d9] dark:bg-[#4a5458]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
            <div className="relative">
              <User className="absolute left-[18px] top-1/2 h-[19px] w-[19px] -translate-y-1/2 text-[#9da6ad]" />

              <Input
                name="firstName"
                placeholder="First name"
                required
                className="h-[48px] rounded-[4px] border-0 bg-[#f0f1f2] pl-[52px] pr-4 text-[15px] font-semibold text-[#030506] placeholder:text-[#9b9b9b] dark:bg-[#15191b] dark:text-white dark:placeholder:text-[#666]"
              />
            </div>

            <div className="relative">
              <User className="absolute left-[18px] top-1/2 h-[19px] w-[19px] -translate-y-1/2 text-[#9da6ad]" />

              <Input
                name="lastName"
                placeholder="Last name"
                required
                className="h-[48px] rounded-[4px] border-0 bg-[#f0f1f2] pl-[52px] pr-4 text-[15px] font-semibold text-[#030506] placeholder:text-[#9b9b9b] dark:bg-[#15191b] dark:text-white dark:placeholder:text-[#666]"
              />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-[20px] top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-[#9da6ad]" />

            <Input
              name="email"
              type="email"
              placeholder="maxim.gregory1@gmail.com"
              required
              className="h-[48px] rounded-[4px] border-0 bg-[#f0f1f2] pl-[56px] pr-5 text-[16px] font-semibold text-[#030506] placeholder:text-[#9b9b9b] dark:bg-[#15191b] dark:text-white dark:placeholder:text-[#666]"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-[20px] top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-[#9da6ad]" />

            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="h-[48px] rounded-[4px] border-0 bg-[#f0f1f2] pl-[56px] pr-[58px] text-[16px] font-semibold text-[#030506] placeholder:text-[#9b9b9b] dark:bg-[#15191b] dark:text-white dark:placeholder:text-[#666]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[#7f8a92] hover:text-[#1688ff]"
            >
              {showPassword ? (
                <EyeOff className="h-[19px] w-[19px]" />
              ) : (
                <Eye className="h-[19px] w-[19px]" />
              )}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute left-[20px] top-1/2 h-[20px] w-[20px] -translate-y-1/2 text-[#9da6ad]" />

            <Input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              required
              className="h-[48px] rounded-[4px] border-0 bg-[#f0f1f2] pl-[56px] pr-[58px] text-[16px] font-semibold text-[#030506] placeholder:text-[#9b9b9b] dark:bg-[#15191b] dark:text-white dark:placeholder:text-[#666]"
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-[20px] top-1/2 -translate-y-1/2 text-[#7f8a92] hover:text-[#1688ff]"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-[19px] w-[19px]" />
              ) : (
                <Eye className="h-[19px] w-[19px]" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1 text-[13px] text-[#7a858d] dark:text-[#89949b]">
            <Checkbox className="h-[16px] w-[16px] rounded-[4px]" />
            <span>
              I agree to{" "}
              <Link href="#" className="font-semibold text-[#1688ff]">
                privacy policy
              </Link>{" "}
              &amp; terms
            </span>
          </div>

          {errorMessage && (
            <div className="rounded-[4px] bg-red-50 px-4 py-3 text-center text-[14px] font-medium text-red-600 dark:bg-red-500/10">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-[20px] h-[49px] w-full rounded-[4px] bg-[#1688ff] text-[16px] font-bold text-white shadow-none transition hover:bg-[#087cff] disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
                Creating account...
              </span>
            ) : (
              "Sign up"
            )}
          </Button>
        </form>

        <p className="mx-auto mt-[26px] max-w-[340px] text-center text-[12px] leading-[1.8] text-[#7a858d] dark:text-[#7f8b92]">
          By creating an account, you agree to our Terms of Service and Privacy
          & Cookie Statement.
        </p>
      </section>
    </main>
  );
}