import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise, { connectMongoDB } from "@/lib/mongodb";
import { User } from "@/models/user";
import { compare } from "bcryptjs";

type LeanUser = {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
};

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
  adapter: MongoDBAdapter(clientPromise),
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

        await connectMongoDB();
        const user = (await User.findOne({ email }).lean()) as LeanUser | null;
        if (!user || typeof user.password !== "string") return null;

        // ✅ Security: Use constant-time comparison (bcryptjs compare is already safe)
        const ok = await compare(password, user.password);
        if (!ok) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as "admin" | "user";
      }
      return session;
    },
  },
});

const { handlers } = nextAuth;

export const GET = handlers.GET;
export const POST = handlers.POST;
