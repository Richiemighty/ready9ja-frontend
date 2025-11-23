// app/buyer/(tabs)/cart.js
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useCart } from "../../../contexts/CartContext";

const SkeletonItem = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeletonItem, { opacity }]}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonTextBlock}>
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonLineLong} />
        <View style={styles.skeletonLineShort} />
      </View>
    </Animated.View>
  );
};

export default function CartScreen() {
  const {
    cart,
    removeFromCart,
    clearCart,
    updateCartItemQuantity,
    loading,
    refreshCart,
  } = useCart();

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState({});

  // Auto refresh when this tab/screen is focused
  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [refreshCart])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshCart();
    setRefreshing(false);
  };

  // Calculate total
  const total = cart.reduce((sum, item) => {
    const product = item.product;
    return sum + product.price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (!cart.length) {
      Alert.alert("Cart is empty", "Add some products before checking out.");
      return;
    }

    router.push("/buyer/(tabs)/checkout");
  };


  const handleRemoveItem = (item) => {
    Alert.alert("Remove Item", "Remove this item from cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await removeFromCart(item.uuid);
        },
      },
    ]);
  };

  const handleProductPress = (item) => {
    const productId = item.product?.productId;
    if (!productId) {
      Alert.alert("Error", "Invalid product reference");
      return;
    }
    router.push(`/buyer/product/${productId}`);
  };

  const handleQuantityChange = async (item, newQty) => {
    if (newQty < 1) {
      await removeFromCart(item.uuid);
      return;
    }

    const cartItemUuid = item.uuid;
    setUpdatingItems((prev) => ({ ...prev, [cartItemUuid]: true }));

    try {
      const success = await updateCartItemQuantity(item.product_id, newQty);
      if (!success) {
        Alert.alert("Error", "Failed to update quantity.");
      }
    } catch (error) {
      Alert.alert("Error", "Error updating cart.");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [cartItemUuid]: false }));
    }
  };

  const renderRightActions = (item) => {
    return (
      <TouchableOpacity
        style={styles.swipeDelete}
        onPress={() => handleRemoveItem(item)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const product = item.product;
    const updating = updatingItems[item.uuid];

    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => handleProductPress(item)}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri: product.images?.[0] || "https://via.placeholder.com/100",
            }}
            style={styles.image}
          />

          <View style={styles.itemDetails}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>
              ₦{product.price.toLocaleString()}
            </Text>

            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Qty:</Text>

              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(item, item.quantity - 1);
                  }}
                  disabled={updating || item.quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={item.quantity <= 1 ? "#ccc" : "#7C3AED"}
                  />
                </TouchableOpacity>

                {updating ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                )}

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(item, item.quantity + 1);
                  }}
                  disabled={updating}
                >
                  <Ionicons name="add" size={16} color="#7C3AED" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.itemTotal}>
              ₦{(product.price * item.quantity).toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  // Shimmer loader when loading initial cart
  // if (loading && cart.length === 0) {
  //   return (
  //     <View style={styles.container}>
  //       {/* <Text style={styles.title}>🛒 My Cart</Text> */}
  //       <SkeletonItem />
  //       <SkeletonItem />
  //       <SkeletonItem />
  //       <SkeletonItem />
  //       <SkeletonItem />
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>🛒 My Cart</Text> */}

      {cart.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.empty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#7C3AED"]}
              tintColor="#7C3AED"
            />
          }
        >
          <Ionicons name="cart-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.replace("/buyer/(tabs)/marketplace")}
          >
            <Text style={styles.browseText}>Browse Products</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item, index) =>
              item.uuid && item.uuid.length > 0
                ? item.uuid
                : `${item.product_id}-${index}`
            }
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 150,
              flexGrow: 1,
            }}
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
              <Text style={styles.totalAmount}>
                ₦{total.toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() =>
                Alert.alert("Clear Cart", "Clear your entire cart?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear", style: "destructive", onPress: clearCart },
                ])
              }
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
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#7C3AED",
    marginBottom: 10,
    textAlign: "center",
  },
  /* Skeleton styles */
  skeletonItem: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  skeletonImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#CBD5F5",
    marginRight: 12,
  },
  skeletonTextBlock: {
    flex: 1,
    justifyContent: "space-between",
  },
  skeletonLineShort: {
    width: "40%",
    height: 10,
    backgroundColor: "#D1D5DB",
    borderRadius: 5,
    marginBottom: 6,
  },
  skeletonLineLong: {
    width: "80%",
    height: 10,
    backgroundColor: "#D1D5DB",
    borderRadius: 5,
    marginBottom: 6,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 70,
  },
  emptyText: {
    marginTop: 10,
    color: "#888",
    fontSize: 16,
    fontWeight: "600",
  },
  browseButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#7C3AED",
    borderRadius: 10,
    minWidth: 200,
    alignItems: "center",
  },
  browseText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    alignItems: "center",
  },
  image: { width: 70, height: 70, borderRadius: 10, marginRight: 12 },
  itemDetails: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#333" },
  price: { color: "#7C3AED", fontWeight: "bold", marginBottom: 8 },

  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  quantityLabel: { fontSize: 14, color: "#666" },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: { padding: 6 },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  itemTotal: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "600",
    color: "#7C3AED",
  },

  swipeDelete: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    marginBottom: 12,
    borderRadius: 12,
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
    marginBottom: 12,
  },
  totalText: { fontSize: 18, fontWeight: "600" },
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
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  clearBtn: {
    backgroundColor: "#6B7280",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  clearText: { color: "#fff", fontWeight: "bold" },
});
