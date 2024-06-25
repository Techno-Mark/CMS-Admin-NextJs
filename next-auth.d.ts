import NextAuth, { type DefaultSession } from "next-auth"
 
export type ExtendedUser = DefaultSession["user"] & {
    id: string;
    token: string;
    refresh_token: string;
    expires_at: string;
    CompanyId: number;
}
 
declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }
}
 