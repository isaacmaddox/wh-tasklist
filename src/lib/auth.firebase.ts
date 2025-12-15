import { FirebaseError } from "firebase/app";
import {
   createUserWithEmailAndPassword,
   GoogleAuthProvider,
   signInWithEmailAndPassword,
   signInWithPopup,
   signOut,
   type User,
} from "firebase/auth";
import { auth } from "./firebase";
const googleProvider = new GoogleAuthProvider();

const authErrorMessages: Record<string, string> = {
   "auth/weak-password": "Your password must be at least 6 characters",
   "auth/email-already-in-use": "This email is already being used",
   "auth/invalid-credential": "Invalid username or password",
   "auth/invalid-email": "Please enter a valid email address",
   "auth/popup-closed-by-user": "The popup was closed before completing the sign-in",
};

export async function signUpWithEmailAndPassword(email: string, password: string): AuthActionResponse<User> {
   try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      return { data: user };
   } catch (e) {
      if (e instanceof FirebaseError) {
         const code = e.code as string;
         const message = e.message;

         console.error(`${code}: ${message}`);
         return { error: authErrorMessages[code] || "An error occurred." };
      }

      return { error: "An error occurred" };
   }
}

export async function loginWithGoogle(): AuthActionResponse<User> {
   try {
      const { user } = await signInWithPopup(auth, googleProvider);

      return {
         data: user,
      };
   } catch (e) {
      if (e instanceof FirebaseError) {
         const code = e.code as string;
         const message = e.message;

         console.error(`${code}: ${message}`);
         return { error: authErrorMessages[code] || "An error occurred." };
      }

      return { error: "An error occurred" };
   }
}

export async function loginWithEmailAndPassword(email: string, password: string): AuthActionResponse<User> {
   try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      if (!user) {
         return {
            error: "Invalid username or password",
         };
      }

      return {
         data: user,
      };
   } catch (e) {
      if (e instanceof FirebaseError) {
         const code = e.code as string;
         const message = e.message;

         console.error(`${code}: ${message}`);
         return { error: authErrorMessages[code] || "An error occurred." };
      }

      return { error: "An error occurred" };
   }
}

export async function signOutUser() {
   try {
      await signOut(auth);
   } catch (e) {
      if (e instanceof FirebaseError) {
         const code = e.code as string;
         const message = e.message;

         console.error(`${code}: ${message}`);
         return { error: authErrorMessages[code] || "An error occurred." };
      }

      return { error: "An error occurred" };
   }
}

type AuthActionResponse<Data, Error = string> = Promise<
   | {
        data: Data;
        error?: never;
     }
   | {
        data?: never;
        error: Error;
     }
>;
