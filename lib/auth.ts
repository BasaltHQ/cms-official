import { cookies } from "next/headers";
import { encrypt } from "@/lib/encryption";
import { prismadb } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import FacebookProvider from "next-auth/providers/facebook";
import SlackProvider from "next-auth/providers/slack";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { newUserNotify } from "./new-user-notify";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { logActivityInternal } from "@/actions/audit";

function getGoogleCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_ID;
  const clientSecret = process.env.GOOGLE_SECRET;
  if (!clientId || clientId.length === 0) {
    throw new Error("Missing GOOGLE_ID");
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Missing GOOGLE_SECRET");
  }

  return { clientId, clientSecret };
}

export const authOptions: NextAuthOptions = {
  debug: true, // Enable NextAuth debugging
  //trustHost: true, // Trust the host header (useful for proxies) - CAUSES TYPE ERROR usually, check types first. 
  // Actually NextAuthOptions type might not have trustHost in v4 types visibly? It does.
  // safer to just use debug first.
  secret: process.env.JWT_SECRET,
  //adapter: PrismaAdapter(prismadb),
  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),

    GitHubProvider({
      name: "github",
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),

    TwitterProvider({
      clientId: process.env.TWITTER_ID!,
      clientSecret: process.env.TWITTER_SECRET!,
      version: "2.0",
      allowDangerousEmailAccountLinking: false,
    }),

    // LinkedIn Provider
    {
      id: "linkedin",
      name: "LinkedIn",
      type: "oauth",
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid profile email" },
      },
      issuer: "https://www.linkedin.com",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      style: {
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
        logoDark: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
        bg: "#0077b5",
        text: "#fff",
      },
      wellKnown: "https://www.linkedin.com/oauth/openid/.well-known/openid-configuration",
    },

    // Microsoft Provider (Azure AD)
    {
      id: "azure-ad",
      name: "Microsoft",
      type: "oauth",
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: { params: { scope: "openid profile email User.Read" } },
      wellKnown: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID || "common"}/v2.0/.well-known/openid-configuration`,
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
        };
      },
    } as any,



    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },

      async authorize(credentials) {
        console.log("[Auth Debug] Authorize called");

        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth Debug] Missing credentials");
          throw new Error("Email or password is missing");
        }

        // Normalize email to avoid case sensitivity issues in lookups
        const normalizedEmail =
          typeof credentials.email === "string"
            ? credentials.email.trim().toLowerCase()
            : credentials.email;

        console.log(`[Auth Debug] Looking up user: ${normalizedEmail}`);

        const user = await prismadb.users.findFirst({
          where: {
            email: normalizedEmail,
          },
        });

        //clear white space from password
        const trimmedPassword = credentials.password.trim();

        if (!user) {
          console.log("[Auth Debug] User not found in database");
          throw new Error("User not found. Please register first.");
        }

        console.log(`[Auth Debug] User found: ${user.id}, Status: ${user.userStatus}`);

        // Check if user is active
        if (user.userStatus !== "ACTIVE") {
          console.log(`[Auth Debug] User inactive. Status: ${user.userStatus}`);
          throw new Error("Your account is pending approval. Please contact support.");
        }

        if (!user?.password) {
          console.log("[Auth Debug] User has no password set (OAuth user?)");
          throw new Error(
            "Account exists but no password is set. Sign in with Google/GitHub or use 'Forgot password' to set one."
          );
        }

        const isCorrectPassword = await bcrypt.compare(
          trimmedPassword,
          user.password
        );

        if (!isCorrectPassword) {
          console.log("[Auth Debug] Password mismatch");
          throw new Error("Password is incorrect");
        }

        console.log("[Auth Debug] Login successful, returning user");
        //console.log(user, "user");
        return user;
      },
    }),
  ],
  events: {
    // Update lastLoginAt only on sign-in to avoid concurrent session-triggered writes
    async signIn({ user }: any) {
      if (!user?.id) return;

      // Validation: Ensure user.id is a valid MongoDB ObjectID (24 hex chars)
      // Social providers (like Twitter) return numeric IDs which cause Prisma to crash
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(user.id);

      if (!isValidObjectId) {
        // console.warn(`[events.signIn] Skipping lastLoginAt update for non-MongoDB ID: ${user.id}`);
        return;
      }

      try {
        await prismadb.users.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // Log the login activity
        await logActivityInternal(user.id, "User Login", "Auth", "User logged in successfully");
      } catch (_err) {
        // swallow to avoid deadlocks during concurrent sign-ins
        console.error("Error in signIn event:", _err);
      }
    },
  },
  callbacks: {
    async jwt({ token, account, user }: any) {
      console.log("[Auth Debug] JWT Callback called");
      if (user) console.log(`[Auth Debug] JWT Callback - User present: ${user.id}`);
      if (account) console.log(`[Auth Debug] JWT Callback - Account present: ${account.provider}`);

      // If we have an account and the user is already signed in (token has email/sub) or we just signed in (user object present)
      if (account && ["twitter", "linkedin", "github", "azure-ad", "facebook", "slack"].includes(account.provider.toLowerCase())) {
        try {
          let dbUser = null;
          const cookieStore = await cookies();
          const linkingUserId = cookieStore.get("cms_linking_user")?.value;

          console.log(`[auth.jwt] Processing ${account.provider}. Linking Cookie: ${linkingUserId}`);

          // Strategy 1: Cookie-based Link (Highest Priority)
          if (linkingUserId && /^[0-9a-fA-F]{24}$/.test(linkingUserId)) {
            dbUser = await prismadb.users.findUnique({
              where: { id: linkingUserId }
            });
            if (dbUser) console.log(`[auth.jwt] Found user via cookie: ${dbUser.id}`);
          }

          // Strategy 2: Email Match (Fallback)
          if (!dbUser) {
            const email = user?.email || token?.email;
            if (email) {
              const normalizedEmail = email.toLowerCase();
              dbUser = await prismadb.users.findFirst({
                where: { email: normalizedEmail }
              });
            }
          }

          // Strategy 3: Token Sub (Existing Session)
          // This is flaky if NextAuth resets the token, but kept as backup
          if (!dbUser && token?.sub && /^[0-9a-fA-F]{24}$/.test(token.sub)) {
            dbUser = await prismadb.users.findUnique({
              where: { id: token.sub }
            });
          }

          if (dbUser) {
            console.log(`[auth.jwt] Linking ${account.provider} to User:`, dbUser.id);
            const provider = account.provider.toLowerCase();

            const existingToken = await prismadb.gmail_Tokens.findFirst({
              where: {
                user: dbUser.id,
                provider: provider,
              },
            });

            const tokenData = {
              access_token: encrypt(account.access_token || ""),
              refresh_token: encrypt(account.refresh_token || ""),
              scope: account.scope,
              expiry_date: account.expires_at ? new Date(account.expires_at * 1000) : undefined,
              updatedAt: new Date(),
            };

            let result;
            if (existingToken) {
              result = await prismadb.gmail_Tokens.update({
                where: { id: existingToken.id },
                data: tokenData as any,
              });
            } else {
              result = await prismadb.gmail_Tokens.create({
                data: {
                  user: dbUser.id,
                  provider: provider,
                  createdAt: new Date(),
                  ...tokenData,
                } as any,


              });
            }

            console.log(`[auth.jwt] Token saved. Restoring session for user: ${dbUser.email}`);

            // Log activity
            try {
              await logActivityInternal(
                dbUser.id,
                "Linked Social Account",
                "Social Integration",
                `Connected ${account.provider} account`
              );
            } catch (e) {
              console.error("Failed to log social link activity", e);
            }

            // CRITICAL: Restore the session to the Original User
            // This prevents NextAuth from logging us into the temporary Twitter account
            token.sub = dbUser.id;
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.picture = dbUser.avatar;

          } else {
            console.warn(`[auth.jwt] Could not find internal user to attach ${account.provider} token to.`);
          }
        } catch (error) {
          console.error(`[auth.jwt] Error saving ${account.provider} tokens:`, error);
        }
      }

      // Credentials Login Logic (or when user object is available)
      // Ensure we copy the user data to the token so the session callback can see it
      if (user) {
        console.log(`[Auth Debug] JWT Callback - Copying user data to token: ${user.email}`);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.avatar;
        token.sub = user.id;
      }

      return token;
    },

    //TODO: fix this any
    async session({ token, session }: any) {
      console.log("[Auth Debug] Session Callback called");
      // Guard against missing token data to avoid runtime errors and JWT session failures
      if (!token?.email) {
        console.log("[Auth Debug] Session Callback - Token missing email", token);
        return session;
      }

      // Normalize email for stable lookups and consistent storage
      const tokenEmail =
        typeof token?.email === "string" ? token.email.toLowerCase() : token?.email;

      const user = await prismadb.users.findFirst({
        where: {
          email: tokenEmail,
        },
      });

      if (!user) {
        try {
          // Attempt to create the user
          const newUser = await prismadb.users.create({
            data: {
              email: tokenEmail,
              name: token.name,
              avatar: token.picture,
              is_admin: false,
              is_account_admin: false,
              lastLoginAt: new Date(),
              userStatus:
                process.env.NEXT_PUBLIC_APP_URL === "https://demo.nextcrm.io"
                  ? "ACTIVE"
                  : "PENDING",
            },
          });

          await newUserNotify(newUser);

          //Put new created user data in session
          session.user.id = newUser.id;
          session.user.name = newUser.name;
          session.user.email = newUser.email;
          session.user.avatar = newUser.avatar;
          session.user.image = newUser.avatar;
          session.user.isAdmin = false;
          session.user.userLanguage = newUser.userLanguage;
          session.user.userStatus = newUser.userStatus;
          session.user.lastLoginAt = newUser.lastLoginAt;
          return session;
        } catch (error) {
          console.error("[auth.session] users.create error (potential race condition):", error);

          // If create failed (likely due to race condition), try finding the user again
          const existingUser = await prismadb.users.findFirst({
            where: {
              email: tokenEmail,
            },
          });

          if (existingUser) {
            // User exists now (likely created by concurrent request) - populate session
            session.user.id = existingUser.id;
            session.user.name = existingUser.name;
            session.user.email = existingUser.email;
            session.user.avatar = existingUser.avatar;
            session.user.image = existingUser.avatar;
            session.user.isAdmin = existingUser.is_admin;
            session.user.userLanguage = existingUser.userLanguage;
            session.user.userStatus = existingUser.userStatus;
            session.user.lastLoginAt = existingUser.lastLoginAt;
            session.user.cmsModules = existingUser.cmsModules;
            session.user.timezone = existingUser.timezone;
            session.user.region = existingUser.region;

            // Fetch role and permissions if available
            if (existingUser.roleId) {
              const role = await prismadb.role.findUnique({ where: { id: existingUser.roleId } });
              if (role) {
                session.user.role = role.name;
                session.user.permissions = role.permissions;
              }
            }
            return session;
          }

          // If we still can't find the user, return session without user data (or let it fail)
          return session;
        }
      } else {
        console.log(`[Auth Debug] Session Callback - User found: ${user.id}`);
        // User already exists in localDB, put user data in session (avoid DB writes here)
        //User allready exist in localDB, put user data in session
        session.user.id = user.id;
        session.user.name = user.name;
        session.user.email = user.email;
        session.user.avatar = user.avatar;
        session.user.image = user.avatar;
        session.user.isAdmin = user.is_admin;
        session.user.userLanguage = user.userLanguage;
        session.user.userStatus = user.userStatus;
        session.user.lastLoginAt = user.lastLoginAt;
        session.user.cmsModules = user.cmsModules;
        session.user.timezone = user.timezone;
        session.user.region = user.region;
        session.user.forcePasswordReset = user.forcePasswordReset;

        // Fetch role and permissions if available
        if (user.roleId) {
          const role = await prismadb.role.findUnique({ where: { id: user.roleId } });
          if (role) {
            session.user.role = role.name;
            session.user.permissions = role.permissions;
          }
        }
      }

      //console.log(session, "session");
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/cms/oauth", // Redirect to integrations page on error so we can show a toast
  },
};
