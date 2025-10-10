import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export default function Profile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // cross-platform getter
  const getItem = async (key) => {
    if (Platform.OS === "web") return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getItem("user_data");
        if (data) {
          const parsed = JSON.parse(data);
          setUser(parsed.user);
        }
      } catch (err) {
        console.warn("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );

  if (!user)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>User not found</Text>
        <TouchableOpacity onPress={() => router.replace("/login")} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(`${user.firstname} ${user.lastname}`) +
              "&background=7C3AED&color=fff",
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user.firstname} {user.lastname}</Text>
        <Text style={styles.role}>{user.roles?.[0]?.description || "App User"}</Text>
      </View>

      {/* INFO CARD */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>📧 Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>🧩 Role</Text>
          <Text style={styles.value}>{user.roles?.[0]?.name || "User"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📱 Phone</Text>
          <Text style={styles.value}>{user.phone || "Not provided"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📍 Address</Text>
          <Text style={styles.value}>{user.address || "Not provided"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>🟢 Status</Text>
          <Text style={[styles.value, { color: user.status ? "#22C55E" : "#EF4444" }]}>
            {user.status ? "Active" : "Inactive"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>🕓 Joined</Text>
          <Text style={styles.value}>
            {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "linear-gradient(180deg, #7C3AED 0%, #9F67FF 100%)",
    backgroundColor: "#7C3AED", // fallback for native
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 5,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  role: {
    color: "#EDE9FE",
    fontSize: 15,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -30,
    padding: 20,
    borderRadius: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  infoRow: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 8,
  },
  label: {
    color: "#7C3AED",
    fontWeight: "600",
    fontSize: 14,
  },
  value: {
    color: "#1F2937",
    fontSize: 16,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: "#EF4444",
    marginTop: 40,
    marginHorizontal: 60,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#EF4444",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  error: {
    color: "#d9534f",
    fontSize: 18,
    marginBottom: 10,
  },
});
