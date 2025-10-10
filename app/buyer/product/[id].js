import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Button,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import api from "../../../constants/api";
import { CartContext } from "../../../contexts/CartContext";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, addToFavorites } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      // GET /products/:id
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.warn("Failed to fetch product:", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#7C3AED" />;
  }

  const seller = product.seller || product.seller_details || {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: product.images?.[0] }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>₦{product.price?.toLocaleString?.()}</Text>
        <Text style={styles.desc}>{product.description}</Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.rowButton}
            onPress={() => {
              addToCart(product);
              Alert.alert("Added to cart");
            }}
          >
            <Text style={{ color: "#fff" }}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.rowButton, { backgroundColor: "#F59E0B" }]}
            onPress={() => {
              addToFavorites(product);
              Alert.alert("Added to favorites");
            }}
          >
            <Text style={{ color: "#fff" }}>Favorite</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sellerCard}>
          <Text style={styles.sellerTitle}>Seller</Text>
          <TouchableOpacity onPress={() => router.push(`/buyer/seller/${seller.id}`)}>
            <Text style={styles.sellerName}>{seller.name || seller.company || "Seller"}</Text>
            <Text style={styles.sellerMeta}>
              Rating: {seller.rating ?? "N/A"} • {seller.reviews?.length ?? 0} reviews
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => router.push(`/buyer/chat/${seller.id}`)}
          >
            <Text style={{ color: "#fff" }}>Chat seller</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 60 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  image: { width: "100%", height: 300, backgroundColor: "#f0f0f0" },
  body: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  price: { fontSize: 20, fontWeight: "700", color: "#7C3AED", marginBottom: 12 },
  desc: { fontSize: 14, color: "#444", lineHeight: 20 },
  row: { flexDirection: "row", marginTop: 20, gap: 12 },
  rowButton: {
    flex: 1,
    backgroundColor: "#7C3AED",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  sellerCard: {
    marginTop: 24,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  sellerTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  sellerName: { fontSize: 16, fontWeight: "700" },
  sellerMeta: { fontSize: 13, color: "#666", marginTop: 6 },
  chatBtn: {
    marginTop: 12,
    backgroundColor: "#F59E0B",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
