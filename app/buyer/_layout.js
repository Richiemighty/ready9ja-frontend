// app/buyer/_layout.js
import { Stack } from "expo-router";

export default function BuyerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Load the tab navigation inside buyer/(tabs)/_layout.js */}
      <Stack.Screen name="(tabs)" />

      {/* Other buyer pages OUTSIDE tabs */}
      <Stack.Screen name="become-seller" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="wishlist" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="seller/[id]" />
      {/* <Stack.Screen name="settings" /> */}
      <Stack.Screen name="promotions" />
      {/* <Stack.Screen name="contact" /> */}
    </Stack>
  );
}
