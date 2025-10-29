// CartScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useCart } from "../../../contexts/CartContext";

export default function CartScreen() {
  const { 
    cart, 
    removeFromCart, 
    clearCart, 
    updateCartItemQuantity, 
    loading, 
    refreshCart 
  } = useCart();
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});

  // Calculate total from actual cart
  const total = cart.reduce((sum, item) => {
    const product = item.product || item;
    const itemTotal = (product.price || 0) * (item.quantity || 1);
    return sum + itemTotal;
  }, 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCart();
    setRefreshing(false);
  };

  const handleCheckout = () => {
    if (!cart.length) {
      Alert.alert("Cart is empty", "Add some products before checking out.");
      return;
    }
    Alert.alert("Checkout", "This is where checkout logic will go 🚀");
  };

  const handleRemoveItem = async (item) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: async () => {
            const productId = item.product_id || item.id;
            await removeFromCart(productId);
          }
        }
      ]
    );
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    const productId = item.product_id || item.id;
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      await updateCartItemQuantity(productId, newQuantity);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const renderItem = ({ item }) => {
    // Handle nested product data structure
    const product = item.product || item;
    const productId = item.product_id || item.id;
    const isUpdating = updatingItems[productId];

    console.log('Cart item:', item); // Debug log to see the actual structure

    return (
      <View style={styles.itemContainer}>
        <Image
          source={{ 
            uri: product.images?.[0] || 
                 product.image || 
                 "https://via.placeholder.com/100?text=No+Image" 
          }}
          style={styles.image}
        />
        <View style={styles.itemDetails}>
          <Text style={styles.name}>{product.name || 'Unknown Product'}</Text>
          <Text style={styles.price}>₦{(product.price || 0).toLocaleString()}</Text>
          
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item, (item.quantity || 1) - 1)}
                disabled={isUpdating || (item.quantity || 1) <= 1}
              >
                <Ionicons 
                  name="remove" 
                  size={16} 
                  color={(item.quantity || 1) <= 1 ? "#ccc" : "#7C3AED"} 
                />
              </TouchableOpacity>
              
              {isUpdating ? (
                <ActivityIndicator size="small" color="#7C3AED" />
              ) : (
                <Text style={styles.quantityText}>{item.quantity || 1}</Text>
              )}
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(item, (item.quantity || 1) + 1)}
                disabled={isUpdating}
              >
                <Ionicons name="add" size={16} color="#7C3AED" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.itemTotal}>
            ₦{((product.price || 0) * (item.quantity || 1)).toLocaleString()}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={() => handleRemoveItem(item)}
          style={styles.removeButton}
          disabled={isUpdating}
        >
          <Ionicons name="trash-outline" size={24} color="#d9534f" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && cart.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 My Cart</Text>

      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add some products to get started!</Text>
          
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={refreshCart}
            disabled={loading}
          >
            <Ionicons name="refresh" size={20} color="#7C3AED" />
            <Text style={styles.refreshText}>Refresh Cart</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => String(item.product_id || item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#7C3AED"]}
                tintColor="#7C3AED"
              />
            }
          />

          <View style={styles.footer}>
            <View style={styles.summary}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalAmount}>₦{total.toLocaleString()}</Text>
            </View>

            <TouchableOpacity 
              style={styles.checkoutBtn} 
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.clearBtn} 
              onPress={() => {
                Alert.alert(
                  "Clear Cart",
                  "Are you sure you want to clear your entire cart?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Clear All", 
                      style: "destructive",
                      onPress: clearCart
                    }
                  ]
                );
              }}
            >
              <Text style={styles.clearText}>Clear Cart</Text>
            </TouchableOpacity>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 16,
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
  itemDetails: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  price: {
    color: "#7C3AED",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  quantityLabel: {
    color: "#666",
    fontSize: 14,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    padding: 6,
    borderRadius: 6,
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
  },
  removeButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 120,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  summary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
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
    marginBottom: 8,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  clearBtn: {
    backgroundColor: "#6B7280",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
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
    fontWeight: "600",
  },
  emptySubtext: {
    marginTop: 5,
    color: "#999",
    fontSize: 14,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    gap: 8,
  },
  refreshText: {
    color: "#7C3AED",
    fontWeight: "600",
  },
});