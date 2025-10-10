import { Stack } from "expo-router";
import { CartProvider } from "../../contexts/CartContext";

export default function BuyerLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* This tells Expo Router to load everything inside (tabs) first */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Other non-tab routes (product, seller, chat) will appear here automatically */}
      </Stack>
    </CartProvider>
  );
}
