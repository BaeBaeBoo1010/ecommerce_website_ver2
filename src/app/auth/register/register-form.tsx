"use client";

import { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { register } from "@/app/auth/register/action";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, User, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

/* --------------------------- Submit button --------------------------- */
function SubmitBtn({ pending }: { pending: boolean }) {
  return (
    <Button
      type="submit"
      className="w-full text-base font-semibold"
      disabled={pending}
    >
      {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
    </Button>
  );
}

export default function RegisterPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, formAction] = useFormState(register, null);
  const { pending } = useFormStatus();

  /* ----- Toast & redirect khi đăng ký thành công ----- */
  useEffect(() => {
    if (state?.success && state.credentials) {
      const { email, password } = state.credentials;

      signIn("credentials", { redirect: false, email, password }).then(
        (res) => {
          if (res?.ok) {
            toast.success(
              "Đăng ký thành công! Chào mừng bạn đến với cửa hàng.",
            );
            router.push("/");
          }
        },
      );
    }
  }, [state, router]);

  /* ----- Toast khi email đã tồn tại ----- */
  useEffect(() => {
    if (state?.error === "Email đã tồn tại" && state.email) {
      toast.error(
        `Email ${state.email} đã tồn tại, bạn có muốn đăng nhập bằng email này không?`,
        {
          action: {
            label: "Đăng nhập",
            onClick: () =>
              router.push(
                `/auth/login?email=${encodeURIComponent(state.email)}`,
              ),
          },
        },
      );
    }
  }, [state, router]);

  const emailError = state?.error === "Email đã tồn tại";

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
              Đăng ký
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Render lỗi khác (không phải email) */}
            {state?.error && state.error !== "Email đã tồn tại" && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
                {state.error}
              </p>
            )}

            <form action={formAction} className="space-y-5">
              {/* Họ tên */}
              <div className="relative">
                <Input
                  name="name"
                  placeholder="Họ và tên"
                  required
                  defaultValue={params.get("name") ?? ""}
                  className="pl-10"
                />
                <User
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  defaultValue={params.get("email") ?? ""}
                  className={`pl-10 ${emailError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                <Mail
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Input
                  name="password"
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  required
                  minLength={6}
                  className="pl-10"
                />
                <Lock
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
              </div>

              <SubmitBtn pending={pending} />
            </form>

            <p className="pt-4 text-center text-sm">
              Đã có tài khoản?{" "}
              <a
                href="/auth/login"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Đăng nhập
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
