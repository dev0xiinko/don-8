// app/login/page.tsx
import { Suspense } from "react"
import LoginPageClient from "@/components/auth/LoginPageClient"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  )
}
