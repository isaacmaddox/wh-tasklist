import { auth } from "@/lib/firebase";
import type { HandleErrorOptions, ServiceReturnType } from "@/lib/services";
import * as Sentry from "@sentry/react";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export class AuthService {
   private static instance: AuthService | null = null;

   public static getInstance() {
      if (this.instance === null) {
         this.instance = new AuthService();
      }

      return this.instance;
   }

   public async login({ email, password }: LoginArgs): Promise<ServiceReturnType<LoginArgs>> {
      const strippedEmail = email.trim();
      const strippedPassword = password.trim();

      if (!strippedEmail || !strippedPassword) {
         return {
            success: false,
            errors: {
               ...(!strippedEmail && { email: "Please enter an email" }),
               ...(!strippedPassword && { password: "Please enter a password" }),
            },
         };
      }

      try {
         const result = await signInWithEmailAndPassword(auth, strippedEmail, strippedPassword);

         if (!result.user) {
            return {
               success: false,
               errors: {
                  password: "Incorrect email or password",
               },
            };
         }

         return { success: true };
      } catch (e) {
         return this.handleError(e, {
            message: `Login failed for email ${strippedEmail}`,
            severity: "warning",
         });
      }
   }

   public async register({ email, password, confirmPassword }: SignupArgs): Promise<ServiceReturnType<SignupArgs>> {
      const strippedEmail = email.trim();

      if (!strippedEmail || !password || !confirmPassword) {
         return {
            success: false,
            errors: {
               ...(!strippedEmail && { email: "Please enter an email" }),
               ...(!password && { password: "Please enter an email" }),
               ...(!confirmPassword && { confirmPassword: "Please enter an email" }),
            },
         };
      }

      if (password !== confirmPassword) {
         return {
            success: false,
            errors: {
               confirmPassword: "Passwords do not match",
            },
         };
      }

      try {
         await createUserWithEmailAndPassword(auth, strippedEmail, password);

         return { success: true };
      } catch (e) {
         return this.handleError(e, {
            message: `Signup failed with email ${strippedEmail}`,
            severity: "warning",
         });
      }
   }

   private handleError(error: unknown, options?: HandleErrorOptions): ServiceReturnType<unknown> {
      if (import.meta.env.VITE_ENV !== "development")
         Sentry.captureMessage(options?.message || `An error occurred`, {
            level: options?.severity || "error",
            extra: {
               error,
            },
         });

      if (error instanceof FirebaseError) {
         const code = error.code as string;
         const message = error.message;

         console.error(`${code}: ${message}`);
         return {
            success: false,
            errors: {
               general: authErrorMessages[code] || "An error occurred",
            },
         };
      }

      return {
         success: false,
         errors: {
            general: "An error occurred",
         },
      };
   }
}

const authErrorMessages: Record<string, string> = {
   "auth/weak-password": "Your password must be at least 6 characters",
   "auth/email-already-in-use": "This email is already being used",
   "auth/invalid-credential": "Invalid username or password",
   "auth/invalid-email": "Please enter a valid email address",
   "auth/popup-closed-by-user": "The popup was closed before completing the sign-in",
};

interface LoginArgs {
   email: string;
   password: string;
}

interface SignupArgs {
   email: string;
   password: string;
   confirmPassword: string;
}
