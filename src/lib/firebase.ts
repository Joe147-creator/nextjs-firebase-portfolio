import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJMPw0LOjSmPcqh6X3ZnZ1iolLD_YPpc4",
  authDomain: "portfolio-app-42edc.firebaseapp.com",
  projectId: "portfolio-app-42edc",
  storageBucket: "portfolio-app-42edc.firebasestorage.app",
  messagingSenderId: "969862501526",
  appId: "1:969862501526:web:d57dd9383be2b2b9171eb7",
  measurementId: "G-881GD9BPXE",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function createDbInstance(): Firestore {
  if (typeof window !== "undefined") {
    try {
      return initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      return getFirestore(app);
    }
  }
  return getFirestore(app);
}

export const auth = getAuth(app);
export const db: Firestore = createDbInstance();

export const ALLOWED_ADMIN_EMAIL = "batholomeo022@gmail.com";
export const PROJECTS_COLLECTION = "projects";