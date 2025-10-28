import { useRouter } from "expo-router";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../../hooks/useAuth";

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    Alert.alert("Logged out");
    router.push("../login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard ⚙️</Text>
      <Text style={styles.text}>Manage users, sellers, and reports</Text>
      <View style={styles.buttons}>
        <Button title="View Users" onPress={() => {}} />
        <Button title="System Settings" color="#4CAF50" onPress={() => {}} />
      </View>
      <Button title="Logout" color="#d9534f" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 16, color: "#555", marginBottom: 30 },
  buttons: { width: "80%", gap: 10, marginBottom: 20 },
});
