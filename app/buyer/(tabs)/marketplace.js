import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import api from "../../../constants/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 22;
const BANNER_WIDTH = width;
const BANNER_HEIGHT = 160;

// Static banners
const MARKET_BANNERS = [
  {
    id: "1",
    title: "Flash Sale",
    subtitle: "Up to 40% OFF",
    bg: "#EEF2FF",
    accent: "#4F46E5",
    emoji: "⚡",
  },
  {
    id: "2",
    title: "New Fashion",
    subtitle: "Latest Arrivals",
    bg: "#F0FDFA",
    accent: "#10B981",
    emoji: "👗",
  },
  {
    id: "3",
    title: "Groceries",
    subtitle: "Fresh Everyday",
    bg: "#FFFBEB",
    accent: "#FBBF24",
    emoji: "🛒",
  },
];

const CATEGORY_ICONS = {
  All: "apps-outline",
  Foods: "fast-food-outline",
  Fashion: "shirt-outline",
  Technology: "hardware-chip-outline",
  Electronics: "tv-outline",
};

export default function Marketplace() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(false);

  const [activeBanner, setActiveBanner] = useState(0);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load products
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter whenever parameters update
  useEffect(() => {
    applyFilters();
  }, [query, selectedCategory, minPrice, maxPrice, inStockOnly, discountOnly, products]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      const p = res.data?.products || [];
      setProducts(p);
      setFiltered(p);
    } catch (e) {
      console.log("Error loading products:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  // Extract categories dynamically + defaults
  const getCategories = () => {
    const dynamic = products.flatMap((p) => p.categories?.map((c) => c.name) || []);
    const defaults = ["Foods", "Fashion", "Technology", "Electronics"];
    return ["All", ...new Set([...defaults, ...dynamic])];
  };

  const activeFilters =
    (selectedCategory !== "All" ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (discountOnly ? 1 : 0);

  // APPLY FILTERS
  const applyFilters = () => {
    let list = [...products];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      list = list.filter((p) =>
        p.categories?.some((c) => c.name === selectedCategory)
      );
    }

    if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));

    if (inStockOnly) list = list.filter((p) => p.stock > 0);

    if (discountOnly) list = list.filter((p) => p.discount > 0);

    setFiltered(list);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/buyer/product/${item.productId}`)}
    >
      <Image
        source={{
          uri: item.images?.[0] || "https://via.placeholder.com/150?text=No+Image",
        }}
        style={styles.image}
      />

      <View style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.price}>₦{(item.price || 0).toLocaleString()}</Text>

        <View style={styles.stockRow}>
          <Text
            style={[
              styles.stock,
              { color: item.stock > 0 ? "#10B981" : "#DC2626" },
            ]}
          >
            {item.stock > 0 ? `${item.stock} left` : "Out of Stock"}
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

  // Banner scroll
  const handleBannerScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    setActiveBanner(Math.round(x / BANNER_WIDTH));
  };

  return (
    <View style={styles.container}>
      {/* FIXED HEADER AREA */}
      <View style={styles.stickyHeader}>
        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterSheetVisible(true)}
          >
            <Ionicons name="options-outline" size={20} color="#FFFFFF" />
            {activeFilters > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilters}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Chips */}
        <FlatList
          data={getCategories()}
          horizontal
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
          renderItem={({ item }) => {
            const active = selectedCategory === item;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[styles.categoryPill, active && styles.categoryPillActive]}
              >
                <Ionicons
                  name={CATEGORY_ICONS[item] || "pricetag-outline"}
                  size={15}
                  color={active ? "#fff" : "#6B7280"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.categoryPillText,
                    active && styles.categoryPillTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* SCROLLABLE CONTENT (BANNERS + PRODUCTS) */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 200, paddingTop: 125 }}
      >
        {/* Banner Slider */}
        <ScrollView
          horizontal
          pagingEnabled
          onScroll={handleBannerScroll}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
        >
          {MARKET_BANNERS.map((banner) => (
            <View
              key={banner.id}
              style={[styles.bannerCard, { backgroundColor: banner.bg }]}
            >
              <Text style={styles.bannerEmoji}>{banner.emoji}</Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.bannerDots}>
          {MARKET_BANNERS.map((b, idx) => (
            <View
              key={b.id}
              style={[
                styles.bannerDot,
                activeBanner === idx && styles.bannerDotActive,
              ]}
            />
          ))}
        </View>

        {/* PRODUCT GRID */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#7C3AED"
            style={{ marginTop: 40 }}
          />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try updating filters</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.productId}
            renderItem={renderProduct}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            columnWrapperStyle={{ justifyContent: "space-between" }}
          />
        )}
      </ScrollView>
    </View>
  );
}

//
// ==========  STYLES  =========
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F8FAFC",
  },

  /* -------------------------
      FIXED HEADER
  -------------------------- */
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F8FAFC",
    zIndex: 50,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },

  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 6,
  },
  searchBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 6,
    color: "#111827",
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  filterBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },

  // Category Chips
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: "#7C3AED",
    borderColor: "#7C3AED",
  },
  categoryPillText: {
    fontSize: 13,
    color: "#374151",
  },
  categoryPillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  /* -------------------------
      BANNER SLIDER
  -------------------------- */
  bannerCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerEmoji: {
    fontSize: 42,
    marginRight: 10,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#4B5563",
  },
  bannerDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  bannerDotActive: {
    backgroundColor: "#7C3AED",
    width: 20,
  },

  /* -------------------------
      PRODUCT CARDS
  -------------------------- */
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 140,
    backgroundColor: "#E5E7EB",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#7C3AED",
    marginTop: 2,
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  stock: {
    fontSize: 11,
    fontWeight: "500",
  },
  discountBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },

  // Empty
  emptyBox: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
