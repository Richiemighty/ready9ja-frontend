import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import api from "../../../constants/api";
import ProductCard from "../../../components/ProductCard";

export default function SellerDetails({ navigation, route }) {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { id } = route?.params || {};

  useEffect(() => {
    fetchSeller();
  }, []);

  const fetchSeller = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/sellers/${id}`);
      setSeller(res.data);
      // optionally fetch products by seller id:
      const p = await api.get(`/products?sellerId=${id}`);
      setProducts(p.data || []);
    } catch (err) {
      console.warn("Seller fetch error", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !seller) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#7C3AED" />;
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={styles.header}>
        <Text style={styles.name}>{seller.name}</Text>
        <Text style={styles.meta}>Rating: {seller.rating ?? "N/A"}</Text>
      </View>

      <Text style={{ marginTop: 12, fontSize: 16, fontWeight: "700" }}>Products</Text>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} onPress={() => navigation.push("product", { id: item.id })} />}
        keyExtractor={(i) => String(i.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 12, backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#eee" },
  name: { fontSize: 18, fontWeight: "700" },
  meta: { fontSize: 13, color: "#666", marginTop: 6 },
});
