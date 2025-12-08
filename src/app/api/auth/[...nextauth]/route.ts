import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

// ✅ Security: Validate NEXTAUTH_SECRET
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET environment variable is not set");
}

// ✅ Security: Validate minimum secret length
if (process.env.NEXTAUTH_SECRET.length < 32) {
  throw new Error("NEXTAUTH_SECRET must be at least 32 characters long");
}

const nextAuth = NextAuth({
  trustHost: true,
  // Adapter removed in favor of manual Credentials handling for this migration step
  // or until a Supabase adapter is properly set up if desired. 
  // For now, we just authenticate against the 'users' table.
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/auth/login" },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase().trim()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        // ✅ Security: Validate input length to prevent DoS
        if (!email || !password || email.length > 255 || password.length > 500) {
          return null;
        }

        // ✅ Security: Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return null;
        }

        // Check if supabaseAdmin is available
        if (!supabaseAdmin) {
          console.error("supabaseAdmin is not configured. SUPABASE_SERVICE_ROLE_KEY may be missing.");
          return null;
        }

        // Fetch user from Supabase
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error || !user) {
          console.error("Error fetching user or user not found:", error);
          return null;
        }

        if (!user.password) return null;

        // ✅ Security: Use constant-time comparison (bcryptjs compare is already safe)
        const ok = await compare(password, user.password);
        if (!ok) return null;

        return {
          id: user._id || user.id, // Support both _id (migrated from Mongo) and id
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // cast user to have role, as NextAuth default types might not show it extended yet
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as "admin" | "user";
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
});

const { handlers } = nextAuth;

export const GET = handlers.GET;
export const POST = handlers.POST;
