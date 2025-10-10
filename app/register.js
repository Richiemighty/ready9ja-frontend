import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Animated, 
  Easing,
  ScrollView,
  Dimensions,
  Pressable
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

const { width, height } = Dimensions.get('window');

export default function Register() {
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const bgPulse = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const formFieldsAnim = useRef(new Animated.Value(0)).current;

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

  const handleRegister = async () => {
    // Validation
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    if (form.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      const res = await register(form);
      Alert.alert("Success", res?.message || "User registered successfully");
      router.push("/");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      Alert.alert("Error", msg);
    }
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
    { key: "firstname", placeholder: "First Name", secure: false },
    { key: "lastname", placeholder: "Last Name", secure: false },
    { key: "email", placeholder: "Email Address", secure: false },
    { key: "password", placeholder: "Password", secure: true },
    { key: "confirmPassword", placeholder: "Confirm Password", secure: true },
  ];

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* Animated Background Elements */}
      <Animated.View style={[styles.floatingShape, styles.shape1]} />
      <Animated.View style={[styles.floatingShape, styles.shape2]} />
      <Animated.View style={[styles.floatingShape, styles.shape3]} />
      
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
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Join Ready9ja and start your journey
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
                <Text style={styles.label}>
                  {field.placeholder}
                  {field.key.includes('password') && ' *'}
                </Text>
                <TextInput
                  placeholder={`Enter your ${field.placeholder.toLowerCase()}`}
                  placeholderTextColor="#A78BFA"
                  secureTextEntry={field.secure}
                  style={styles.input}
                  onChangeText={(v) => setForm({ ...form, [field.key]: v })}
                  autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                />
              </Animated.View>
            ))}
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? "Creating Account..." : "Create Account"}
              </Text>
            </Pressable>
          </Animated.View>

          <Pressable 
            style={styles.loginLink}
            onPress={() => router.push("/")}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
            </Text>
          </Pressable>

          {/* Security Features */}
          <Animated.View 
            style={[styles.securityFeatures, { opacity: formFieldsOpacity }]}
          >
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🔒</Text>
              <Text style={styles.securityText}>Your data is securely encrypted</Text>
            </View>
            <View style={styles.securityItem}>
              <Text style={styles.securityIcon}>🌟</Text>
              <Text style={styles.securityText}>Join thousands of happy users</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#7C3AED',
    textTransform: 'capitalize',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E9D5FF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButton: {
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
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 25,
    alignItems: 'center',
    padding: 10,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 15,
  },
  loginHighlight: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  securityFeatures: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  securityText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
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
});