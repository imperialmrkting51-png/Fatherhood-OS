import { useSignIn, useOAuth, useClerk } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { FONTS } from "@/constants/fonts";

WebBrowser.maybeCompleteAuthSession();

function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => void WebBrowser.coolDownAsync();
  }, []);
}

export default function SignIn() {
  useWarmUpBrowser();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async () => {
    if (!email || !password || isLoading || !signIn) return;
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoading(true);
    setError(null);
    try {
      await signIn.create({ identifier: email, password });
      if (signIn.status === "complete") {
        await setActive({ session: signIn.createdSessionId! });
        router.replace("/(tabs)");
      } else {
        setError("Sign in could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: Array<{ message: string }> };
      setError(
        clerkErr?.errors?.[0]?.message ??
          (err instanceof Error ? err.message : "Sign in failed. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = useCallback(async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      const { createdSessionId, setActive: sa } = await startOAuthFlow({
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      if (createdSessionId && sa) {
        await sa({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error(err);
    }
  }, [startOAuthFlow, router]);

  const topPad = Platform.OS === "web" ? 24 : insets.top;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topPad + 16, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>
            WELCOME BACK
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Sign in to continue your quest
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              EMAIL
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.foreground,
                  fontFamily: FONTS.pixel,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              PASSWORD
            </Text>
            <View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.foreground,
                    fontFamily: FONTS.pixel,
                    paddingRight: 48,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <Pressable
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={18}
                  color={colors.mutedForeground}
                />
              </Pressable>
            </View>
          </View>

          {error && (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {error}
            </Text>
          )}

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              {
                backgroundColor:
                  !email || !password || isLoading || !signIn ? colors.muted : colors.primary,
                opacity: pressed ? 0.85 : 1,
                shadowColor: colors.primary,
              },
            ]}
            onPress={handleEmailSignIn}
            disabled={!email || !password || isLoading || !signIn}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
                SIGN IN
              </Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.googleBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleGoogleSignIn}
          >
            <Feather name="globe" size={18} color={colors.foreground} />
            <Text style={[styles.googleBtnText, { color: colors.foreground }]}>
              Continue with Google
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            No account yet?{" "}
          </Text>
          <Link href="/sign-up">
            <Text style={[styles.link, { color: colors.primary }]}>Sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 20,
  },
  header: { marginBottom: 28, gap: 8 },
  title: {
    fontSize: 18,
    fontFamily: FONTS.title,
    letterSpacing: 2,
    textShadowColor: "rgba(232,160,69,0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: { fontSize: 18, fontFamily: FONTS.pixel },
  form: { gap: 16 },
  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: FONTS.pixel, letterSpacing: 1 },
  input: {
    borderWidth: 2,
    borderRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 18,
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  errorText: { fontSize: 16, fontFamily: FONTS.pixel },
  primaryBtn: {
    borderRadius: 2,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  primaryBtnText: { fontSize: 14, fontFamily: FONTS.title, letterSpacing: 2 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 17, fontFamily: FONTS.pixel },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderRadius: 2,
    paddingVertical: 14,
  },
  googleBtnText: { fontSize: 18, fontFamily: FONTS.pixel },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText: { fontSize: 17, fontFamily: FONTS.pixel },
  link: { fontSize: 17, fontFamily: FONTS.pixel },
});
