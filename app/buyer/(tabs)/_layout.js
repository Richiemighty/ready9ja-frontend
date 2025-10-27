import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { CartProvider } from "../../../contexts/CartContext";

export default function BuyerTabsLayout() {
  return (
    <CartProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#7C3AED",
          headerShown: true,
          headerTitleAlign: "center",
          tabBarStyle: {
            paddingBottom: 6,
            paddingRight:10,
            paddingLeft:10,
            height: 85,
            borderTopWidth: 0.5,
            borderTopColor: "#ccc",
          },
        }}
      >
        <Tabs.Screen
          name="marketplace"
          options={{
            title: "Marketplace",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="storefront-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: "Favorites",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="checkout"
          options={{
            title: "Checkout",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card-outline" size={size} color={color} />
            ),
          }}
        />
        {/* <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        /> */}
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false, // ✅ hides the header only for Profile screen
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={size} color={color} />
            ),
          }}
        />

      </Tabs>
    </CartProvider>
  );
}
