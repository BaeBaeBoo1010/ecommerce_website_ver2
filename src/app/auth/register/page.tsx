import { Suspense } from "react";
import RegisterForm from "./register-form"; // component con dùng useSearchParams()

export default function LoginPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
