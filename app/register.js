import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const handleRegister = async () => {
    try {
      const res = await register(form);
      Alert.alert("Success", res?.message || "User registered successfully");
      router.push("/");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      Alert.alert("Error", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      {["firstname", "lastname", "email", "password", "confirmPassword"].map(
        (field) => (
          <TextInput
            key={field}
            placeholder={field}
            secureTextEntry={field.includes("password")}
            style={styles.input}
            onChangeText={(v) => setForm({ ...form, [field]: v })}
          />
        )
      )}
      <Button
        title={loading ? "Loading..." : "Register"}
        onPress={handleRegister}
      />
      <Text style={styles.link} onPress={() => router.push("/")}>
        Already have an account? Login
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginVertical: 8 },
  link: { color: "blue", textAlign: "center", marginTop: 10 },
});
