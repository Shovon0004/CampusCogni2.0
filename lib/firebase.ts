// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth" // Import GithubAuthProvider

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEhDf_z-HTlit9suWItzmHcpojTNc7IyM",
  authDomain: "authentication-59a39.firebaseapp.com",
  projectId: "authentication-59a39",
  storageBucket: "authentication-59a39.firebasestorage.app",
  messagingSenderId: "714342017529",
  appId: "1:714342017529:web:f66d5e38214ee7ce433528",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider() // Initialize GitHub provider

export default app
