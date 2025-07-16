import { Suspense } from "react";
import LoginForm from "./login-form"; // component con dùng useSearchParams()

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
