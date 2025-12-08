"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { register } from "@/app/auth/register/action";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mail, User, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function FormSubmitBtn() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full text-base font-semibold"
      disabled={pending}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
    </Button>
  );
}

export default function RegisterPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, formAction] = useFormState(register, null);
  const [showPassword, setShowPassword] = useState(false);
  const [formValues, setFormValues] = useState({ email: "", password: "" });

  useEffect(() => {
    if (state?.success && formValues.email && formValues.password) {
      toast.success("Đăng ký thành công! Đang đăng nhập...");
      signIn("credentials", {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
      }).then((res) => {
        if (res?.ok) {
          router.push("/");
        } else {
          toast.error("Đăng nhập thất bại");
        }
      });
    }
  }, [state, formValues, router]);

  useEffect(() => {
    if (state?.error === "EMAIL_EXISTS" && state.email) {
      toast.error(
        `Tài khoản ${state.email} đã tồn tại, bạn có muốn đăng nhập bằng email này không?`,
        {
          duration: Infinity,
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

  const errorMessage = {
    MISSING_FIELDS: "Thiếu thông tin bắt buộc",
    INVALID_EMAIL: "Email không hợp lệ",
    INVALID_NAME: "Họ tên không hợp lệ",
    INVALID_INPUT: "Dữ liệu không hợp lệ",
    EMAIL_EXISTS: "Email đã tồn tại",
    WEAK_PASSWORD: "Mật khẩu phải tối thiểu 6 ký tự",
    SERVER_ERROR: "Lỗi máy chủ, vui lòng thử lại sau",
  };

  const emailError = state?.error === "EMAIL_EXISTS";

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
              Tạo tài khoản
            </CardTitle>
          </CardHeader>

          <CardContent>
            {state?.error && state.error !== "EMAIL_EXISTS" && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
                {errorMessage[state.error as keyof typeof errorMessage] ??
                  "Đã xảy ra lỗi"}
              </p>
            )}

            <form
              action={formAction}
              className="space-y-5"
              onSubmit={(e) => {
                const form = e.currentTarget;
                const email = form.email.value;
                const password = form.password.value;
                setFormValues({ email, password });
              }}
            >
              {/* Họ tên */}
              <div className="relative">
                <Input
                  name="name"
                  placeholder="Họ và tên"
                  required
                  defaultValue={state?.name ?? params.get("name") ?? ""}
                  className="pl-10"
                  autoComplete="name"
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
                  defaultValue={state?.email ?? params.get("email") ?? ""}
                  className={`pl-10 ${
                    emailError
                      ? "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                  autoComplete="email"
                />
                <Mail
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
              </div>

              {/* Password + Toggle */}
              <div className="relative">
                <Input
                  name="password"
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  required
                  minLength={6}
                  type={showPassword ? "text" : "password"}
                  className="pr-10 pl-10"
                  autoComplete="new-password"
                />
                <Lock
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <FormSubmitBtn />
            </form>

            <p className="pt-4 text-center text-sm">
              Đã có tài khoản?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Đăng nhập
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
