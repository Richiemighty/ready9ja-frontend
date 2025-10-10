import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleLogin = async () => {
    try {
      const res = await login(form.username, form.password);
      Alert.alert("Success", res?.message || "Logged in successfully");
      router.push("/home");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Invalid username or password";
      Alert.alert("Error", msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        style={styles.input}
        onChangeText={(v) => setForm({ ...form, username: v })}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        onChangeText={(v) => setForm({ ...form, password: v })}
      />
      <Button title={loading ? "Loading..." : "Login"} onPress={handleLogin} />
      <Text style={styles.link} onPress={() => router.push("/register")}>
        Don’t have an account? Register
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
