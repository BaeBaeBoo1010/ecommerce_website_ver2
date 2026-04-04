"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

/* --------------------------- Submit button --------------------------- */
function SubmitBtn({ pending }: { pending: boolean }) {
  return (
    <Button
      className="w-full text-base font-semibold"
      type="submit"
      disabled={pending}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Đang kiểm tra..." : "Đăng nhập"}
    </Button>
  );
}


/* ---------------------------- Login Page ---------------------------- */
export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { update } = useSession();
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Sai email hoặc mật khẩu");
      } else if (res?.ok) {
        toast.success("Đăng nhập thành công!");
        // Force refresh session hoàn toàn bằng window.location
        await update();
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      } else {
        toast.error("Đăng nhập thất bại, vui lòng thử lại.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Lỗi máy chủ, vui lòng thử lại sau.");
    } finally {
      setPending(false);
    }
  }


  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-sky-50 to-indigo-100 p-4 dark:from-neutral-900 dark:to-neutral-800">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg backdrop-blur-xl dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-bold">
              Đăng nhập
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
                <Mail
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>

              {/* Password + toggle */}
              <div className="relative">
                <Input
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Mật khẩu"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10"
                />
                <Lock
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowPw((s) => !s)}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <SubmitBtn pending={pending} />
            </form>

            <p className="pt-4 text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Tạo tài khoản
              </Link>
            </p>
            <p className="pt-2 text-center text-sm">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Quên mật khẩu?
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
