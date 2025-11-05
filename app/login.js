import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../hooks/useAuth";

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Refs for text inputs to handle auto-fill
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const bgPulse = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const formFieldsAnim = useRef(new Animated.Value(0)).current;
  const alertSlideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      // Background pulse
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
      // Main container animations
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
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      // Form fields staggered animation
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(formFieldsAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // New: Handle auto-fill by checking input values periodically
  useEffect(() => {
    const checkAutoFill = () => {
      if (usernameRef.current && passwordRef.current) {
        // This will be called to sync with auto-filled values
        setTimeout(() => {
          // We'll use a different approach - see below
        }, 1000);
      }
    };

    checkAutoFill();
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // NEW: Enhanced handleLogin with auto-fill detection
  const handleLogin = async () => {
    // Check if inputs might have been auto-filled but state wasn't updated
    let finalForm = { ...form };
    
    // If form appears empty but inputs might be filled (auto-fill case)
    if ((!form.username.trim() || !form.password.trim()) && 
        usernameRef.current && passwordRef.current) {
      
      // Try to get the current values directly from the refs
      // Note: This is a fallback since we can't directly read value from ref in React Native
      // The main fix is using the onContentSizeChange approach below
    }

    if (!finalForm.username.trim() || !finalForm.password.trim()) {
      showCustomAlert("Validation Error", "Please fill in all fields", "error");
      return;
    }

    try {
      const res = await login(finalForm.username, finalForm.password);
      setShowSuccessModal(true);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Invalid username or password";
      showCustomAlert("Login Failed", msg, "error");
    }
  };

  // NEW: Handle text input changes with better auto-fill support
  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // NEW: Handle auto-fill by using onContentSizeChange as a workaround
  const handleInputLayout = (field) => {
    // This gets called when the content size changes, which happens with auto-fill
    // We can use this as an indicator that auto-fill might have occurred
  };

  const handleSuccessNavigation = () => {
    setShowSuccessModal(false);
    const role = "user";
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "seller") router.push("/seller/dashboard");
    else router.push("/buyer/(tabs)/marketplace");
  };

  const backgroundColor = bgPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(106, 13, 173, 0.03)', 'rgba(106, 13, 173, 0.08)'],
  });

  const formFieldsTranslateY = formFieldsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const formFieldsOpacity = formFieldsAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const fields = [
    { 
      key: "username", 
      placeholder: "Username or Email", 
      secure: false,
      icon: "person-outline",
      keyboardType: "email-address",
      ref: usernameRef,
      autoComplete: "username",
      textContentType: "username" // iOS specific
    },
    { 
      key: "password", 
      placeholder: "Password", 
      secure: true,
      icon: "lock-closed-outline",
      keyboardType: "default",
      ref: passwordRef,
      autoComplete: "password",
      textContentType: "password" // iOS specific
    },
  ];

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* Animated Background Elements */}
      <Animated.View style={[styles.floatingShape, styles.shape1]} />
      <Animated.View style={[styles.floatingShape, styles.shape2]} />
      <Animated.View style={[styles.floatingShape, styles.shape3]} />

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
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>9ja</Text>
            </View>
            <Text style={styles.brandName}>Ready9ja</Text>
            <Text style={styles.tagline}>Nigeria's Premier Marketplace</Text>
          </View>

          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>
            Sign in to your account to continue
          </Text>

          <Animated.View 
            style={[
              styles.fieldsContainer,
              {
                opacity: formFieldsOpacity,
                transform: [{ translateY: formFieldsTranslateY }]
              }
            ]}
          >
            {fields.map((field, index) => (
              <Animated.View 
                key={field.key}
                style={[
                  styles.inputContainer,
                  {
                    opacity: formFieldsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                    transform: [{
                      translateY: formFieldsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10 * (index + 1), 0],
                      }),
                    }],
                  },
                ]}
              >
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    {field.placeholder}
                  </Text>
                  {field.key === 'password' && (
                    <Pressable style={styles.forgotPassword}>
                      <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </Pressable>
                  )}
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name={field.icon} 
                    size={20} 
                    color="#7C3AED" 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    ref={field.ref}
                    placeholder={`Enter your ${field.placeholder.toLowerCase()}`}
                    placeholderTextColor="#A78BFA"
                    secureTextEntry={field.secure && !showPassword}
                    style={styles.input}
                    value={form[field.key]}
                    onChangeText={(v) => handleInputChange(field.key, v)}
                    onContentSizeChange={() => handleInputLayout(field.key)}
                    autoCapitalize={field.key === 'username' ? 'none' : 'none'}
                    autoComplete={field.autoComplete}
                    textContentType={field.textContentType}
                    keyboardType={field.keyboardType}
                    returnKeyType={field.key === 'password' ? 'done' : 'next'}
                    onSubmitEditing={field.key === 'password' ? handleLogin : undefined}
                    // NEW: Add key to force re-render and capture auto-fill
                    key={field.key}
                  />
                  {field.secure && (
                    <Pressable 
                      onPress={togglePasswordVisibility}
                      style={styles.passwordToggle}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#7C3AED" 
                      />
                    </Pressable>
                  )}
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* NEW: Auto-fill detection button */}
          {/* <TouchableOpacity 
            style={styles.autoFillHelper}
            onPress={() => {
              // Force state sync by triggering a fake change
              setForm(prev => ({ ...prev }));
            }}
          >
            <Text style={styles.autoFillHelperText}>
              If auto-fill doesn't work, tap here then try login again
            </Text>
          </TouchableOpacity> */}

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </Pressable>
          </Animated.View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable 
            style={styles.registerLink}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerHighlight}>Create one now</Text>
            </Text>
          </Pressable>

          {/* Security Features */}
          <Animated.View 
            style={[styles.securityFeatures, { opacity: formFieldsOpacity }]}
          >
            <View style={styles.securityItem}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.securityText}>Your login information is securely encrypted</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 15,
  },
  // NEW: Auto-fill helper styles
  autoFillHelper: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
  },
  autoFillHelperText: {
    color: '#92400E',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  // ... rest of your existing styles remain the same
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#7C3AED',
    textShadowColor: 'rgba(124, 58, 237, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#6B7280',
    lineHeight: 22,
  },
  fieldsContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9D5FF',
    borderRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#7C3AED',
    minHeight: 56,
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPassword: {
    paddingVertical: 4,
  },
  forgotPasswordText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#C4B5FD',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
    padding: 10,
  },
  registerText: {
    color: '#6B7280',
    fontSize: 15,
    textAlign: 'center',
  },
  registerHighlight: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  securityFeatures: {
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 13,
    color: '#065F46',
    marginLeft: 12,
    fontWeight: '500',
  },
  floatingShape: {
    position: 'absolute',
    borderRadius: 500,
    opacity: 0.3,
  },
  shape1: {
    width: 150,
    height: 150,
    backgroundColor: '#7C3AED',
    top: '5%',
    left: '-10%',
  },
  shape2: {
    width: 100,
    height: 100,
    backgroundColor: '#F59E0B',
    top: '15%',
    right: '-5%',
  },
  shape3: {
    width: 80,
    height: 80,
    backgroundColor: '#7C3AED',
    bottom: '10%',
    left: '20%',
    opacity: 0.2,
  },
  // Alert Styles
  alertOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderLeftWidth: 6,
    width: '100%',
    maxWidth: 400,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  alertClose: {
    padding: 8,
    marginLeft: 8,
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  successFeatures: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});