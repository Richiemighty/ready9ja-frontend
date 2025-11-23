import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useCart } from "../../../contexts/CartContext";
import { useAuth } from "../../../hooks/useAuth";

export default function BuyerTabsLayout() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { getActiveRole, getUser } = useAuth();

  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserData();
    getActiveRole().catch(() => {});
  }, []);

  const loadUserData = async () => {
    try {
      const usr = await getUser();
      setUser(usr);
    } catch {}
  };

  // ---------------------------------------------
  // NICE MARKETPLACE HEADER (Only for marketplace)
  // ---------------------------------------------
  const MarketplaceHeaderLeft = () => (
    <TouchableOpacity
      onPress={() => router.push("/buyer/(tabs)/profile")}
      style={styles.marketHeaderLeft}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri:
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${
              encodeURIComponent(user?.firstname || "User")
            }&background=7C3AED&color=fff&size=100`,
        }}
        style={styles.avatar}
      />

      <View style={{ marginLeft: 10 }}>
        <Text style={styles.helloText}>Hello 👋</Text>
        <Text style={styles.userNameText}>{user?.firstname || "User"}</Text>
      </View>
    </TouchableOpacity>
  );

  const MarketplaceHeaderRight = () => (
    <View style={styles.marketHeaderRight}>
      {/* Support */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() =>
          Alert.alert("Coming Soon", "This feature will be available shortly!")
        }
      >
        <Ionicons name="headset-outline" size={22} color="#7C3AED" />
      </TouchableOpacity>

      {/* Notifications */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={() =>
          Alert.alert("Coming Soon", "Notifications will be available soon!")
        }
      >
        <Ionicons name="notifications-outline" size={22} color="#7C3AED" />
        <View style={styles.notifBadge}>
          <Text style={styles.notifBadgeText}>3</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // ---------------------------------------------
  // CUSTOM CART HEADER
  // ---------------------------------------------
  const CartHeader = () => (
    <View style={styles.cartHeader}>
      <View>
        <Text style={styles.cartHeaderTitle}>My Cart</Text>
        <Text style={styles.cartHeaderSubtitle}>Review your items</Text>
      </View>

      <TouchableOpacity
        onPress={() => {
          Vibration.vibrate(10);
          Alert.alert("Coming Soon", "Customer support is not available yet!");
        }}
      >
        <Ionicons name="headset-outline" size={28} color="#ffffffee" />
      </TouchableOpacity>
    </View>
  );

  // ---------------------------------------------
  // FLOATING CHAT BUBBLE
  // ---------------------------------------------
  const SupportBubble = () => (
    <TouchableOpacity
      style={styles.chatBubble}
      onPress={() => {
        Vibration.vibrate(10);
        Alert.alert("Coming Soon", "Chat support will be added soon!");
      }}
      activeOpacity={0.8}
    >
      <Ionicons
        name="chatbubble-ellipses-outline"
        size={24}
        color="#fff"
      />
    </TouchableOpacity>
  );

  // ---------------------------------------------
  // MAIN TABS
  // ---------------------------------------------
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#7C3AED",
          headerShadowVisible: false,
          tabBarStyle: {
            paddingBottom: 6,
            height: 80,
            borderTopWidth: 0.4,
            borderTopColor: "#d1d5db",
          },
        }}
      >
        {/* Marketplace */}
        <Tabs.Screen
          name="marketplace"
          options={{
            title: "Shop",
            headerShown: true,
            headerLeft: () => <MarketplaceHeaderLeft />,
            headerRight: () => <MarketplaceHeaderRight />,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="storefront-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Cart */}
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            headerShown: true,
            header: () => <CartHeader />,
            tabBarBadge: cartCount > 0 ? cartCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: "#EF4444",
              color: "#fff",
            },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cart-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Promotions */}
        <Tabs.Screen
          name="promotions"
          options={{
            title: "Promotions",
            headerShown: true,
            headerTitle: "Promotions",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pricetag-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Checkout */}
        <Tabs.Screen
          name="checkout"
          options={{
            title: "Checkout",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>

      <SupportBubble />
    </>
  );
}

//
//  STYLE SHEET
//
const styles = StyleSheet.create({

  // Marketplace Header
  marketHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#7C3AED",
  },
  helloText: {
    fontSize: 12,
    color: "#6B7280",
  },
  userNameText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
  },
  marketHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#F3E8FF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notifBadge: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 16,
    height: 16,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  notifBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },

  // CART HEADER
  cartHeader: {
    backgroundColor: "#7C3AED",
    height: 90,
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: "flex-end",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  cartHeaderTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  cartHeaderSubtitle: {
    fontSize: 13,
    color: "#f3f4f6",
  },

  // Floating Chat
  chatBubble: {
    position: "absolute",
    right: 22,
    bottom: 100,
    width: 60,
    height: 60,
    backgroundColor: "#7C3AED",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
  },
});
