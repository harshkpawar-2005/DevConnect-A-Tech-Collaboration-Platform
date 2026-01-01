import { SignedIn, SignedOut } from "@clerk/clerk-react";
import HeaderLoggedIn from "./HeaderLoggedIn";
import HeaderLoggedOut from "./HeaderLoggedOut";

export default function Header() {
  return (
    <>
      {/* This component from Clerk will check if a user is signed in.
        If YES, it renders <HeaderLoggedIn />.
      */}
      <SignedIn>
        <HeaderLoggedIn />
      </SignedIn>
      
      {/* If NO, it renders <HeaderLoggedOut />.
      */}
      <SignedOut>
        <HeaderLoggedOut />
      </SignedOut>
    </>
  );
}