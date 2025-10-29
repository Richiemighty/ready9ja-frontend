import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../hooks/useAuth";

const { width, height } = Dimensions.get("window");

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  const bgAnim = useState(new Animated.Value(0))[0];
  const alertSlideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const showCustomAlert = (title, message, type = "error") => {
    setAlertConfig({
      title,
      message,
      type,
      icon: type === "success" ? "checkmark-circle" : 
            type === "error" ? "close-circle" : 
            type === "warning" ? "warning" : "information"
    });
    setShowAlert(true);
    
    Animated.timing(alertSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hideAlert();
    }, 4000);
  };

  const hideAlert = () => {
    Animated.timing(alertSlideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAlert(false);
    });
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    try {
      const res = await login(form.username, form.password);

      // Show success modal instead of immediate navigation
      setShowSuccessModal(true);
      
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Invalid username or password";
      showCustomAlert("Login Failed", msg, "error");
    }
  };

  const handleSuccessNavigation = () => {
    setShowSuccessModal(false);
    const role = "user"; // You can get this from your auth context
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "seller") router.push("/seller/dashboard");
    else router.push("/buyer/(tabs)/marketplace");
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(106, 13, 173, 0.1)", "rgba(106, 13, 173, 0.05)"],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Animated.View style={[styles.container, { backgroundColor }]}>
        {/* Custom Alert */}
        <Modal
          visible={showAlert}
          transparent={true}
          animationType="none"
        >
          <View style={styles.alertOverlay}>
            <Animated.View 
              style={[
                styles.alertContainer,
                { 
                  transform: [{ translateY: alertSlideAnim }],
                  borderLeftColor: alertConfig.type === "success" ? "#10B981" : 
                                 alertConfig.type === "error" ? "#DC2626" : 
                                 alertConfig.type === "warning" ? "#F59E0B" : "#7C3AED"
                }
              ]}
            >
              <View style={[
                styles.alertIcon,
                { backgroundColor: alertConfig.type === "success" ? "#10B981" : 
                                alertConfig.type === "error" ? "#DC2626" : 
                                alertConfig.type === "warning" ? "#F59E0B" : "#7C3AED" }
              ]}>
                <Ionicons 
                  name={alertConfig.icon} 
                  size={24} 
                  color="#fff" 
                />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alertConfig.title}</Text>
                <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              </View>
              <TouchableOpacity onPress={hideAlert} style={styles.alertClose}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
              </View>
              
              <Text style={styles.successTitle}>Welcome Back! 🎉</Text>
              
              <Text style={styles.successMessage}>
                You have successfully signed in to your Ready9ja account.
              </Text>

              <View style={styles.successFeatures}>
                <View style={styles.featureItem}>
                  <Ionicons name="cart-outline" size={20} color="#7C3AED" />
                  <Text style={styles.featureText}>Shop thousands of products</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="shield-checkmark" size={20} color="#7C3AED" />
                  <Text style={styles.featureText}>Secure shopping experience</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="rocket-outline" size={20} color="#7C3AED" />
                  <Text style={styles.featureText}>Fast delivery nationwide</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleSuccessNavigation}
              >
                <Text style={styles.continueButtonText}>Continue Shopping</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Animated Background Elements */}
        <Animated.View style={[styles.circle, styles.circle1]} />
        <Animated.View style={[styles.circle, styles.circle2]} />
        <Animated.View style={[styles.circle, styles.circle3]} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>9ja</Text>
              </View>
              <Text style={styles.brandName}>Ready9ja</Text>
            </View>

            <Text style={styles.title}>Welcome Back 👋</Text>
            <Text style={styles.subtitle}>Sign in to your account to continue</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username or Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#7C3AED" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your username or email"
                  placeholderTextColor="#A78BFA"
                  style={styles.input}
                  onChangeText={(v) => setForm({ ...form, username: v })}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#7C3AED" style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#A78BFA"
                  secureTextEntry
                  style={styles.input}
                  onChangeText={(v) => setForm({ ...form, password: v })}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="refresh" size={20} color="#fff" style={styles.loadingIcon} />
                    <Text style={styles.loginButtonText}>Signing In...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={() => router.push("/register")}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                Don't have an account?{" "}
                <Text style={styles.registerHighlight}>Create one now</Text>
              </Text>
            </TouchableOpacity>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.securityText}>Your login information is securely encrypted</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  formContainer: {
    width: "90%", // Increased to 90% of screen width
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 30,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  brandName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#7C3AED",
    textShadowColor: "rgba(124, 58, 237, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#6B7280",
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#7C3AED",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E9D5FF",
    borderRadius: 16,
    backgroundColor: "white",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: "80%",
  },
  inputIcon: {
    padding: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#7C3AED",
    paddingLeft: 0,
    width: "80%",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
  },
  loginButtonDisabled: {
    backgroundColor: "#C4B5FD",
    shadowOpacity: 0.1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  registerLink: {
    alignItems: "center",
    padding: 12,
  },
  registerText: {
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
  },
  registerHighlight: {
    color: "#F59E0B",
    fontWeight: "bold",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    padding: 12,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    gap: 8,
  },
  securityText: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "500",
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
    opacity: 0.3,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: "#7C3AED",
    top: -50,
    left: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: "#F59E0B",
    bottom: -30,
    right: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: "#F59E0B",
    top: "30%",
    right: "20%",
    opacity: 0.2,
  },
  // Alert Styles
  alertOverlay: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderLeftWidth: 6,
    width: '90%',
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
  },
  alertClose: {
    padding: 8,
    marginLeft: 8,
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 30,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#10B981",
    textAlign: "center",
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  successFeatures: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
    flex: 1,
  },
  continueButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});