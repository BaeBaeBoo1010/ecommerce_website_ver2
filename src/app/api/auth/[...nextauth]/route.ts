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

const nextAuth = NextAuth({
  trustHost: true,
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/login" },

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

        if (!email || !password) return null;

        await connectMongoDB();
        const user = (await User.findOne({ email }).lean()) as LeanUser | null;
        if (!user || typeof user.password !== "string") return null;

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
      if (user?.role) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role;
      }
      return session;
    },
  },
});

const { handlers } = nextAuth;

export const GET = handlers.GET;
export const POST = handlers.POST;
