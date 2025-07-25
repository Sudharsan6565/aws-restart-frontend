import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import "./index.css"; // ⬅️ Import Tailwind styles

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <SignedIn>
          <App />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
