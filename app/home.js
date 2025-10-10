import React from "react";
import { View, Text, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert("Success", "Logged out successfully");
      router.push("/");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Logout failed");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to Ready9ja 🎉</Text>
      <Button title="Logout" onPress={handleLogout} />
      <Button title="Manage Roles" onPress={() => router.push("/roles")} />
    </View>
  );
}
