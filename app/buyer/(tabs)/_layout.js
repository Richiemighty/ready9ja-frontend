import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { CartProvider } from "../../../contexts/CartContext";
import { useAuth } from "../../../hooks/useAuth";

export default function BuyerTabsLayout() {
  const { getActiveRole, getUser } = useAuth();
  const [role, setRole] = useState("user");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadActiveRole();
    loadUserData();
  }, []);

  const loadActiveRole = async () => {
    try {
      const activeRole = await getActiveRole();
      setRole(activeRole);
    } catch (error) {
      console.error("Error loading active role:", error);
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      user: "Buyer",
      seller: "Seller", 
      admin: "Admin"
    };
    return roleNames[role] || role;
  };

  // Custom Header Left Component for Marketplace (User Profile)
  const MarketplaceHeaderLeft = () => (
    <TouchableOpacity 
      style={styles.userProfileSection}
      onPress={() => router.push('/buyer/(tabs)/profile')}
    >
      <Image
        source={{
          uri: user?.avatar || `https://ui-avatars.com/api/?name=${
            encodeURIComponent(user?.firstname || 'User')
          }&background=7C3AED&color=fff&size=100`
        }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.greeting}>Hello,</Text>
        <Text style={styles.userName}>
          {user?.firstname || 'User'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Custom Header Right Component for Marketplace (Shortcut Icons)
  const MarketplaceHeaderRight = () => (
    <View style={styles.shortcutIcons}>
      {/* Customer Care */}
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={() => router.push('/support')}
      >
        <Ionicons name="headset-outline" size={22} color="#7C3AED" />
      </TouchableOpacity>

      {/* Notifications */}
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={() => router.push('/notifications')}
      >
        <Ionicons name="notifications-outline" size={22} color="#7C3AED" />
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>3</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Default Header Right for other tabs
  const DefaultHeaderRight = () => (
    <TouchableOpacity 
      style={styles.roleBadge}
      onPress={() => router.push('/buyer/(tabs)/profile')}
    >
      <Ionicons name="person-circle-outline" size={20} color="#7C3AED" />
      <Text style={styles.roleText}>
        {getRoleDisplayName(role)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <CartProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#7C3AED",
          headerTitle: `${getRoleDisplayName(role)} Dashboard`,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#F5F3FF',
            height: 100,
          },
          headerTitleAlign: "center",
          headerRight: () => <DefaultHeaderRight />,
          tabBarStyle: {
            paddingBottom: 6,
            paddingRight: 10,
            paddingLeft: 10,
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
            headerTitle: "Marketplace", // Simple title
            headerTitleAlign: "center",
            headerLeft: () => <MarketplaceHeaderLeft />,
            headerRight: () => <MarketplaceHeaderRight />,
            headerStyle: {
              backgroundColor: '#FFFFFF',
              height: 120,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB'
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 18,
              color: '#1F2937',
            },
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
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </CartProvider>
  );
}

const styles = {
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  userInfo: {
    marginLeft: 12,
  },
  greeting: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold',
    marginTop: 2,
  },
  shortcutIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#DDD6FE'
  },
  roleText: {
    marginLeft: 6,
    color: '#7C3AED',
    fontWeight: '600',
    fontSize: 12,
  },
};