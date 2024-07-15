import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Tabs } from "expo-router";
export default function Layout() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return <Redirect href={"/sign-in"} />;
  }
  return <Tabs />;
}
