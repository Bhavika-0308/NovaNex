import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type Auth,
} from "firebase/auth";

// Default working Firebase config (used when environment variables are omitted on Vercel)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAEE04g2EZMJryWRsBFtzxA_DMfqdiKq3M",
  authDomain: "insuresight-a94da.firebaseapp.com",
  projectId: "insuresight-a94da",
  storageBucket: "insuresight-a94da.firebasestorage.app",
  messagingSenderId: "964628830319",
  appId: "1:964628830319:web:d765d9cbde5c214967959a",
  measurementId: "G-JBZRCMF8VH",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (err) {
  console.warn("Firebase initialization warning (using local fallback mode):", err);
  try {
    app = initializeApp(DEFAULT_FIREBASE_CONFIG);
    auth = getAuth(app);
  } catch (fallbackErr) {
    console.error("Firebase fallback failed:", fallbackErr);
    app = null;
    auth = null;
  }
}

// Safely initialize analytics only if in supported browser environment
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported && app && firebaseConfig.measurementId) {
        getAnalytics(app);
      }
    })
    .catch(() => {});
}

export { auth };

export interface AuthUserInfo {
  id: string;
  email: string;
  full_name: string | null;
  uid: string;
  isAnonymous?: boolean;
}

export async function loginWithFirebase(email?: string, password?: string): Promise<AuthUserInfo> {
  // If Firebase Auth is not available or blocked, provide instant demo user
  if (!auth) {
    const demoInfo: AuthUserInfo = {
      id: "demo-user-123",
      email: email && email.includes("@") ? email : "demo@insuresight.ai",
      full_name: email ? email.split("@")[0] : "Demo User",
      uid: "demo-user-123",
      isAnonymous: true,
    };
    localStorage.setItem("policywise_token", "firebase_demo_token");
    localStorage.setItem("policywise_user", JSON.stringify(demoInfo));
    return demoInfo;
  }

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
          if (err.message) throw new Error(err.message.replace("Firebase: ", ""));
          throw err;
        }
      } else {
        throw new Error(err.message ? err.message.replace("Firebase: ", "") : "Authentication failed.");
      }
    }
  } else {
    // Demo / Anonymous Login
    try {
      userCredential = await signInAnonymously(auth);
    } catch {
      // Fallback for demo access if anonymous auth is not enabled in Firebase console
      const demoInfo: AuthUserInfo = {
        id: "demo-user-123",
        email: "demo@insuresight.ai",
        full_name: "Demo User",
        uid: "demo-user-123",
        isAnonymous: true,
      };
      localStorage.setItem("policywise_token", "firebase_demo_token");
      localStorage.setItem("policywise_user", JSON.stringify(demoInfo));
      return demoInfo;
    }
  }

  const fbUser = userCredential.user;
  let token = "firebase_demo_token";
  try {
    token = await fbUser.getIdToken();
  } catch {
    // ignore token fetch error in restricted environments
  }

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

export async function createAccountWithFirebase(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthUserInfo> {
  const cleanEmail = email.trim();
  const cleanPassword = password.trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error("Please enter both email and password.");
  }
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    throw new Error("Please enter a valid email address.");
  }
  if (cleanPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // If Firebase Auth is offline or blocked, fallback gracefully
  if (!auth) {
    const demoInfo: AuthUserInfo = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: fullName?.trim() || cleanEmail.split("@")[0],
      uid: `usr-${Date.now()}`,
      isAnonymous: false,
    };
    localStorage.setItem("policywise_token", "firebase_demo_token");
    localStorage.setItem("policywise_user", JSON.stringify(demoInfo));
    return demoInfo;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
    const fbUser = userCredential.user;

    if (fullName && fullName.trim()) {
      try {
        await updateProfile(fbUser, { displayName: fullName.trim() });
      } catch (e) {
        console.warn("Could not update displayName:", e);
      }
    }

    let token = "firebase_demo_token";
    try {
      token = await fbUser.getIdToken();
    } catch {
      // ignore
    }

    const userInfo: AuthUserInfo = {
      id: fbUser.uid,
      email: fbUser.email || cleanEmail,
      full_name: fullName?.trim() || fbUser.displayName || cleanEmail.split("@")[0],
      uid: fbUser.uid,
      isAnonymous: false,
    };

    localStorage.setItem("policywise_token", token);
    localStorage.setItem("policywise_user", JSON.stringify(userInfo));

    return userInfo;
  } catch (err: any) {
    if (err.code === "auth/email-already-in-use") {
      throw new Error("An account with this email already exists. Please sign in instead.");
    } else if (err.code === "auth/weak-password") {
      throw new Error("Password is too weak. Please use at least 6 characters.");
    } else if (err.code === "auth/invalid-email") {
      throw new Error("Please enter a valid email address.");
    } else {
      throw new Error(err.message ? err.message.replace("Firebase: ", "") : "Account creation failed.");
    }
  }
}

export async function logoutWithFirebase(): Promise<void> {
  try {
    if (auth) {
      await signOut(auth);
    }
  } catch (e) {
    console.warn("Sign out warning:", e);
  } finally {
    localStorage.removeItem("policywise_token");
    localStorage.removeItem("policywise_user");
    localStorage.removeItem("policywise_policy_id");
  }
}

export function getCurrentFirebaseUser(): AuthUserInfo | null {
  if (auth?.currentUser) {
    const currentFbUser = auth.currentUser;
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

