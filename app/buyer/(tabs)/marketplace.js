// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
// } from "react-native";
// import api from "../../../constants/api";
// import ProductCard from "../../../components/ProductCard";
// import HeaderRightProfile from "../../../components/HeaderRightProfile";
// import { useRouter } from "expo-router";

// export default function Marketplace({ navigation }) {
//   const router = useRouter();
//   React.useLayoutEffect(() => {
//     navigation?.setOptions?.({
//       headerRight: () => <HeaderRightProfile />,
//     });
//   }, [navigation]);

//   const [products, setProducts] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [query, setQuery] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [categories, setCategories] = useState([]);

//   useEffect(() => {
//     loadProducts();
//     loadCategories();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [query, categoryFilter, products]);

//   const loadProducts = async () => {
//     setLoading(true);
//     try {
//       // Endpoint assumed: GET /products
//       const res = await api.get("/products");
//       setProducts(res.data || []);
//     } catch (err) {
//       console.warn("Failed to load products:", err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadCategories = async () => {
//     try {
//       const res = await api.get("/categories");
//       setCategories(res.data || []);
//     } catch (err) {
//       // if no categories endpoint, derive from products
//       const setFromProducts = (arr) =>
//         Array.from(new Set(arr.map((p) => p.category?.name || "Uncategorized")));
//       setCategories(setFromProducts(products));
//     }
//   };

//   const applyFilters = () => {
//     let list = [...products];
//     if (query?.trim()) {
//       const q = query.toLowerCase();
//       list = list.filter(
//         (p) =>
//           (p.name || "").toLowerCase().includes(q) ||
//           (p.description || "").toLowerCase().includes(q)
//       );
//     }
//     if (categoryFilter) {
//       list = list.filter((p) => (p.category?.name || p.category) === categoryFilter);
//     }
//     setFiltered(list);
//   };

//   const renderItem = ({ item }) => (
//     <ProductCard
//       product={item}
//       onPress={() => router.push(`/buyer/product/${item.id}`)}
//     />
//   );

//   return (
//     <View style={styles.container}>
//       <View style={styles.searchRow}>
//         <TextInput
//           placeholder="Search products or keywords..."
//           placeholderTextColor="#999"
//           value={query}
//           onChangeText={setQuery}
//           style={styles.searchInput}
//         />
//         <TouchableOpacity
//           style={styles.filterBtn}
//           onPress={() =>
//             setCategoryFilter(categoryFilter ? null : categories[0] || null)
//           }
//         >
//           <Text style={{ color: "white" }}>Filter</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.categoriesRow}>
//         <FlatList
//           data={["All", ...categories]}
//           horizontal
//           keyExtractor={(i, idx) => `${i}-${idx}`}
//           showsHorizontalScrollIndicator={false}
//           renderItem={({ item }) => {
//             const active = (categoryFilter || "All") === item || (item === "All" && !categoryFilter);
//             return (
//               <TouchableOpacity
//                 onPress={() => setCategoryFilter(item === "All" ? null : item)}
//                 style={[styles.categoryChip, active && styles.categoryChipActive]}
//               >
//                 <Text style={active ? styles.categoryTextActive : styles.categoryText}>
//                   {item}
//                 </Text>
//               </TouchableOpacity>
//             );
//           }}
//         />
//       </View>

