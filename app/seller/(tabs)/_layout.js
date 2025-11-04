import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';

export default function SellerTabsLayout() {
  const router = useRouter();
  const { getUser, getActiveRole } = useAuth();
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('seller');

  useEffect(() => {
    loadUserData();
    loadCurrentRole();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadCurrentRole = async () => {
    try {
      const role = await getActiveRole();
      setCurrentRole(role || 'seller');
    } catch (error) {
      console.error('Error loading current role:', error);
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

  // Custom Header Left Component for Dashboard (User Profile)
  const DashboardHeaderLeft = () => (
    <TouchableOpacity 
      style={styles.userProfileSection}
      onPress={() => router.push('/seller/profile')}
    >
      <Image
        source={{
          uri: user?.avatar || `https://ui-avatars.com/api/?name=${
            encodeURIComponent(user?.firstname || 'Seller')
          }&background=7C3AED&color=fff&size=100`
        }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>
          {user?.firstname || 'Seller'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Custom Header Right Component for Dashboard (Shortcut Icons)
  const DashboardHeaderRight = () => (
    <View style={styles.shortcutIcons}>
      {/* Notifications */}
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={() => router.push('/seller/notifications')}
      >
        <Ionicons name="notifications-outline" size={22} color="#7C3AED" />
        <View style={styles.notificationBadge}>
          <Text style={styles.badgeText}>5</Text>
        </View>
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity 
        style={styles.iconButton}
        onPress={() => router.push('/seller/settings')}
      >
        <Ionicons name="settings-outline" size={22} color="#7C3AED" />
      </TouchableOpacity>
    </View>
  );

  // Default Header Right for other tabs
  const DefaultHeaderRight = () => (
    <TouchableOpacity 
      style={styles.roleBadge}
      onPress={() => router.push('/seller/profile')}
    >
      <Ionicons name="person-circle-outline" size={20} color="#7C3AED" />
      <Text style={styles.roleText}>
        {getRoleDisplayName(currentRole)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#6B7280",
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB'
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: '#1F2937'
        },
        tabBarStyle: {
          paddingBottom: 8,
          height: 85,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB'
        },
        headerRight: () => <DefaultHeaderRight />,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          headerTitle: "Dashboard",
          headerTitleAlign: 'center',
          headerLeft: () => <DashboardHeaderLeft />,
          headerRight: () => <DashboardHeaderRight />,
          headerStyle: {
            backgroundColor: '#FFFFFF',
            height: 120,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB'
          },
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarButton: () => null, // Hide from tab bar
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = {
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