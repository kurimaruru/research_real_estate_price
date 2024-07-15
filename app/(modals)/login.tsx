import Colors from "@/constants/Colors";
import {
  isClerkAPIResponseError,
  useOAuth,
  useSignIn,
  useSignUp,
} from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
} from "react-native";

// https://github.com/clerkinc/clerk-expo-starter/blob/main/components/OAuth.tsx
import { defaultStyles } from "@/constants/Styles";
import { useWarmUpBrowser } from "@/hooks/useWarmUpBrowser";
import { useCallback, useState } from "react";

// enum Strategy {
//   Google = "oauth_google",
//   Apple = "oauth_apple",
//   Facebook = "oauth_facebook",
// }
const Page = () => {
  useWarmUpBrowser();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [isExistsAccount, setIsExistsAccount] = useState(false);
  const [isPendingMailAuth, setIsPendingMailAuth] = useState(false);

  const router = useRouter();
  // const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  // const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });
  // const { startOAuthFlow: facebookAuth } = useOAuth({
  //   strategy: "oauth_facebook",
  // });
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }
    if (isPendingMailAuth) setIsPendingMailAuth(false);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      setIsPendingMailAuth(true);
      if (isClerkAPIResponseError(err)) {
        const isExists = err.errors.some(
          (err) => err.code === "form_identifier_exists"
        );
        if (isExists) {
          setIsExistsAccount(true);
          return;
        }
      }
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) {
      return;
    }
    if (isPendingMailAuth) setIsPendingMailAuth(false);

    try {
      const signInAttempt = await signIn!.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
    }
  }, [isLoaded, emailAddress, password]);

  // const onSelectAuth = async (strategy: Strategy) => {
  //   const selectedAuth = {
  //     [Strategy.Google]: googleAuth,
  //     [Strategy.Apple]: appleAuth,
  //     [Strategy.Facebook]: facebookAuth,
  //   }[strategy];

  //   try {
  //     const { createdSessionId, setActive } = await selectedAuth();

  //     if (createdSessionId) {
  //       setActive!({ session: createdSessionId });
  //       router.back();
  //     }
  //   } catch (err) {
  //     console.error("OAuth error", err);
  //   }
  // };

  const onPressVerify = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace("/");
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  if (isPendingMailAuth) {
    return (
      <View style={styles.container}>
        <TextInput
          autoCapitalize="none"
          placeholder="Email"
          style={[defaultStyles.inputField, { marginBottom: 30 }]}
          value={emailAddress}
          onChangeText={(email) => setEmailAddress(email)}
        />
        <TextInput
          autoCapitalize="none"
          placeholder="Password"
          style={[defaultStyles.inputField, { marginBottom: 30 }]}
          onChangeText={(password) => setPassword(password)}
        />
        <TouchableOpacity
          style={defaultStyles.btn}
          onPress={isExistsAccount ? onSignInPress : onSignUpPress}
        >
          <Text style={defaultStyles.btnText}>
            {isExistsAccount ? "Login" : "SignUp"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!pendingVerification && (
        <>
          <TextInput
            autoCapitalize="none"
            placeholder="Email"
            style={[defaultStyles.inputField, { marginBottom: 30 }]}
            onChangeText={(email) => setEmailAddress(email)}
          />
          <TouchableOpacity style={defaultStyles.btn} onPress={onSignUpPress}>
            <Text style={defaultStyles.btnText}>Continue</Text>
          </TouchableOpacity>
          <View style={styles.seperatorView}>
            <View
              style={{
                flex: 1,
                borderBottomColor: "black",
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
            <Text style={styles.seperator}>or</Text>
            <View
              style={{
                flex: 1,
                borderBottomColor: "black",
                borderBottomWidth: StyleSheet.hairlineWidth,
              }}
            />
          </View>
          <View style={{ gap: 20 }}>
            <TouchableOpacity
              style={styles.btnOutline}
              // onPress={() => onSelectAuth(Strategy.Apple)}
            >
              <Ionicons
                name="logo-apple"
                size={24}
                style={defaultStyles.btnIcon}
              />
              <Text style={styles.btnOutlineText}>Continue with Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnOutline}
              // onPress={() => onSelectAuth(Strategy.Google)}
            >
              <Ionicons
                name="logo-google"
                size={24}
                style={defaultStyles.btnIcon}
              />
              <Text style={styles.btnOutlineText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      {pendingVerification && (
        <>
          <TextInput
            autoCapitalize="none"
            placeholder="Verify code..."
            style={[defaultStyles.inputField, { marginBottom: 30 }]}
            onChangeText={(code) => setCode(code)}
          />
          <TouchableOpacity style={defaultStyles.btn} onPress={onPressVerify}>
            <Text style={defaultStyles.btnText}>Verify Email</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 26,
  },

  seperatorView: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginVertical: 30,
  },
  seperator: {
    fontFamily: "mon-sb",
    color: Colors.grey,
    fontSize: 16,
  },
  btnOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.grey,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  btnOutlineText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "mon-sb",
  },
});
