import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function BuyerPromotions() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ----------------------------------------------
     REFERRAL POPUP MODAL
  ------------------------------------------------*/
  const [referralVisible, setReferralVisible] = useState(false);

  /* ----------------------------------------------
     COUNTDOWN: Deal of the Day (expires in 6 hours)
  ------------------------------------------------*/
  const dealEndTime = Date.now() + 6 * 60 * 60 * 1000;
  const [countdown, setCountdown] = useState({});

  /* ----------------------------------------------
     Wishlist State
  ------------------------------------------------*/
  const [wishlist, setWishlist] = useState([]);

  /* ----------------------------------------------
     ANIMATIONS
  ------------------------------------------------*/
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* ----------------------------------------------
     Simulated promotional data
  ------------------------------------------------*/
  const [promotions, setPromotions] = useState({
    categories: [
      { id: 1, name: "Fashion", icon: "shirt-outline", color: "#F472B6" },
      { id: 2, name: "Electronics", icon: "tv-outline", color: "#60A5FA" },
      { id: 3, name: "Beauty", icon: "sparkles-outline", color: "#FBBF24" },
      { id: 4, name: "Home", icon: "home-outline", color: "#34D399" },
      { id: 5, name: "Groceries", icon: "fast-food-outline", color: "#F87171" },
      { id: 6, name: "Tech", icon: "hardware-chip-outline", color: "#A78BFA" },
    ],

    dealOfDay: {
      id: 999,
      title: "Deal of The Day",
      name: "Noise-Cancelling Headphones",
      price: 24000,
      oldPrice: 38000,
      discount: 36,
      image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800",
    },

    flashSales: [
      {
        id: 1,
        name: "Mini Bluetooth Speaker",
        price: 11500,
        oldPrice: 15000,
        discount: 23,
        image:
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
      },
      {
        id: 2,
        name: "Smart Fitness Band",
        price: 9800,
        oldPrice: 13000,
        discount: 25,
        image:
          "https://images.unsplash.com/photo-1606813902932-df3bb6c63238?w=400",
      },
      {
        id: 3,
        name: "Wireless Earbuds",
        price: 14500,
        oldPrice: 20000,
        discount: 28,
        image:
          "https://images.unsplash.com/photo-1590658165737-15a047b8b5e3?w=400",
      },
    ],

    trending: [
      {
        id: 1,
        name: "Gaming RGB Mouse",
        price: 8500,
        image:
          "https://images.unsplash.com/photo-1587202372775-989787bcb1de?w=400",
      },
      {
        id: 2,
        name: "Designer Sneakers",
        price: 15000,
        image:
          "https://images.unsplash.com/photo-1528701800489-20be30f89a1f?w=400",
      },
      {
        id: 3,
        name: "Smart Watch Series 7",
        price: 38000,
        image:
          "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400",
      },
    ],
  });

  /* ----------------------------------------------
     COUNTDOWN TIMER
  ------------------------------------------------*/
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = dealEndTime - now;

      if (diff <= 0) {
        setCountdown({ expired: true });
        clearInterval(timer);
        return;
      }

      setCountdown({
        hrs: Math.floor(diff / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const comingSoon = () =>
    Alert.alert("Coming Soon", "This feature is under development.");

  /* ----------------------------------------------
     WISHLIST + CART HANDLERS
  ------------------------------------------------*/
  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const addToCart = () =>
    Alert.alert("Cart", "Item added to cart successfully!");

  /* ----------------------------------------------
     REFERRAL SHARE
  ------------------------------------------------*/
  const shareReferral = async () => {
    try {
      await Share.share({
        message:
          "Join Ready9ja and get ₦2000 coupon on your first order!\nhttps://ready9ja.com/ref/BUY123",
      });
    } catch (e) {
      Alert.alert("Error", "Failed to share referral link.");
    }
  };

  /* ----------------------------------------------
     LOAD ANIM + REFRESH
  ------------------------------------------------*/
  useEffect(() => {
    setTimeout(() => setLoading(false), 900);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading promotions...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#7C3AED"]} />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Promotions</Text>

          <TouchableOpacity onPress={comingSoon}>
            <Ionicons name="notifications-outline" size={26} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        {/* CATEGORY GRID */}
        <Text style={styles.sectionTitle}>Categories</Text>

        <View style={styles.categoryGrid}>
          {promotions.categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryBox, { backgroundColor: cat.color + "20" }]}
              onPress={comingSoon}
            >
              <Ionicons name={cat.icon} size={28} color={cat.color} />
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* DEAL OF THE DAY */}
        <Text style={styles.sectionTitle}>Deal of the Day</Text>

        <Animated.View
          style={[
            styles.dealCard,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Image
            source={{ uri: promotions.dealOfDay.image }}
            style={styles.dealImage}
          />

          <View style={styles.dealInfo}>
            <Text style={styles.dealName}>{promotions.dealOfDay.name}</Text>

            <View style={styles.dealPriceRow}>
              <Text style={styles.dealPrice}>
                ₦{promotions.dealOfDay.price.toLocaleString()}
              </Text>
              <Text style={styles.dealOldPrice}>
                ₦{promotions.dealOfDay.oldPrice.toLocaleString()}
              </Text>
            </View>

            <Text style={styles.dealDiscount}>
              {promotions.dealOfDay.discount}% OFF
            </Text>

            <View style={styles.countdownBox}>
              {countdown.expired ? (
                <Text style={styles.countdownExpired}>Expired</Text>
              ) : (
                <Text style={styles.countdownText}>
                  {countdown.hrs}h : {countdown.mins}m : {countdown.secs}s
                </Text>
              )}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.dealButtons}>
            <TouchableOpacity
              style={styles.wishlistBtn}
              onPress={() => toggleWishlist(promotions.dealOfDay.id)}
            >
              <Ionicons
                name={
                  wishlist.includes(promotions.dealOfDay.id)
                    ? "heart"
                    : "heart-outline"
                }
                size={20}
                color="#EF4444"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartBtn} onPress={addToCart}>
              <Ionicons name="cart-outline" size={20} color="#fff" />
              <Text style={styles.cartBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* FLASH SALES */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Flash Sales</Text>
          <TouchableOpacity onPress={comingSoon}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {promotions.flashSales.map((item) => (
            <View key={item.id} style={styles.flashCard}>
              <Image source={{ uri: item.image }} style={styles.flashImg} />

              <Text style={styles.flashName} numberOfLines={1}>
                {item.name}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.newPrice}>₦{item.price.toLocaleString()}</Text>
                <Text style={styles.oldPrice}>₦{item.oldPrice.toLocaleString()}</Text>
              </View>

              <Animated.View
                style={[
                  styles.discountBadge,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Text style={styles.discountText}>{item.discount}% OFF</Text>
              </Animated.View>

              <TouchableOpacity
                onPress={() => toggleWishlist(item.id)}
                style={styles.smallWishlist}
              >
                <Ionicons
                  name={wishlist.includes(item.id) ? "heart" : "heart-outline"}
                  size={18}
                  color="#DC2626"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.smallCartBtn} onPress={addToCart}>
                <Ionicons name="cart-outline" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Trending */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          <TouchableOpacity onPress={comingSoon}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {promotions.trending.map((item) => (
            <View key={item.id} style={styles.trendCard}>
              <Image source={{ uri: item.image }} style={styles.trendImg} />
              <Text style={styles.trendName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.trendPrice}>₦{item.price.toLocaleString()}</Text>

              <TouchableOpacity
                style={styles.wishlistTrendBtn}
                onPress={() => toggleWishlist(item.id)}
              >
                <Ionicons
                  name={
                    wishlist.includes(item.id) ? "heart" : "heart-outline"
                  }
                  size={18}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Invite Friends Section */}
        <Text style={styles.sectionTitle}>Invite & Earn</Text>

        <TouchableOpacity
          style={styles.referralCard}
          onPress={() => setReferralVisible(true)}
        >
          <Ionicons name="gift-outline" size={42} color="#7C3AED" />
          <Text style={styles.referralTitle}>Earn ₦2000 Per Friend</Text>
          <Text style={styles.referralText}>
            Invite your friends and both of you get rewards.
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* REFERRAL POPUP */}
      <Modal visible={referralVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setReferralVisible(false)}
            >
              <Ionicons name="close" size={22} color="#444" />
            </TouchableOpacity>

            <Ionicons
              name="gift-outline"
              size={70}
              color="#7C3AED"
              style={{ alignSelf: "center", marginBottom: 10 }}
            />

            <Text style={styles.modalTitle}>Invite Friends & Earn</Text>

            <Text style={styles.modalDesc}>
              Share your referral link with friends and earn up to{" "}
              <Text style={{ fontWeight: "700" }}>₦2000</Text> per invite.
            </Text>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={shareReferral}
            >
              <Ionicons name="share-social-outline" size={22} color="#fff" />
              <Text style={styles.shareBtnText}>Share Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ============================================================
   BUYER PROMOTIONS STYLE SHEET
============================================================= */
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12, backgroundColor: "#F8FAFC" },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: "#6B7280" },

  header: {
    marginTop: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },

  /* CATEGORY GRID */
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 18, marginBottom: 10 },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
  },
  categoryBox: {
    width: "30%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryText: { marginTop: 6, fontWeight: "600", color: "#374151" },

  /* DEAL OF THE DAY */
  dealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    elevation: 3,
    marginBottom: 20,
  },
  dealImage: { width: "100%", height: 180, borderRadius: 12, marginBottom: 10 },
  dealInfo: { marginBottom: 10 },
  dealName: { fontSize: 16, fontWeight: "700", color: "#111" },

  dealPriceRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  dealPrice: { fontSize: 20, fontWeight: "800", color: "#7C3AED" },
  dealOldPrice: {
    fontSize: 14,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginTop: 3,
  },

  dealDiscount: { color: "#DC2626", fontWeight: "700", marginTop: 4 },

  countdownBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#7C3AED",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  countdownText: { fontSize: 14, fontWeight: "700", color: "#7C3AED" },
  countdownExpired: { color: "red", fontWeight: "700" },

  /* Deal Buttons */
  dealButtons: { flexDirection: "row", gap: 10 },
  wishlistBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#F3E8FF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBtn: {
    flexDirection: "row",
    backgroundColor: "#7C3AED",
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
    height: 40,
  },
  cartBtnText: { color: "#fff", fontWeight: "700" },

  /* FLASH SALES */
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  seeAll: { color: "#7C3AED", fontWeight: "600" },

  flashCard: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginRight: 14,
    elevation: 2,
  },
  flashImg: {
    width: "100%",
    height: 105,
    borderRadius: 10,
    marginBottom: 10,
  },
  flashName: { fontWeight: "600", marginBottom: 4 },

  priceRow: { flexDirection: "row", gap: 6 },
  newPrice: { color: "#7C3AED", fontWeight: "700" },
  oldPrice: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    marginTop: 2,
  },

  discountBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  smallWishlist: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    elevation: 4,
  },
  smallCartBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#7C3AED",
    borderRadius: 20,
    padding: 6,
  },

  /* TRENDING */
  trendCard: {
    width: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    elevation: 2,
  },
  trendImg: {
    width: "100%",
    height: 105,
    borderRadius: 10,
    marginBottom: 8,
  },
  trendName: { fontWeight: "600" },
  trendPrice: { color: "#7C3AED", fontWeight: "700", marginTop: 2 },

  wishlistTrendBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFFFFF",
    padding: 4,
    borderRadius: 50,
    elevation: 3,
  },

  /* REFERRAL */
  referralCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    elevation: 2,
    alignItems: "center",
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  referralText: {
    fontSize: 14,
    marginTop: 6,
    color: "#6B7280",
    textAlign: "center",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modalClose: {
    alignSelf: "flex-end",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "center",
  },
  modalDesc: {
    marginTop: 10,
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  shareBtn: {
    backgroundColor: "#7C3AED",
    padding: 14,
    marginTop: 26,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    alignItems: "center",
  },
  shareBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
