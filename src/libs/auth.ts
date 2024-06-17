import CredentialProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      name: "Credentials",
      type: "credentials",

      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        try {
          const res = await fetch(`${process.env.API_URL}/auth/signin`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();
          console.log("----",data);
          if(data.status === 'failure'){
            throw new Error(JSON.stringify(data));
          }
          
          if (res.status === 401) {
            throw new Error(JSON.stringify(data));
          }

          if (res.status === 200) {
            
            return data.data;
          }

          return null;
        } catch (e: any) {
          throw new Error(e.message);
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",

    maxAge: 30 * 24 * 60 * 60, // ** 30 days
  },

  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.userId;
        token.name = user.userName;
        token.email = user.email;
        token.access_token = user.token;
        token.refresh_token = user.refresh_token;
        token.tokenExpiry = user.tokenExpiry;
        token.refreshTokenExpiry = user.refreshTokenExpiry || 0;
      }
      // console.log(token, "token");
      return token;
    },
    async session({ session, token }: any) {
      console.log(token, "12312312312312");
      if (token) {
        session.user.id = token.id || token.sub;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.access_token = token.access_token;
        session.user.refresh_token = token.refresh_token;
        session.user.tokenExpiry = token.tokenExpiry;
        session.user.refreshTokenExpiry = token.refreshTokenExpiry;
        console.log(session);
      }

      return session;
    },
  },
};