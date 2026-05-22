"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier,
        password,
      });

      if (!result) {
        setErrorMessage("Unable to sign in right now. Please try again.");
        return;
      }

      if (result.error) {
        setErrorMessage(
          result.error === "CredentialsSignin"
            ? "Invalid credentials"
            : result.error
        );
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
    <main className="flex min-h-screen w-full items-center justify-center bg-[#f3f4f5] px-5 py-10 dark:bg-[#1f2427]">
      <section className="w-full max-w-[410px] rounded-[12px] border border-[#e3e5e8] bg-white px-[34px] py-[42px] shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:border-[#30363a] dark:bg-[#252b2d] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        {/* LOGO */}
        <div className="mb-[34px] flex items-center justify-center gap-[10px]">
          {/* <Brain
            className="h-[30px] w-[30px] text-[#0A84FF]"
            strokeWidth={2.4}
          />

          <span className="text-[25px] font-black tracking-[-0.05em] text-[#050607] dark:text-white">
            BKleads
          </span> */}
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

        <Button
          type="button"
          variant="outline"
          onClick={() => signIn("google")}
          className="mb-[14px] h-[48px] w-full rounded-[10px] border border-[#d8dce0] bg-white text-[15px] font-semibold text-[#111] shadow-none hover:bg-[#fafafa] dark:border-[#3a4044] dark:bg-[#202528] dark:text-white dark:hover:bg-[#252b2f]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="mr-[12px] h-[20px] w-[20px]"
          >
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303C33.655 32.657 29.195 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            />
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4c-7.682 0-14.347 4.337-17.694 10.691z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.144 35.091 26.715 36 24 36c-5.176 0-9.625-3.326-11.286-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303c-1.058 3.001-3.162 5.479-6.084 7.071l.003-.002 6.19 5.238C35.02 39.659 44 33 44 24c0-1.341-.138-2.65-.389-3.917z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="mx-auto mt-[22px] max-w-[285px] text-center text-[12px] leading-[1.7] text-[#8b8b8b] dark:text-[#6d7479]">
          By creating an account, you agree to our Terms of Service and Privacy
          & Cookie Statement.
        </p>
      </section>
    </main>
  );
}