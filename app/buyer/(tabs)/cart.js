import { useContext } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CartContext } from "../../../contexts/CartContext";

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  const total = cart.reduce((s, p) => s + (p.price || 0) * (p.quantity || 1), 0);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Cart</Text>

      <FlatList
        data={cart}
        keyExtractor={(i) => String(i.id)}
        ListEmptyComponent={<Text style={{ color: "#666" }}>No items in cart</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={{ fontWeight: "600" }}>{item.name}</Text>
            <Text>₦{item.price?.toLocaleString?.()}</Text>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
              <Text style={{ color: "#fff" }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 18 }}>Total: ₦{total.toLocaleString?.()}</Text>
        <TouchableOpacity
          style={styles.checkout}
          onPress={() => Alert.alert("Checkout", "Checkout flow not implemented")}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Checkout</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { clearCart(); Alert.alert("Cart cleared"); }} style={{ marginTop: 10 }}>
          <Text style={{ color: "#d9534f" }}>Clear Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { padding: 12, backgroundColor: "#fff", borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: "#eee" },
  removeBtn: { marginTop: 8, backgroundColor: "#d9534f", padding: 8, borderRadius: 6, alignItems: "center", width: 90 },
  checkout: { marginTop: 12, backgroundColor: "#7C3AED", padding: 12, borderRadius: 8, alignItems: "center" },
});
