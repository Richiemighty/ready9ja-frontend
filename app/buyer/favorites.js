// import { useRouter } from "expo-router";
// import { useContext } from "react";
// import { FlatList, Text, View } from "react-native";
// import ProductCard from "../../components/ProductCard";
// import { CartContext } from "../../contexts/CartContext";

// export default function Favorites() {
//   const { favorites } = useContext(CartContext);
//   const router = useRouter();

//   return (
//     <View style={{ flex: 1, padding: 12 }}>
//       <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Favorites</Text>

//       <FlatList
//         data={favorites}
//         keyExtractor={(i) => String(i.id)}
//         renderItem={({ item }) => <ProductCard product={item} onPress={() => router.push(`/buyer/product/${item.id}`)} />}
//         ListEmptyComponent={<Text style={{ color: "#666" }}>No favorites yet</Text>}
//       />
//     </View>
//   );
// }
