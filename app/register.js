import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
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

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const heroAnim = useRef(new Animated.Value(0.8)).current;

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
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!form.firstname.trim() || !form.lastname.trim() || !form.email.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      await register(form);

      Alert.alert(
        "🎉 Account Created Successfully!",
        "Your account has been created. Please check your email to verify your account before logging in.",
        [
          {
            text: "Go to Login",
            onPress: () => router.push("/login"),
          },
        ]
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      Alert.alert("Error", msg);
    }
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const fields = [
    {
      key: "firstname",
      label: "First Name",
      placeholder: "Enter your first name",
      icon: "person-outline",
      keyboardType: "default",
      autoCapitalize: "words",
      secure: false,
    },
    {
      key: "lastname",
      label: "Last Name",
      placeholder: "Enter your last name",
      icon: "person-outline",
      keyboardType: "default",
      autoCapitalize: "words",
      secure: false,
    },
    {
      key: "email",
      label: "Email Address",
      placeholder: "Enter your email address",
      icon: "mail-outline",
      keyboardType: "email-address",
      autoCapitalize: "none",
      secure: false,
    },
    {
      key: "password",
      label: "Password",
      placeholder: "Create a password",
      icon: "lock-closed-outline",
      keyboardType: "default",
      autoCapitalize: "none",
      secure: true,
    },
    {
      key: "confirmPassword",
      label: "Confirm Password",
      placeholder: "Re-enter your password",
      icon: "lock-closed-outline",
      keyboardType: "default",
      autoCapitalize: "none",
      secure: true,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HERO IMAGE */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: heroAnim }],
          }}
        >
          <Image
            source={require("../assets/images/woman illustrating signupo.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* HEADER */}
        <Animated.View
          style={[
            styles.headerContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Join Ready9ja and start shopping smarter
          </Text>
        </Animated.View>

        {/* FORM FIELDS */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            width: "100%",
          }}
        >
          {fields.map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name={field.icon}
                  size={20}
                  color="#7C3AED"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={field.placeholder}
                  placeholderTextColor="#A78BFA"
                  secureTextEntry={field.secure}
                  keyboardType={field.keyboardType}
                  autoCapitalize={field.autoCapitalize}
                  value={form[field.key]}
                  onChangeText={(v) =>
                    setForm((prev) => ({ ...prev, [field.key]: v }))
                  }
                  style={styles.input}
                />
              </View>
            </View>
          ))}

          {/* REGISTER BUTTON */}
          <Pressable
            style={[styles.registerButton, loading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </Pressable>

          {/* LOGIN LINK */}
          <Pressable
            style={{ marginTop: 20, alignItems: "center" }}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text style={styles.loginHighlight}>Sign In</Text>
            </Text>
          </Pressable>

          {/* GO HOME BUTTON */}
          <TouchableOpacity style={styles.homeBtn} onPress={handleGoHome}>
            <Ionicons name="home-outline" size={20} color="#7C3AED" />
            <Text style={styles.homeBtnText}>Go to Home</Text>
          </TouchableOpacity>

          {/* SECURITY / BENEFITS LIST */}
          <View style={styles.securityContainer}>
            <View style={styles.securityRow}>
              <Ionicons name="shield-checkmark" size={18} color="#10B981" />
              <Text style={styles.securityText}>
                Your data is securely encrypted
              </Text>
            </View>
            <View style={styles.securityRow}>
              <Ionicons name="mail-outline" size={18} color="#7C3AED" />
              <Text style={styles.securityText}>
                Email verification keeps your account safe
              </Text>
            </View>
            <View style={styles.securityRow}>
              <Ionicons name="cart-outline" size={18} color="#F59E0B" />
              <Text style={styles.securityText}>
                Access thousands of products instantly
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
    justifyContent: "flex-start",
  },

  heroImage: {
    width: "100%",
    height: height * 0.3,
    alignSelf: "center",
  },

  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#7C3AED",
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 6,
    textAlign: "center",
  },

  inputGroup: {
    marginBottom: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 6,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E9D5FF",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 10,
    minHeight: 52,
  },

  inputIcon: {
    marginRight: 6,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },

  registerButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  loginText: {
    color: "#6B7280",
    fontSize: 15,
  },

  loginHighlight: {
    color: "#F59E0B",
    fontWeight: "700",
  },

  homeBtn: {
    marginTop: 30,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },

  homeBtnText: {
    color: "#7C3AED",
    fontWeight: "700",
    fontSize: 14,
  },

  securityContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 18,
    gap: 10,
  },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  securityText: {
    fontSize: 13,
    color: "#4B5563",
    flex: 1,
  },
});
