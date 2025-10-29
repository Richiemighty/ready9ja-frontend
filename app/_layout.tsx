import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from '../contexts/CartContext';


export default function Layout() {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="register" />
          <Stack.Screen name="buyer/(tabs)/marketplace" />
          <Stack.Screen name="seller/dashboard" />
          <Stack.Screen name="admin/dashboard" />
          <Stack.Screen name="verify-email" />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}