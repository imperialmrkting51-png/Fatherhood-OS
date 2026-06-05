import { useSignUp, useOAuth, useClerk } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

export default function SignUp() {
  useWarmUpBrowser();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Holds the full SignUpResource returned from create(), which has
  // prepareEmailAddressVerification and attemptEmailAddressVerification.
  // Typed as unknown because SignUpFutureResource (the signal type) is a
  // narrower type before create() is called.
  const signUpResourceRef = useRef<unknown>(null);

  function clerkMsg(err: unknown, fallback: string): string {
    const clerkErr = err as { errors?: Array<{ message: string }> };
    return (
      clerkErr?.errors?.[0]?.message ??
      (err instanceof Error ? err.message : fallback)
    );
  }

  type SignUpResource = {
    prepareEmailAddressVerification: (p: { strategy: string }) => Promise<unknown>;
    attemptEmailAddressVerification: (p: { code: string }) => Promise<{ status: string; createdSessionId: string }>;
    status: string | null;
    createdSessionId: string | null;
  };

  const handleSubmit = async () => {
    if (!email || !password || isLoading || !signUp) return;
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoading(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email, password });
      // After create(), the signUp signal is now a full resource at runtime;
      // cast through unknown to access verification methods.
      const resource = signUp as unknown as SignUpResource;
      signUpResourceRef.current = resource;
      await resource.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      setError(clerkMsg(err, "Sign up failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || isLoading) return;
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoading(true);
    setError(null);
    try {
      const resource = signUpResourceRef.current as SignUpResource;
      const result = await resource.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        setError("Verification could not be completed. Please try again.");
      }
    } catch (err: unknown) {
      setError(clerkMsg(err, "Verification failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    const resource = signUpResourceRef.current as SignUpResource | null;
    if (!resource) return;
    try {
      await resource.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch {
      // Non-critical — resend attempt failed silently
    }
  };

  const handleGoogleSignUp = useCallback(async () => {
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
    } catch {
      // OAuth flow cancelled or failed silently — user stays on sign-up screen
    }
  }, [startOAuthFlow, router]);

  const topPad = Platform.OS === "web" ? 24 : insets.top;

  if (step === "verify") {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.container,
            { paddingTop: topPad + 16, paddingBottom: insets.bottom + 40 },
          ]}
        >
          <View style={styles.verifyContent}>
            <Text style={[styles.title, { color: colors.primary }]}>
              CHECK YOUR EMAIL
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              We sent a verification code to {email}
            </Text>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                VERIFICATION CODE
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.primary,
                    color: colors.foreground,
                    fontFamily: FONTS.pixel,
                    textAlign: "center",
                    letterSpacing: 8,
                    fontSize: 22,
                  },
                ]}
                value={code}
                onChangeText={setCode}
                placeholder="000000"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
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
                  backgroundColor: !code || isLoading ? colors.muted : colors.primary,
                  opacity: pressed ? 0.85 : 1,
                  shadowColor: colors.primary,
                },
              ]}
              onPress={handleVerify}
              disabled={!code || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
                  VERIFY
                </Text>
              )}
            </Pressable>

            <Pressable onPress={handleResend}>
              <Text style={[styles.resendText, { color: colors.accent }]}>
                Resend code
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

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
            JOIN THE QUEST
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Create your account to begin
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
                autoComplete="new-password"
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
                  !email || !password || isLoading ? colors.muted : colors.primary,
                opacity: pressed ? 0.85 : 1,
                shadowColor: colors.primary,
              },
            ]}
            onPress={handleSubmit}
            disabled={!email || !password || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>
                CREATE ACCOUNT
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
            onPress={handleGoogleSignUp}
          >
            <Feather name="globe" size={18} color={colors.foreground} />
            <Text style={[styles.googleBtnText, { color: colors.foreground }]}>
              Continue with Google
            </Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
          </Text>
          <Link href="/sign-in">
            <Text style={[styles.link, { color: colors.primary }]}>Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  verifyContent: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 20,
    justifyContent: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 20,
  },
  header: { marginBottom: 28, gap: 8 },
  title: {
    fontSize: 16,
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
  primaryBtnText: { fontSize: 13, fontFamily: FONTS.title, letterSpacing: 2 },
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
  resendText: { fontSize: 17, fontFamily: FONTS.pixel, textAlign: "center" },
});
