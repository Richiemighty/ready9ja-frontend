import React, { useContext, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { CartContext } from "../../../contexts/CartContext";
import { Ionicons } from "@expo/vector-icons";

export default function CartScreen() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  const total = useMemo(
    () =>
      cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    [cart]
  );

  const handleCheckout = () => {
    if (!cart.length) {
      Alert.alert("Cart is empty", "Add some products before checking out.");
      return;
    }
    Alert.alert("Checkout", "This is where checkout logic will go 🚀");
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: item.images?.[0] || "https://via.placeholder.com/100" }}
        style={styles.image}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₦{item.price?.toLocaleString()}</Text>
        <Text style={styles.quantity}>Qty: {item.quantity || 1}</Text>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)}>
        <Ionicons name="trash-outline" size={24} color="#d9534f" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 My Cart</Text>

      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          <View style={styles.summary}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>₦{total.toLocaleString()}</Text>
          </View>

          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
            <Text style={styles.clearText}>Clear Cart</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#7C3AED",
    marginBottom: 10,
    textAlign: "center",
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  price: {
    color: "#7C3AED",
    fontWeight: "bold",
  },
  quantity: {
    color: "#666",
    marginTop: 2,
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  checkoutBtn: {
    backgroundColor: "#7C3AED",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearBtn: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  clearText: {
    color: "#fff",
    fontWeight: "bold",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    color: "#888",
    fontSize: 16,
  },
});
