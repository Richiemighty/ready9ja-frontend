import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import api from "../constants/api";

export default function VerifyEmail() {
  const { token } = useLocalSearchParams();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setMessage("✅ Email verified successfully!");
      } catch (err) {
        setMessage("❌ Invalid or expired verification link.");
      }
    };
    verify();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{message}</Text>
    </View>
  );
}
