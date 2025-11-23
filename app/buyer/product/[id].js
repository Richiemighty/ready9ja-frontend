// app/buyer/product/[id].js
import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../../../constants/api";
import { useCart } from "../../../contexts/CartContext";

const { width } = Dimensions.get("window");

// Fallback cart functions in case context fails
const fallbackCart = {
  addToCart: async (product) => {
    try {
      alert(`${product.name} has been added to cart!`);
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item to cart. Please try again.");
      return false;
    }
  },
  addToFavorites: (product) => {
    alert(`${product.name} has been added to your favorites!`);
  },
};

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Try to use cart context, fallback to local functions if it fails
  let cartFunctions;
  try {
    cartFunctions = useCart();
  } catch (error) {
    console.warn("CartContext not available, using fallback:", error);
    cartFunctions = fallbackCart;
  }

  const { addToCart, addToFavorites } = cartFunctions;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Alerts
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const alertSlideAnim = useRef(new Animated.Value(-120)).current;

  // Live request modal
  const [showLiveRequestModal, setShowLiveRequestModal] = useState(false);

  // Page animation & parallax header
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(30)).current;

  // IMPORTANT: scrollY is an Animated.Value (NOT a ref object)
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchProduct();

    // Entrance animation
    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslate, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, [id]);

  const showCustomAlert = (title, message, type = "success") => {
    setAlertConfig({
      title,
      message,
      type,
      icon:
        type === "success"
          ? "checkmark-circle"
          : type === "error"
          ? "close-circle"
          : type === "warning"
          ? "warning"
          : "information",
    });
    setShowAlert(true);

    alertSlideAnim.setValue(-120);
    Animated.timing(alertSlideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(hideAlert, 2600);
    });
  };

  const hideAlert = () => {
    Animated.timing(alertSlideAnim, {
      toValue: -120,
      duration: 230,
      useNativeDriver: true,
    }).start(() => setShowAlert(false));
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      const prod = res.data?.product || res.data;

      if (!prod) {
        throw new Error("Product not found");
      }

      setProduct(prod);
    } catch (err) {
      console.warn("Error fetching product:", err.message);
      showCustomAlert("Error", "Product not found!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      showCustomAlert(
        "Out of Stock",
        "This product is currently out of stock.",
        "warning"
      );
      return;
    }

    try {
      const success = await addToCart({
        ...product,
        quantity,
      });

      if (success) {
        showCustomAlert(
          "Added to Cart",
          `${product.name} has been added to your cart!`,
          "success"
        );
      }
    } catch (error) {
      showCustomAlert(
        "Error",
        "Failed to add item to cart. Please try again.",
        "error"
      );
    }
  };

  const handleAddToFavorites = () => {
    addToFavorites(product);
    showCustomAlert(
      "Added to Favorites",
      `${product.name} has been added to your favorites!`,
      "success"
    );
  };

  const handleLiveRequest = () => {
    setShowLiveRequestModal(true);
  };

  const submitLiveRequest = () => {
    setShowLiveRequestModal(false);
    showCustomAlert(
      "Request Sent",
      "Your request for live pictures / video has been sent to the seller.",
      "success"
    );
  };

  const handleSellerProfile = () => {
    if (product?.business) {
      router.push(`/buyer/seller/${product.business.id}`);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const headerHeight = 380;

  // PARALLAX INTERPOLATIONS (scrollY is a real Animated.Value)
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -120],
    extrapolate: "clamp",
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: [1.25, 1, 1],
    extrapolateLeft: "extend",
    extrapolateRight: "clamp",
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Ionicons name="sad-outline" size={64} color="#DC2626" />
        <Text style={styles.error}>Product Not Found</Text>
        <Text style={styles.errorSubtext}>
          The product you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasDiscount = product.discount && product.discount > 0;
  const originalPrice =
    hasDiscount &&
    product.price / (1 - Number(product.discount || 0) / 100 || 1);

  return (
    <View style={styles.container}>
      {/* Top Alert */}
      <Modal visible={showAlert} transparent animationType="none">
        <View pointerEvents="none" style={styles.alertOverlay}>
          <Animated.View
            style={[
              styles.alertContainer,
              {
                transform: [{ translateY: alertSlideAnim }],
                borderLeftColor:
                  alertConfig.type === "success"
                    ? "#10B981"
                    : alertConfig.type === "error"
                    ? "#DC2626"
                    : alertConfig.type === "warning"
                    ? "#F59E0B"
                    : "#7C3AED",
              },
            ]}
          >
            <View
              style={[
                styles.alertIcon,
                {
                  backgroundColor:
                    alertConfig.type === "success"
                      ? "#10B981"
                      : alertConfig.type === "error"
                      ? "#DC2626"
                      : alertConfig.type === "warning"
                      ? "#F59E0B"
                      : "#7C3AED",
                },
              ]}
            >
              <Ionicons name={alertConfig.icon} size={22} color="#fff" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            </View>
            <TouchableOpacity onPress={hideAlert} style={styles.alertClose}>
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Live Request Modal */}
      <Modal visible={showLiveRequestModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Live View</Text>
              <TouchableOpacity
                onPress={() => setShowLiveRequestModal(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="videocam-outline" size={32} color="#7C3AED" />
              </View>
              <Text style={styles.modalDescription}>
                Ask the seller for{" "}
                <Text style={{ fontWeight: "700", color: "#111827" }}>
                  live photos or a quick video
                </Text>{" "}
                so you can inspect the product before checkout.
              </Text>

              <View style={styles.requestDetails}>
                <View style={styles.requestItem}>
                  <Text style={styles.requestLabel}>Product</Text>
                  <Text style={styles.requestValue}>{product.name}</Text>
                </View>
                <View style={styles.requestItem}>
                  <Text style={styles.requestLabel}>Seller</Text>
                  <Text style={styles.requestValue}>
                    {product.business?.name || "Unknown seller"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="modal-actions" style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelRequestButton}
                onPress={() => setShowLiveRequestModal(false)}
              >
                <Text style={styles.cancelRequestText}>Not now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitRequestButton}
                onPress={submitLiveRequest}
              >
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitRequestText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* HEADER IMAGE WITH PARALLAX */}
      <Animated.View
        style={[
          styles.headerImageWrapper,
          {
            height: headerHeight,
            transform: [{ translateY: headerTranslateY }, { scale: headerScale }],
          },
        ]}
      >
        <Image
          source={{
            uri:
              product.images?.[selectedImage] ||
              "https://via.placeholder.com/400x300?text=No+Image",
          }}
          style={styles.mainImage}
          resizeMode="cover"
        />

        {/* Gradient overlay */}
        <View style={styles.headerGradient} />

        {/* Top bar: back + icons */}
        <View style={styles.headerTopBar}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color="#111827" />
          </TouchableOpacity>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={handleAddToFavorites}
            >
              <Ionicons name="heart-outline" size={20} color="#DC2626" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() =>
                showCustomAlert(
                  "Share",
                  "Product sharing feature coming soon!",
                  "info"
                )
              }
            >
              <Ionicons name="share-social-outline" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating badges */}
        <View style={styles.badgeRow}>
          {hasDiscount && (
            <View style={styles.discountBadgeHero}>
              <Ionicons name="pricetag-outline" size={16} color="#fff" />
              <Text style={styles.discountBadgeText}>
                Save {product.discount}%
              </Text>
            </View>
          )}

          <View style={styles.stockPill}>
            <View
              style={[
                styles.stockDot,
                {
                  backgroundColor:
                    product.stock > 0 ? "#4ADE80" : "#F97373",
                },
              ]}
            />
            <Text style={styles.stockPillText}>
              {product.stock > 0 ? "In stock" : "Out of stock"}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* CONTENT */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        <Animated.View
          style={{
            opacity: contentFade,
            transform: [{ translateY: contentTranslate }],
          }}
        >
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailContainer}
            >
              {product.images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  style={[
                    styles.thumbnail,
                    selectedImage === index && styles.thumbnailActive,
                  ]}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Card: Title + Price */}
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.brandbadgeText}>
                  Ready9ja • Verified Seller
                </Text>
                <Text style={styles.name}>{product.name}</Text>
              </View>

              <View style={styles.ratingChip}>
                <Ionicons name="star" size={14} color="#FACC15" />
                <Text style={styles.ratingChipText}>4.5</Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ₦{product.price?.toLocaleString()}
              </Text>

              {hasDiscount && (
                <View style={styles.priceRight}>
                  <Text style={styles.originalPrice}>
                    ₦{originalPrice?.toLocaleString()}
                  </Text>
                  <View style={styles.discountMini}>
                    <Text style={styles.discountMiniText}>
                      -{product.discount}%
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.metaInline}>
              <View style={styles.metaChip}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#10B981"
                />
                <Text style={styles.metaChipText}>Buyer Protection</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="rocket-outline" size={14} color="#7C3AED" />
                <Text style={styles.metaChipText}>Fast Delivery</Text>
              </View>
            </View>
          </View>

          {/* Card: Quantity & stock */}
          <View style={styles.card}>
            <View style={styles.quantityHeaderRow}>
              <Text style={styles.sectionTitle}>Order Details</Text>
              <Text style={styles.stockText}>
                {product.stock} item{product.stock === 1 ? "" : "s"} left
              </Text>
            </View>

            {product.stock > 0 ? (
              <View style={styles.quantityRow}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantitySelector}>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      quantity <= 1 && styles.quantityButtonDisabled,
                    ]}
                    onPress={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Ionicons
                      name="remove"
                      size={16}
                      color={quantity <= 1 ? "#9CA3AF" : "#111827"}
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity
                    style={[
                      styles.quantityButton,
                      quantity >= product.stock && styles.quantityButtonDisabled,
                    ]}
                    onPress={incrementQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <Ionicons
                      name="add"
                      size={16}
                      color={quantity >= product.stock ? "#9CA3AF" : "#111827"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.outOfStockBanner}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#DC2626"
                />
                <Text style={styles.outOfStockText}>
                  This item is currently out of stock.
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated total</Text>
              <Text style={styles.totalValue}>
                ₦{(product.price * quantity).toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Card: Description */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Card: Product metadata */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Product Details</Text>

            <View style={styles.metaRow}>
              <Feather name="hash" size={16} color="#7C3AED" />
              <Text style={styles.metaLabel}>SKU</Text>
              <Text style={styles.metaValue}>{product.sku || "N/A"}</Text>
            </View>

            {product.tags && (
              <View style={styles.metaRow}>
                <Feather name="tag" size={16} color="#7C3AED" />
                <Text style={styles.metaLabel}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {product.tags.split(",").map((tag, index) => (
                    <View key={index} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag.trim()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {product.categories && product.categories.length > 0 && (
              <View style={styles.metaRow}>
                <Feather name="grid" size={16} color="#7C3AED" />
                <Text style={styles.metaLabel}>Categories</Text>
                <View style={styles.tagsContainer}>
                  {product.categories.map((category, index) => (
                    <View key={index} style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{category.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Seller card */}
          {product.business && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Seller</Text>
              <TouchableOpacity
                style={styles.sellerCard}
                onPress={handleSellerProfile}
              >
                <View style={styles.sellerHeader}>
                  <View style={styles.sellerAvatar}>
                    {product.business.businessImage ? (
                      <Image
                        source={{ uri: product.business.businessImage }}
                        style={styles.sellerImage}
                      />
                    ) : (
                      <Feather name="store" size={20} color="#7C3AED" />
                    )}
                  </View>
                  <View style={styles.sellerInfo}>
                    <Text style={styles.sellerName}>
                      {product.business.name}
                    </Text>
                    <View style={styles.sellerLocation}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#6B7280"
                      />
                      <Text style={styles.sellerLocationText}>
                        {product.business.location_city},{" "}
                        {product.business.location_state}
                      </Text>
                    </View>
                    <View style={styles.sellerStats}>
                      <Text style={styles.sellerRating}>⭐ 4.5</Text>
                      <Text style={styles.sellerDot}>•</Text>
                      <Text style={styles.sellerSales}>100+ sales</Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#9CA3AF"
                  />
                </View>

                <View style={styles.sellerActions}>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() =>
                      router.push(`/buyer/chat/${product.createdBy}`)
                    }
                  >
                    <Ionicons
                      name="chatbubble-ellipses-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.liveRequestButton}
                    onPress={handleLiveRequest}
                  >
                    <Ionicons
                      name="videocam-outline"
                      size={18}
                      color="#7C3AED"
                    />
                    <Text style={styles.liveRequestText}>Live View</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Animated.ScrollView>

      {/* Sticky bottom bar */}
      <View
        style={[
          styles.actionSection,
          Platform.OS === "ios" && { paddingBottom: 20 },
        ]}
      >
        <TouchableOpacity
          style={styles.bottomIconButton}
          onPress={handleAddToFavorites}
        >
          <Ionicons name="heart-outline" size={20} color="#DC2626" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomIconButton}
          onPress={() =>
            showCustomAlert(
              "Share",
              "Product sharing feature coming soon!",
              "info"
            )
          }
        >
          <Ionicons
            name="share-social-outline"
            size={20}
            color="#7C3AED"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cartButton,
            product.stock === 0 && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Ionicons
            name="cart"
            size={20}
            color={product.stock === 0 ? "#9CA3AF" : "#fff"}
          />
          <Text
            style={[
              styles.cartButtonText,
              product.stock === 0 && styles.disabledButtonText,
            ]}
          >
            {product.stock === 0
              ? "Out of Stock"
              : `Add to Cart • ₦${(
                  product.price * quantity
                ).toLocaleString()}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

//
// STYLES
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollView: {
    flex: 1,
    marginTop: 360, // below header image
  },

  // Centered states
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  error: {
    color: "#DC2626",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  errorSubtext: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 10,
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 6,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // Header Image / Hero
  headerImageWrapper: {
    position: "absolute",
    top: 0,
    width,
    overflow: "hidden",
    backgroundColor: "#111827",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  mainImage: {
    width,
    height: 380,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  headerTopBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 28,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  headerRightIcons: {
    flexDirection: "row",
    gap: 10,
  },
  badgeRow: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discountBadgeHero: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(220,38,38,0.96)",
    gap: 4,
  },
  discountBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  stockPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.85)",
    gap: 6,
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  stockPillText: {
    color: "#E5E7EB",
    fontSize: 12,
    fontWeight: "500",
  },

  // Alert
  alertOverlay: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderLeftWidth: 4,
    width: "92%",
    maxWidth: 420,
  },
  alertIcon: {
    width: 34,
    height: 34,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 13,
    color: "#6B7280",
  },
  alertClose: {
    paddingLeft: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
    alignItems: "center",
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalDescription: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  requestDetails: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  requestItem: {
    marginBottom: 10,
  },
  requestLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 2,
  },
  requestValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  cancelRequestButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  cancelRequestText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  submitRequestButton: {
    flex: 1.6,
    backgroundColor: "#7C3AED",
    paddingVertical: 12,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  submitRequestText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // Thumbnails
  thumbnailContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 12,
    marginRight: 10,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: "#7C3AED",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Title & Price
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  brandbadgeText: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 24,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF9C3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },
  ratingChipText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },

  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  price: {
    fontSize: 26,
    fontWeight: "800",
    color: "#7C3AED",
  },
  priceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  originalPrice: {
    fontSize: 14,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    fontWeight: "500",
  },
  discountMini: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  discountMiniText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  metaInline: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metaChipText: {
    fontSize: 11,
    marginLeft: 4,
    color: "#4B5563",
    fontWeight: "500",
  },

  // Section titles
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },

  // Quantity card
  quantityHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stockText: {
    fontSize: 12,
    color: "#6B7280",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  quantityLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quantityButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityValue: {
    minWidth: 34,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  outOfStockBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 10,
    gap: 6,
    marginBottom: 8,
  },
  outOfStockText: {
    fontSize: 13,
    color: "#B91C1C",
  },
  totalRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  // Description
  description: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },

  // Meta info
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
    marginRight: 10,
    width: 80,
  },
  metaValue: {
    fontSize: 13,
    color: "#4B5563",
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
  },
  tagBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    color: "#374151",
  },
  categoryBadge: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryText: {
    fontSize: 11,
    color: "#7C3AED",
    fontWeight: "500",
  },

  // Seller card
  sellerCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  sellerImage: {
    width: "100%",
    height: "100%",
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  sellerLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  sellerLocationText: {
    fontSize: 12,
    color: "#6B7280",
  },
  sellerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  sellerRating: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
  },
  sellerDot: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  sellerSales: {
    fontSize: 12,
    color: "#6B7280",
  },
  sellerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  chatButton: {
    flex: 1.4,
    backgroundColor: "#10B981",
    borderRadius: 999,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  liveRequestButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#7C3AED",
    backgroundColor: "#F5F3FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  liveRequestText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7C3AED",
  },

  // Bottom bar
  actionSection: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
    gap: 10,
  },
  bottomIconButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  cartButton: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "#7C3AED",
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
  },
  cartButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
});
