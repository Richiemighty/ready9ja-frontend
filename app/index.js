import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

'use client';

const { width, height } = Dimensions.get("window");

export default function IndexScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.elastic(1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = () => router.push("/login");
  const handleRegister = () => router.push("/register");

  const animatedLogoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View style={styles.container}>
      {/* HERO IMAGE */}
      <Animated.Image
        source={require("../assets/images/ChatGPT Image Nov 23, 2025, 11_05_00 AM.png")}
        style={[
          styles.heroImage,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="cover"
      />

      {/* OVERLAY CONTENT */}
      <Animated.View
        style={[
          styles.overlayContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* LOGO */}
        <Animated.Image
          source={require("../assets/images/ready9ja logo in white bg.png")}
          style={[
            styles.logo,
            { transform: [{ scale: animatedLogoScale }] },
          ]}
          resizeMode="contain"
        />

        <Text style={styles.title}>Ready9ja</Text>
        <Text style={styles.subtitle}>
          Shop everything you love — fast delivery across Nigeria 🚀
        </Text>

        {/* CTA BUTTONS */}
        <View style={styles.buttonContainer}>
          <Pressable style={styles.primaryBtn} onPress={handleRegister}>
            <Text style={styles.primaryText}>Create Account</Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={handleLogin}>
            <Text style={styles.secondaryText}>Login</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

//
// STYLES
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  heroImage: {
    position: "absolute",
    width: width,
    height: height * 0.65,
    top: 0,
  },

  overlayContent: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },

  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#7C3AED",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },

  buttonContainer: {
    width: "100%",
    gap: 14,
  },

  primaryBtn: {
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  secondaryBtn: {
    borderWidth: 2,
    borderColor: "#7C3AED",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryText: {
    color: "#7C3AED",
    fontSize: 18,
    fontWeight: "700",
  },
});
