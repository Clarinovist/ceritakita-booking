import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "CeritaKita Admin",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "admin" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const adminUser = process.env.ADMIN_USERNAME;
                const adminPass = process.env.ADMIN_PASSWORD;

                if (
                    credentials?.username === adminUser &&
                    credentials?.password === adminPass
                ) {
                    return { id: "1", name: "Admin", email: "admin@ceritakita.com" };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
