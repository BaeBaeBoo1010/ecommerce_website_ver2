import { Suspense } from "react";
import RegisterForm from "./register-form"; // component con dùng useSearchParams()

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
