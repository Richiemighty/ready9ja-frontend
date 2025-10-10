'use client';
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, Pressable } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  const router = useRouter();
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rocketAnim = useRef(new Animated.Value(0)).current;
  const bgPulse = useRef(new Animated.Value(0)).current;
  const buttonScale1 = useRef(new Animated.Value(1)).current;
  const buttonScale2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start landing animations
    Animated.parallel([
      // Background pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(bgPulse, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(bgPulse, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ),
      
      // Main content animations
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      
      // Rocket animation
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(rocketAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handlePressIn = (buttonScale: Animated.Value) => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (buttonScale: Animated.Value) => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // Direct navigation handlers for mobile
  const handleLoginPress = () => {
    router.push('/login');
  };

  const handleRegisterPress = () => {
    router.push('/register');
  };

  const rocketTranslateY = rocketAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, -20],
  });

  const rocketScale = rocketAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.2, 1],
  });

  const backgroundColor = bgPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(106, 13, 173, 0.03)', 'rgba(106, 13, 173, 0.08)'],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* Animated Background Elements */}
      <Animated.View style={[styles.floatingOrb, styles.orb1]} />
      <Animated.View style={[styles.floatingOrb, styles.orb2]} />
      <Animated.View style={[styles.floatingOrb, styles.orb3]} />
      <Animated.View style={[styles.floatingOrb, styles.orb4]} />
      
      {/* Rocket Icon with Animation */}
      <Animated.View 
        style={[
          styles.rocketContainer,
          {
            transform: [
              { translateY: rocketTranslateY },
              { scale: rocketScale }
            ],
            opacity: rocketAnim
          }
        ]}
      >
        <Text style={styles.rocket}>🚀</Text>
        <Animated.View style={[styles.rocketFlame, { opacity: bgPulse }]} />
      </Animated.View>

      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideUpAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <ThemedText type="title" style={styles.title}>
          Welcome to{' '}
          <Text style={styles.brandName}>Ready9ja</Text>
        </ThemedText>

        <ThemedText type="default" style={styles.subtitle}>
          Your gateway to seamless experiences in Nigeria
        </ThemedText>

        <View style={styles.buttonContainer}>
          {/* Use Pressable for better mobile support */}
          <Pressable
            onPress={handleLoginPress}
            style={({ pressed }) => [
              styles.button,
              styles.loginButton,
              pressed && styles.buttonPressed
            ]}
          >
            <Animated.View 
              style={[
                styles.buttonInner,
                { transform: [{ scale: buttonScale1 }] }
              ]}
            >
              <Text style={styles.buttonText}>Login</Text>
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={handleRegisterPress}
            style={({ pressed }) => [
              styles.button,
              styles.registerButton,
              pressed && styles.buttonPressed
            ]}
          >
            <Animated.View 
              style={[
                styles.buttonInner,
                { transform: [{ scale: buttonScale2 }] }
              ]}
            >
              <Text style={[styles.buttonText, styles.registerButtonText]}>Register</Text>
            </Animated.View>
          </Pressable>
        </View>

        <Animated.View style={[styles.featureGrid, { opacity: fadeAnim }]}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>Fast</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>Secure</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌟</Text>
            <Text style={styles.featureText}>Reliable</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(124, 58, 237, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  brandName: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#6B7280',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  button: {
    borderRadius: 16,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonInner: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  loginButton: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButtonText: {
    color: '#F59E0B',
  },
  rocketContainer: {
    position: 'absolute',
    top: height * 0.15,
    alignItems: 'center',
    zIndex: 5,
  },
  rocket: {
    fontSize: 48,
    textShadowColor: 'rgba(124, 58, 237, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  rocketFlame: {
    width: 20,
    height: 30,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    marginTop: -10,
    opacity: 0.7,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 20,
  },
  featureItem: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 500,
    opacity: 0.4,
  },
  orb1: {
    width: 120,
    height: 120,
    backgroundColor: '#7C3AED',
    top: '10%',
    left: '5%',
  },
  orb2: {
    width: 80,
    height: 80,
    backgroundColor: '#F59E0B',
    top: '15%',
    right: '10%',
  },
  orb3: {
    width: 60,
    height: 60,
    backgroundColor: '#7C3AED',
    bottom: '20%',
    left: '15%',
    opacity: 0.3,
  },
  orb4: {
    width: 100,
    height: 100,
    backgroundColor: '#F59E0B',
    bottom: '15%',
    right: '5%',
    opacity: 0.2,
  },
});