//       {loading ? (
//         <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#7C3AED" />
//       ) : (
//         <FlatList
//           data={filtered}
//           keyExtractor={(item) => String(item.id)}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 120 }}
//           showsVerticalScrollIndicator={false}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 12, backgroundColor: "#F8FAFC" },
//   searchRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
//   searchInput: {
//     flex: 1,
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   filterBtn: {
//     backgroundColor: "#7C3AED",
//     paddingHorizontal: 14,
//     justifyContent: "center",
//     borderRadius: 10,
//   },
//   categoriesRow: { marginBottom: 10 },
//   categoryChip: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: "#eee",
//   },
//   categoryChipActive: {
//     backgroundColor: "#7C3AED",
//   },
//   categoryText: { color: "#333" },
//   categoryTextActive: { color: "#fff" },
// });

import api from "@/constants/api";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import HeaderRightProfile from "../../../components/HeaderRightProfile";
import ProductCard from "../../../components/ProductCard";

export default function Marketplace({ navigation }) {
  const router = useRouter();

  // Set header profile icon
  React.useLayoutEffect(() => {
    navigation?.setOptions?.({
      headerRight: () => <HeaderRightProfile />,
      headerTitle: "Marketplace",
    });
  }, [navigation]);

  // Local state
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Mock data (since we’re not fetching from backend yet)
  // const mockProducts = [
  //   {
  //     id: 1,
  //     name: "Wireless Headphones",
  //     description: "Noise cancelling over-ear headphones",
  //     category: "Electronics",
  //     price: 25000,
  //     stock: 10,
  //     seller: { name: "AudioMax", rating: 4.5 },
  //     image: "https://via.placeholder.com/200x200.png?text=Headphones",
  //   },
  //   {
  //     id: 2,
  //     name: "Classic Leather Wallet",
  //     description: "Stylish and durable men’s wallet",
  //     category: "Fashion",
  //     price: 7500,
  //     stock: 25,
  //     seller: { name: "StyleHouse", rating: 4.3 },
  //     image: "https://via.placeholder.com/200x200.png?text=Wallet",
  //   },
  //   {
  //     id: 3,
  //     name: "Bluetooth Speaker",
  //     description: "Portable speaker with deep bass",
  //     category: "Electronics",
  //     price: 18000,
  //     stock: 12,
  //     seller: { name: "SoundVibe", rating: 4.7 },
  //     image: "https://via.placeholder.com/200x200.png?text=Speaker",
  //   },
  //   {
  //     id: 4,
  //     name: "Organic Body Lotion",
  //     description: "Moisturizing lotion for dry skin",
  //     category: "Beauty",
  //     price: 5500,
  //     stock: 40,
  //     seller: { name: "GlowCare", rating: 4.2 },
  //     image: "https://via.placeholder.com/200x200.png?text=Lotion",
  //   },
  // ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("/products");
      if (response.status === 200) {
        setProducts(response.data.products);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) alert(error.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    // simulate loading
    setTimeout(() => {
      setProducts(products);
      const cats = Array.from(
        new Set(products.flatMap((p) => p.categories.map((c) => c.name.trim())))
      );
      setCategories(cats);
      setFiltered(products);
      setLoading(false);
    }, 1000);
  }, [products]);

  useEffect(() => {
    applyFilters();
  }, [query, categoryFilter, products]);

  const applyFilters = () => {
    let list = [...products];

    const q = query.trim().toLowerCase();
    const cat = categoryFilter?.toLowerCase();

    // Filter by search query
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false)
      );
    }

    // Filter by category name
    if (cat) {
      list = list.filter((p) => {
        if (!Array.isArray(p.categories)) return false;
        return p.categories.some((c) => c.name.toLowerCase().includes(cat));
      });
    }

    setFiltered(list);
  };

  const renderItem = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => router.push(`/buyer/product/${item.productId}`)}
    />
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchProducts} />
        }
      ></ScrollView>
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
          onPress={() => setCategoryFilter(null)}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoriesRow}>
        <FlatList
          data={["All", ...categories]}
          horizontal
          keyExtractor={(i, idx) => `${i}-${idx}`}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const active =
              (categoryFilter || "All") === item ||
              (item === "All" && !categoryFilter);
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

      {loading ? (
        <ActivityIndicator
          style={{ marginTop: 40 }}
          size="large"
          color="#7C3AED"
        />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ color: "#555" }}>No products found 😔</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: "#F8FAFC" },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  filterBtn: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 10,
  },
  categoriesRow: { marginBottom: 10 },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  categoryChipActive: { backgroundColor: "#7C3AED" },
  categoryText: { color: "#333" },
  categoryTextActive: { color: "#fff" },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
});
