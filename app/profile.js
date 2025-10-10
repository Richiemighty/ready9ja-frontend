import { View, Text, Button, Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useState, useEffect } from "react";
import { getProfile, requestSeller } from "@/constants/api";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);

  const loadProfile = async () => {
    const token = await SecureStore.getItemAsync("token");
    const res = await getProfile(token);
    setUser(res.data);
  };

  const handleRequestSeller = async () => {
    const token = await SecureStore.getItemAsync("token");
    try {
      await requestSeller(token);
      Alert.alert("Request sent", "Your request to become a seller has been submitted.");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Could not send request");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (!user) return <Text>Loading...</Text>;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18 }}>{user.firstname} {user.lastname}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Role: {user.role}</Text>

      {user.role === "user" && (
        <Button title="Request Seller Account" onPress={handleRequestSeller} />
      )}
    </View>
  );
}
