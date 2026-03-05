import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { default: dbConnect } = await import("@/lib/db");
        const { default: User } = await import("@/lib/models/User");

        await dbConnect();

        const user = await User.findOne({ email: credentials.email }).lean();

        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            factoryId: user.factoryId?.toString(),
            storeId: user.storeId?.toString() || null,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.factoryId = user.factoryId;
        token.storeId = user.storeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.factoryId = token.factoryId;
        session.user.storeId = token.storeId;
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
