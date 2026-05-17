import { useSignUp, useOAuth } from "@clerk/expo";
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

  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clerkMsg(err: unknown, fallback: string): string {
    const clerkErr = err as { errors?: Array<{ message: string }> };
    return (
      clerkErr?.errors?.[0]?.message ??
      (err instanceof Error ? err.message : fallback)
    );
  }

  const handleSubmit = async () => {
    if (!email || !password || isLoading || !isLoaded || !signUp) return;
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoading(true);
    setError(null);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: unknown) {
      setError(clerkMsg(err, "Sign up failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || isLoading || !isLoaded || !signUp) return;
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
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
    if (!signUp) return;
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  }, [startOAuthFlow, router]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (step === "verify") {
    return (
      <View style={[styles.flex, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.container,
            { paddingTop: topPad + 24, paddingBottom: insets.bottom + 40 },
          ]}
        >
          <Pressable
            style={[styles.backBtn]}
            onPress={() => { setStep("form"); setError(null); }}
          >
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>

          <View style={[styles.header, { alignItems: "flex-start" }]}>
            <View
              style={[
                styles.verifyIcon,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Feather name="mail" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>
              Check your email
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.mutedForeground }]}
            >
              We sent a code to {email}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                Verification code
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.codeInput,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.foreground,
                  },
                ]}
                value={code}
                onChangeText={setCode}
                placeholder="000000"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
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
                  backgroundColor:
                    !code || isLoading ? colors.muted : colors.primary,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={handleVerify}
              disabled={!code || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text
                  style={[
                    styles.primaryBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Verify Email
                </Text>
              )}
            </Pressable>

            <Pressable style={styles.resendBtn} onPress={handleResend}>
              <Text style={[styles.resendText, { color: colors.accent }]}>
                Resend code
              </Text>
            </Pressable>
          </View>

          <View nativeID="clerk-captcha" />
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
          { paddingTop: topPad + 24, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          style={[styles.backBtn]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>
            Join Dad Mode
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Start your fatherhood journey
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              Email
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.border,
                  color: colors.foreground,
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
              Password
            </Text>
            <View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.foreground,
                    paddingRight: 48,
                  },
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 characters"
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
                  !email || !password || isLoading
                    ? colors.muted
                    : colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={!email || !password || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text
                style={[
                  styles.primaryBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                Create Account
              </Text>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
            <Text
              style={[styles.dividerText, { color: colors.mutedForeground }]}
            >
              or
            </Text>
            <View
              style={[styles.dividerLine, { backgroundColor: colors.border }]}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.googleBtn,
              {
                backgroundColor: colors.secondary,
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

          <View nativeID="clerk-captcha" />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
          </Text>
          <Link href="/sign-in">
            <Text style={[styles.link, { color: colors.accent }]}>Sign in</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    marginBottom: 16,
  },
  verifyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  header: {
    marginBottom: 32,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  codeInput: {
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  errorText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  primaryBtn: {
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
  },
  googleBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  resendBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  link: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
