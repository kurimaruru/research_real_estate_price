import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ClerkProvider, useAuth, ClerkLoaded } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkLoaded>
        {/* Slotで現在のルートに基づいて適切なページやコンポーネントをレンダリング */}
        {/* <Slot /> */}
        <RootLayoutNav />
      </ClerkLoaded>
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // Automatically open login if user is not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/(modals)/login");
    }
  }, [isLoaded]);

  return (
    <Stack>
      <Stack.Screen
        name="(modals)/login"
        options={{
          presentation: "modal",
          title: "Log in or sign up",
          headerTitleStyle: {
            fontFamily: "mon-sb",
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close-outline" size={28} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}

export default RootLayout;
