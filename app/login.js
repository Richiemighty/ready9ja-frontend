import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  // Refs to help Keychain / autofill know what’s what
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const heroAnim = useRef(new Animated.Value(0.8)).current;
  const cardScale = useRef(new Animated.Value(0.9)).current;
  const bgPulse = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.spring(heroAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bgPulse, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(bgPulse, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ),
    ]).start();
  }, []);

  const backgroundColor = bgPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F3E8FF", "#EEF2FF"],
  });

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      alert("Please enter username/email and password");
      return;
    }
    try {
      await login(form.username, form.password);
      router.replace("/buyer/(tabs)/marketplace");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Check credentials.";
      alert(msg);
    }
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <Animated.View style={[styles.bgOverlay, { backgroundColor }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TOP HERO AREA */}
        <Animated.View
          style={[
            styles.heroContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: heroAnim }],
            },
          ]}
        >
          <View style={styles.heroImageWrapper}>
            <Image
              source={require("../assets/images/2266efe6-7565-4fe4-9dfc-ab65af5a2500.png")}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.heroTextWrapper}>
            <View style={styles.logoBadge}>
              <Ionicons name="bag-handle-outline" size={18} color="#7C3AED" />
              <Text style={styles.logoBadgeText}>Ready9ja</Text>
            </View>
            <Text style={styles.heroTitle}>Welcome Back 👋</Text>
            <Text style={styles.heroSubtitle}>
              Sign in to continue shopping{"\n"}fast & securely across Nigeria.
            </Text>
          </View>
        </Animated.View>

        {/* LOGIN CARD */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: cardScale }],
            },
          ]}
        >
          {/* EMAIL / USERNAME */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Username or Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#7C3AED"
                style={styles.inputIcon}
              />
              <TextInput
                ref={usernameRef}
                style={styles.input}
                placeholder="Enter your username or email"
                placeholderTextColor="#A78BFA"
                autoCapitalize="none"
                autoCorrect={false}
                value={form.username}
                onChangeText={(t) => handleInputChange("username", t)}
                // 🔐 Autofill hints
                autoComplete="email"
                textContentType={
                  Platform.OS === "ios" ? "username" : "emailAddress"
                }
                importantForAutofill="yes"
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (passwordRef.current) {
                    passwordRef.current.focus();
                  }
                }}
              />
            </View>
          </View>

          {/* PASSWORD */}
          <View style={styles.fieldBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Password</Text>
              <Pressable onPress={() => alert("Coming soon")}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#7C3AED"
                style={styles.inputIcon}
              />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#A78BFA"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={form.password}
                onChangeText={(t) => handleInputChange("password", t)}
                // 🔐 Autofill hints
                autoComplete="password"
                textContentType="password"
                importantForAutofill="yes"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#7C3AED"
                  style={{ paddingHorizontal: 10 }}
                />
              </Pressable>
            </View>
          </View>

          {/* REMEMBER / INFO ROW */}
          <View style={styles.infoRow}>
            <View style={styles.infoBullet}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#10B981"
              />
              <Text style={styles.infoText}>Securely encrypted login</Text>
            </View>
          </View>

          {/* LOGIN BUTTON */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
            >
              <Text style={styles.loginText}>
                {loading ? "Signing in..." : "Sign In"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </Animated.View>

          {/* DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* REGISTER LINK */}
          <Pressable
            style={{ marginTop: 4 }}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.registerText}>
              Don&apos;t have an account?{" "}
              <Text style={styles.registerLink}>Create one</Text>
            </Text>
          </Pressable>
        </Animated.View>

        {/* GO HOME BUTTON */}
        <TouchableOpacity style={styles.homeBtn} onPress={handleGoHome}>
          <Ionicons name="home-outline" size={18} color="#7C3AED" />
          <Text style={styles.homeBtnText}>Back to Landing Page</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bgOverlay: {
    position: "absolute",
    inset: 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: "flex-start",
  },

  // HERO
  heroContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  heroImageWrapper: {
    width: "100%",
    height: height * 0.32,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 12,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroTextWrapper: {
    width: "100%",
    alignItems: "flex-start",
  },
  logoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124,58,237,0.08)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  logoBadgeText: {
    fontSize: 12,
    color: "#7C3AED",
    fontWeight: "700",
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 20,
  },

  // CARD
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },

  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 6,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
  },

  forgotText: {
    color: "#7C3AED",
    fontWeight: "600",
    fontSize: 13,
  },

  infoRow: {
    marginTop: 4,
    marginBottom: 18,
  },
  infoBullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#065F46",
    fontWeight: "500",
  },

  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7C3AED",
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
  },

  registerText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },
  registerLink: {
    color: "#F59E0B",
    fontWeight: "700",
  },

  homeBtn: {
    marginTop: 24,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    gap: 8,
  },
  homeBtnText: {
    color: "#7C3AED",
    fontWeight: "700",
    fontSize: 13,
  },
});
