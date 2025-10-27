import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../../../constants/api";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../../../contexts/CartContext";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, addToFavorites } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      const prod = res.data?.product || res.data?.products?.[0];
      if (!prod) throw new Error("Product not found");

      setProduct(prod);
      if (prod.createdBy) fetchSeller(prod.createdBy);
    } catch (err) {
      console.warn("Error fetching product:", err.message);
      Alert.alert("Error", "Product not found!");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeller = async (uuid) => {
    try {
      const res = await api.get(`/sellers/${uuid}`);
      if (res.data?.seller) setSeller(res.data.seller);
    } catch (err) {
      console.warn("Failed to fetch seller info:", err.message);
    }
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );

  if (!product)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Product not found!!</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {product.images?.length ? (
          product.images.map((img, idx) => (
            <Image key={idx} source={{ uri: img }} style={styles.image} />
          ))
        ) : (
          <Image
            source={{ uri: "https://via.placeholder.com/400x300" }}
            style={styles.image}
          />
        )}
      </ScrollView>

      <View style={styles.details}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>₦{product.price?.toLocaleString()}</Text>
        <Text style={styles.desc}>{product.description}</Text>

        <View style={styles.meta}>
          <Text style={styles.metaText}>
            Stock:{" "}
            <Text style={{ color: product.stock > 0 ? "#4CAF50" : "#d9534f" }}>
              {product.stock > 0 ? "Available" : "Out of stock"}
            </Text>
          </Text>
          <Text style={styles.metaText}>
            SKU: <Text style={{ color: "#7C3AED" }}>{product.sku}</Text>
          </Text>
        </View>

        {/* Seller Info Section */}
        {seller && (
          <View style={styles.sellerBox}>
            <Text style={styles.sellerTitle}>👨‍💼 Seller Information</Text>
            <Text style={styles.sellerText}>Name: {seller.name || "Unknown"}</Text>
            <Text style={styles.sellerText}>
              Rating: ⭐ {seller.rating || "4.5"} / 5
            </Text>
            <TouchableOpacity
              style={styles.chatBtn}
              onPress={() => router.push(`/buyer/chat/${seller.uuid}`)}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
              <Text style={styles.btnText}>Chat with Seller</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cart & Favorites */}
        <TouchableOpacity
          style={styles.addCartBtn}
          onPress={() => {
            addToCart(product);
            Alert.alert("Added to cart!");
          }}
        >
          <Ionicons name="cart-outline" size={22} color="#fff" />
          <Text style={styles.btnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.favBtn}
          onPress={() => {
            addToFavorites(product);
            Alert.alert("Added to favorites!");
          }}
        >
          <Ionicons name="heart-outline" size={22} color="#fff" />
          <Text style={styles.btnText}>Add to Favorites</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  image: {
    width: 400,
    height: 300,
    borderRadius: 10,
    marginRight: 10,
  },
  details: { padding: 20 },
  name: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 6 },
  price: { fontSize: 20, color: "#7C3AED", fontWeight: "bold", marginBottom: 10 },
  desc: { color: "#555", marginBottom: 10 },
  meta: { marginBottom: 20 },
  metaText: { color: "#333", fontSize: 15, marginBottom: 5 },

  // Seller Info
  sellerBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sellerTitle: { fontSize: 18, fontWeight: "bold", color: "#7C3AED", marginBottom: 6 },
  sellerText: { color: "#333", fontSize: 15, marginBottom: 4 },
  chatBtn: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  addCartBtn: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  favBtn: {
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 6,
  },
  error: {
    color: "#d9534f",
    fontSize: 18,
    fontWeight: "600",
  },
});
