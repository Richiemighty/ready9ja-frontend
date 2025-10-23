import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import OnlineImage from "./OnlineImage";

export default function ProductCard({ product, onPress }) {
  // product expected shape:
  // { id, name, price, images: [], seller: {...}, stock, category }
  const image = product?.images?.[0] || null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.left}>
        {image ? (
          <OnlineImage image={image} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: "#999" }}>No image</Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        <Text numberOfLines={2} style={styles.title}>
          {product.name}
        </Text>
        <Text style={styles.seller}>
          {product.seller?.name || product.seller?.company || "Unknown seller"}
        </Text>
        <Text style={styles.price}>
          ₦{product.price?.toLocaleString?.() ?? product.price}
        </Text>
        <Text
          style={[
            styles.stock,
            { color: product.stock > 0 ? "#2d8f4a" : "#d9534f" },
          ]}
        >
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  left: { marginRight: 12 },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  imagePlaceholder: { justifyContent: "center", alignItems: "center" },
  right: { flex: 1, justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "600", color: "#111" },
  seller: { fontSize: 12, color: "#666", marginTop: 4 },
  price: { fontSize: 16, fontWeight: "700", color: "#7C3AED", marginTop: 6 },
  stock: { fontSize: 12, marginTop: 6 },
});
