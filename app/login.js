import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Animated,
  Easing,
  Dimensions 
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

const { width, height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const buttonScale = useState(new Animated.Value(1))[0];
  const bgAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Start animations when component mounts
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

      // Role-based redirection
      const role = res?.role;
      if (role === "admin") router.push("/admin/dashboard");
      else if (role === "seller") router.push("/seller/dashboard");
      else router.push("/buyer/dashboard"); // default user

      Alert.alert("Success", "Logged in successfully");
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Invalid username or password";
      Alert.alert("Error", msg);
    }
  };

  const backgroundColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(106, 13, 173, 0.1)', 'rgba(106, 13, 173, 0.05)']
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* Animated Background Elements */}
      <Animated.View style={[styles.circle, styles.circle1]} />
      <Animated.View style={[styles.circle, styles.circle2]} />
      <Animated.View style={[styles.circle, styles.circle3]} />
      
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
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            placeholder="Enter your username"
            placeholderTextColor="#A78BFA"
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, username: v })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#A78BFA"
            secureTextEntry
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, password: v })}
          />
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity 
          onPress={() => router.push("/register")}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerHighlight}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
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
    marginBottom: 30,
    color: '#6B7280',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#7C3AED',
  },
  input: {
    borderWidth: 2,
    borderColor: '#E9D5FF',
    borderRadius: 12,
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
    shadowRadius: 3,
    elevation: 3,
  },
  loginButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#C4B5FD',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  registerHighlight: {
    color: '#F59E0B',
    fontWeight: 'bold',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.3,
  },
  circle1: {
    width: 200,
    height: 200,
    backgroundColor: '#7C3AED',
    top: -50,
    left: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    backgroundColor: '#F59E0B',
    bottom: -30,
    right: -30,
  },
  circle3: {
    width: 100,
    height: 100,
    backgroundColor: '#F59E0B',
    top: '30%',
    right: '20%',
    opacity: 0.2,
  },
});