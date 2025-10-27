import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Checkout() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Checkout</Text>
      <Text style={styles.subtitle}>Review your order before proceeding</Text>

      <View style={styles.summaryBox}>
        <Text style={styles.label}>Total Items:</Text>
        <Text style={styles.value}>3</Text>

        <Text style={styles.label}>Total Amount:</Text>
        <Text style={styles.value}>₦15,500</Text>
      </View>

      <TouchableOpacity style={styles.checkoutBtn}>
        <Text style={styles.checkoutText}>Proceed to Payment</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#7C3AED",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginBottom: 30,
  },
  summaryBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
    elevation: 3,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  label: {
    color: "#7C3AED",
    fontWeight: "600",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: "#333",
  },
  checkoutBtn: {
    backgroundColor: "#7C3AED",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
