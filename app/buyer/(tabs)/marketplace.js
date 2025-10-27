import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderRightProfile from "../../../components/HeaderRightProfile";
import api from "../../../constants/api";

const { width } = Dimensions.get("window");

export default function Marketplace({ navigation }) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // --- Load Categories from API ---
  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      const cats = res.data?.categories || [];
      setCategories(cats);
    } catch (err) {
      console.warn("Failed to load categories:", err.message);
    }
  };

  // --- Apply Search and Category Filter ---
  const applyFilters = () => {
    let list = [...products];
    
    // Search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.tags || "").toLowerCase().includes(q)
      );
    }
    
    // Category filter
    if (categoryFilter && categoryFilter !== "All") {
      list = list.filter((p) =>
        p.categories?.some((c) => c.name === categoryFilter)
      );
    }
    
    setFiltered(list);
  };

  // --- Pull to refresh ---
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  // --- Extract unique categories from products ---
  const getUniqueCategories = () => {
    const allCategories = products.flatMap(product => 
      product.categories?.map(cat => cat.name) || []
    );
    return [...new Set(allCategories)];
  };

  // --- Render Each Product ---
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/buyer/product/${item.productId}`)}
    >
      <Image
        source={{
          uri:
            item.images?.[0] ||
            "https://via.placeholder.com/150?text=No+Image",
        }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.desc} numberOfLines={2}>
          {item.description}
        </Text>
        
        {/* Categories Tags */}
        {item.categories && item.categories.length > 0 && (
          <View style={styles.categoryTags}>
            {item.categories.slice(0, 2).map((category, index) => (
              <View key={index} style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{category.name}</Text>
              </View>
            ))}
            {item.categories.length > 2 && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>+{item.categories.length - 2}</Text>
              </View>
            )}
          </View>
        )}
        
        <Text style={styles.price}>₦{item.price?.toLocaleString()}</Text>
        <View style={styles.stockRow}>
          <Text style={[
            styles.stock,
            { color: item.stock > 0 ? "#16A34A" : "#DC2626" }
          ]}>
            {item.stock > 0 ? `${item.stock} in stock ✅` : "Out of stock ❌"}
          </Text>
          {item.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{item.discount}% OFF</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // --- Available categories for filtering ---
  const availableCategories = ["All", ...getUniqueCategories()];

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
          onPress={() => setCategoryFilter(categoryFilter ? null : "All")}
        >
          <Text style={styles.filterText}>
            {categoryFilter ? "Clear" : "Filter"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories Row */}
      {availableCategories.length > 1 && (
        <View style={styles.categoriesRow}>
          <FlatList
            data={availableCategories}
            horizontal
            keyExtractor={(item, idx) => `${item}-${idx}`}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const active = categoryFilter === item || (item === "All" && !categoryFilter);
              return (
                <TouchableOpacity
                  onPress={() => setCategoryFilter(item === "All" ? null : item)}
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
      )}

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
          <Text style={styles.emptySubtext}>
            {query || categoryFilter ? "Try adjusting your search or filters" : "Check back later for new products"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.productId}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#7C3AED"]}
              tintColor="#7C3AED"
            />
          }
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
  cardContent: {
    padding: 10,
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
    marginBottom: 8,
  },
  categoryTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 4,
  },
  categoryTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryTagText: {
    fontSize: 10,
    color: "#6B7280",
  },
  price: {
    color: "#7C3AED",
    fontWeight: "bold",
    fontSize: 16,
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  stock: {
    fontSize: 12,
    fontWeight: "500",
  },
  discountBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});