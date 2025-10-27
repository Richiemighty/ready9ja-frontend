import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import api from "../../../constants/api";
import { useRouter } from "expo-router";
import HeaderRightProfile from "../../../components/HeaderRightProfile";

const { width } = Dimensions.get("window");

export default function Marketplace({ navigation }) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useLayoutEffect(() => {
    navigation?.setOptions?.({
      headerRight: () => <HeaderRightProfile />,
      headerTitle: "Marketplace",
    });
  }, [navigation]);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [query, categoryFilter, products]);

  // --- Load Products from API ---
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      const items = res.data?.products || [];
      setProducts(items);
      setFiltered(items);
    } catch (err) {
      console.warn("Failed to load products:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Load Categories from API ---
  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      const cats = res.data?.categories || [];
      setCategories(cats.length ? cats : ["General"]);
    } catch (err) {
      console.warn("Failed to load categories:", err.message);
    }
  };

  // --- Apply Search and Category Filter ---
  const applyFilters = () => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }
    if (categoryFilter) {
      list = list.filter((p) =>
        p.categories?.some((c) => c.name === categoryFilter)
      );
    }
    setFiltered(list);
  };

  // --- Render Each Product ---
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/buyer/product/${item.id}`)}
    >
      <Image
        source={{
          uri:
            item.images?.[0] ||
            "https://via.placeholder.com/150?text=No+Image",
        }}
        style={styles.image}
      />
      <View style={{ padding: 10 }}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>₦{item.price?.toLocaleString()}</Text>
        <Text style={styles.stock}>
          {item.stock > 0 ? "In Stock ✅" : "Out of Stock ❌"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // --- UI ---
  return (
    <View style={styles.container}>
      {/* Search + Filter Row */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search for products..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
        <TouchableOpacity
          style={styles.filterBtn}
          onPress={() =>
            setCategoryFilter(categoryFilter ? null : categories[0])
          }
        >
          <Text style={styles.filterText}>
            {categoryFilter ? "Clear" : "Filter"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories Row */}
      <View style={styles.categoriesRow}>
        <FlatList
          data={["All", ...categories.map((c) => c.name || c)]}
          horizontal
          keyExtractor={(item, idx) => `${item}-${idx}`}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const active =
              (categoryFilter || "All") === item ||
              (item === "All" && !categoryFilter);
            return (
              <TouchableOpacity
                onPress={() =>
                  setCategoryFilter(item === "All" ? null : item)
                }
                style={[
                  styles.categoryChip,
                  active && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={
                    active ? styles.categoryTextActive : styles.categoryText
                  }
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Product List */}
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          size="large"
          color="#7C3AED"
        />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No products found 😔</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 10 },
  searchRow: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  filterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  categoriesRow: {
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryChipActive: {
    backgroundColor: "#7C3AED",
  },
  categoryText: {
    color: "#111",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    width: width / 2 - 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 120,
    backgroundColor: "#F3F4F6",
  },
  name: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#111",
  },
  desc: {
    color: "#555",
    fontSize: 13,
    marginTop: 2,
  },
  price: {
    color: "#7C3AED",
    fontWeight: "bold",
    marginTop: 6,
  },
  stock: {
    fontSize: 13,
    color: "#16A34A",
    marginTop: 2,
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
});
