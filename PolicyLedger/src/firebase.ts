import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);

export interface AuthUserInfo {
  id: string;
  email: string;
  full_name: string | null;
  uid: string;
  isAnonymous?: boolean;
}

export async function loginWithFirebase(email?: string, password?: string): Promise<AuthUserInfo> {
  let userCredential;

  if (email && password && email.trim() !== "" && password.trim() !== "") {
    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      // If user not found, automatically register them
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } catch {
          // If creation also fails, fall back to anonymous login or re-throw readable error
          if (err.message) throw new Error(err.message.replace("Firebase: ", ""));
          throw err;
        }
      } else {
        throw new Error(err.message ? err.message.replace("Firebase: ", "") : "Authentication failed.");
      }
    }
  } else {
    // Demo / Anonymous Login
    userCredential = await signInAnonymously(auth);
  }

  const fbUser = userCredential.user;
  const token = await fbUser.getIdToken();

  const userInfo: AuthUserInfo = {
    id: fbUser.uid,
    email: fbUser.email || (email && email.includes("@") ? email : `${fbUser.uid.slice(0, 8)}@insuresight.demo`),
    full_name: fbUser.displayName || (email ? email.split("@")[0] : "Demo User"),
    uid: fbUser.uid,
    isAnonymous: fbUser.isAnonymous,
  };

  localStorage.setItem("policywise_token", token);
  localStorage.setItem("policywise_user", JSON.stringify(userInfo));

  return userInfo;
}

export async function logoutWithFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Sign out warning:", e);
  } finally {
    localStorage.removeItem("policywise_token");
    localStorage.removeItem("policywise_user");
    localStorage.removeItem("policywise_policy_id");
  }
}

export function getCurrentFirebaseUser(): AuthUserInfo | null {
  const currentFbUser = auth.currentUser;
  if (currentFbUser) {
    return {
      id: currentFbUser.uid,
      email: currentFbUser.email || `${currentFbUser.uid.slice(0, 8)}@insuresight.demo`,
      full_name: currentFbUser.displayName || "Demo User",
      uid: currentFbUser.uid,
      isAnonymous: currentFbUser.isAnonymous,
    };
  }

  const stored = localStorage.getItem("policywise_user");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        id: parsed.id || parsed.uid || "demo-user-123",
      };
    } catch {
      return null;
    }
  }

  if (localStorage.getItem("policywise_token")) {
    return {
      id: "demo-user-123",
      email: "demo@insuresight.ai",
      full_name: "Demo User",
      uid: "demo-user-123",
      isAnonymous: true,
    };
  }

  return null;
}

export default app;

