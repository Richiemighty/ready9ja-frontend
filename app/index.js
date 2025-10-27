'use client';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function IndexScreen() {
  const router = useRouter();
  
  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const truckAnim = useRef(new Animated.Value(0)).current;
  const bgPulse = useRef(new Animated.Value(0)).current;
  const buttonScale1 = useRef(new Animated.Value(1)).current;
  const buttonScale2 = useRef(new Animated.Value(1)).current;
  const cartBounce = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start landing animations
    Animated.parallel([
      // Background pulse animation
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
      
      // Floating animation for elements
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),

      // Cart bounce animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(cartBounce, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(1000),
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
      
      // Delivery truck animation
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(truckAnim, {
          toValue: 1,
          duration: 2000,
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

  const truckTranslateX = truckAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, width + 100],
  });

  const cartScale = cartBounce.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  const backgroundColor = bgPulse.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(124, 58, 237, 0.02)', 'rgba(124, 58, 237, 0.05)'],
  });

  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      {/* Animated Background Elements */}
      <Animated.View style={[styles.floatingOrb, styles.orb1, { transform: [{ translateY: floatTranslateY }] }]} />
      <Animated.View style={[styles.floatingOrb, styles.orb2, { transform: [{ translateY: floatTranslateY }] }]} />
      <Animated.View style={[styles.floatingOrb, styles.orb3, { transform: [{ translateY: floatTranslateY }] }]} />
      <Animated.View style={[styles.floatingOrb, styles.orb4, { transform: [{ translateY: floatTranslateY }] }]} />
      
      {/* Delivery Truck Animation */}
      <Animated.View 
        style={[
          styles.deliveryTruck,
          {
            transform: [
              { translateX: truckTranslateX }
            ],
          }
        ]}
      >
        <Text style={styles.truckIcon}>🚚</Text>
      </Animated.View>

      {/* Main Content */}
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
        {/* App Logo/Brand */}
        <View style={styles.brandContainer}>
          <Animated.View 
            style={[
              styles.logoContainer,
              { transform: [{ scale: cartScale }] }
            ]}
          >
            <Text style={styles.logoIcon}>🛒</Text>
          </Animated.View>
          <Text style={styles.brandName}>Ready9ja</Text>
          <Text style={styles.brandTagline}>Nigeria's Favorite Marketplace</Text>
        <ThemedText type="default" style={styles.welcomeSubtitle}>
          Shop the best deals on electronics, fashion, home goods, and more!{'\n'}
          Fast delivery across Nigeria 🇳🇬
        </ThemedText>

        </View>

        {/* Big Cartoon Shopping Image */}
        <Animated.View 
          style={[
            styles.cartoonContainer,
            { transform: [{ translateY: floatTranslateY }] }
          ]}
        >
          <View style={styles.cartoonImage}>
            <Text style={styles.cartoonIcon}>🛍️</Text>
            <View style={styles.shoppingElements}>
              <Text style={styles.shoppingItem}>📱</Text>
              <Text style={styles.shoppingItem}>👕</Text>
              <Text style={styles.shoppingItem}>🥘</Text>
              <Text style={styles.shoppingItem}>💻</Text>
            </View>
          </View>
        </Animated.View>



        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleRegisterPress}
            onPressIn={() => handlePressIn(buttonScale1)}
            onPressOut={() => handlePressOut(buttonScale1)}
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed
            ]}
          >
            <Animated.View 
              style={[
                styles.buttonInner,
                { transform: [{ scale: buttonScale1 }] }
              ]}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
              <Text style={styles.buttonSubtext}>Start shopping now!</Text>
            </Animated.View>
          </Pressable>

          <Pressable
            onPress={handleLoginPress}
            onPressIn={() => handlePressIn(buttonScale2)}
            onPressOut={() => handlePressOut(buttonScale2)}
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed
            ]}
          >
            <Animated.View 
              style={[
                styles.buttonInner,
                { transform: [{ scale: buttonScale2 }] }
              ]}
            >
              <Text style={styles.secondaryButtonText}>Login</Text>
              <Text style={styles.buttonSubtext}>Welcome back!</Text>
            </Animated.View>
          </Pressable>
        </View>

        {/* Quick Features */}
        {/* <Animated.View style={[styles.featuresGrid, { opacity: fadeAnim }]}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🚀</Text>
            </View>
            <Text style={styles.featureTitle}>Fast Delivery</Text>
            <Text style={styles.featureDesc}>2-4 hours in major cities</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>💳</Text>
            </View>
            <Text style={styles.featureTitle}>Secure Payment</Text>
            <Text style={styles.featureDesc}>Pay on delivery</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🔄</Text>
            </View>
            <Text style={styles.featureTitle}>Easy Returns</Text>
            <Text style={styles.featureDesc}>7-day return policy</Text>
          </View>
        </Animated.View> */}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 36,
  },
  brandName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#7C3AED',
    textAlign: 'center',
    textShadowColor: 'rgba(124, 58, 237, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  brandTagline: {
    fontSize: 16,
    color: '#F59E0B',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  cartoonContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  cartoonImage: {
    width: 200,
    height: 150,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cartoonIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  shoppingElements: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shoppingItem: {
    fontSize: 20,
    marginHorizontal: 4,
    transform: [{ rotate: '15deg' }],
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
    lineHeight: 40,
    color: '#1F2937',
  },
  highlightText: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 30,
  },
  button: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 6,
    overflow: 'hidden',
  },
  buttonInner: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 20,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  secondaryButtonText: {
    color: '#7C3AED',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  featureItem: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    flex: 1,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 2,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 12,
  },
  deliveryTruck: {
    position: 'absolute',
    top: '30%',
    zIndex: 5,
  },
  truckIcon: {
    fontSize: 32,
    transform: [{ scaleX: -1 }],
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: 500,
    opacity: 0.3,
  },
  orb1: {
    width: 150,
    height: 150,
    backgroundColor: '#7C3AED',
    top: '5%',
    left: '-10%',
  },
  orb2: {
    width: 100,
    height: 100,
    backgroundColor: '#F59E0B',
    top: '10%',
    right: '-5%',
  },
  orb3: {
    width: 80,
    height: 80,
    backgroundColor: '#7C3AED',
    bottom: '15%',
    left: '10%',
    opacity: 0.2,
  },
  orb4: {
    width: 120,
    height: 120,
    backgroundColor: '#F59E0B',
    bottom: '10%',
    right: '-8%',
    opacity: 0.15,
  },
});