import { View, Text, Button, StyleSheet } from "react-native";

export default function BuyerDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome Buyer 👋</Text>
      <Text style={styles.subtitle}>
        Browse and shop your favorite products!
      </Text>

      <View style={styles.actions}>
        <Button title="Start Shopping 🛒" onPress={() => {}} />
        <Button title="View Orders 📦" color="#4CAF50" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center", // centers vertically
    alignItems: "center", // centers horizontally
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  welcome: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
  },
  actions: {
    width: "80%",
    gap: 12,
  },
});
