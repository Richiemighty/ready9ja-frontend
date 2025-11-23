import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "../contexts/CartContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CartProvider>
          <Slot /> 
          {/* <Slot initialRouteName="/" /> */}
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
