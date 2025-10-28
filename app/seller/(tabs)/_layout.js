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

  // Seller Header Component
  const SellerHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
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
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => router.push('/seller/notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color="#7C3AED" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => router.push('/seller/settings')}
        >
          <Ionicons name="settings-outline" size={22} color="#7C3AED" />
        </TouchableOpacity>
      </View>
    </View>
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
          height: 60,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB'
        },
        headerRight: () => (
          <View style={{ marginRight: 16 }}>
            <Text style={styles.roleBadge}>Seller</Text>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Seller Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          headerTitle: () => <SellerHeader />,
          headerTitleAlign: 'left',
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
    </Tabs>
  );
}

const styles = {
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: '600',
  },
};