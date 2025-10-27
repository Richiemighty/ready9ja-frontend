import { Feather, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import api from "../../../constants/api";
import { CartContext } from "../../../contexts/CartContext";

const { width } = Dimensions.get("window");

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, addToFavorites } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [showLiveRequestModal, setShowLiveRequestModal] = useState(false);

  const slideAnim = useState(new Animated.Value(300))[0];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const showCustomAlert = (title, message, type = "success") => {
    setAlertConfig({
      title,
      message,
      type,
      icon: type === "success" ? "checkmark-circle" : 
            type === "error" ? "close-circle" : 
            type === "warning" ? "warning" : "information"
    });
    setShowAlert(true);
    
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      hideAlert();
    }, 3000);
  };

  const hideAlert = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAlert(false);
    });
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
      if (prod.createdBy) {
        fetchSeller(prod.createdBy);
      }
    } catch (err) {
      console.warn("Error fetching product:", err.message);
      showCustomAlert("Error", "Product not found!", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSeller = async (sellerId) => {
    try {
      const res = await api.get(`/sellers/${sellerId}`);
      if (res.data?.seller) {
        setSeller(res.data.seller);
      } else if (res.data) {
        setSeller(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch seller info:", err.message);
    }
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      showCustomAlert("Out of Stock", "This product is currently out of stock.", "warning");
      return;
    }
    
    const itemToAdd = {
      ...product,
      quantity: quantity
    };
    
    addToCart(itemToAdd);
    showCustomAlert("Added to Cart", `${product.name} has been added to your cart!`, "success");
  };

  const handleAddToFavorites = () => {
    addToFavorites(product);
    showCustomAlert("Added to Favorites", `${product.name} has been added to your favorites!`, "success");
  };

  const handleLiveRequest = () => {
    setShowLiveRequestModal(true);
  };

  const submitLiveRequest = () => {
    setShowLiveRequestModal(false);
    showCustomAlert("Request Sent", "Your request for live pictures/video has been sent to the seller. They will contact you shortly.", "success");
  };

  const handleSellerProfile = () => {
    if (seller) {
      router.push(`/buyer/seller/${seller.userId || seller.id}`);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading Product Details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Ionicons name="sad-outline" size={64} color="#DC2626" />
        <Text style={styles.error}>Product Not Found</Text>
        <Text style={styles.errorSubtext}>The product you're looking for doesn't exist or has been removed.</Text>
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

  return (
    <View style={styles.container}>
      {/* Custom Alert */}
      <Modal
        visible={showAlert}
        transparent={true}
        animationType="none"
      >
        <View style={styles.alertOverlay}>
          <Animated.View 
            style={[
              styles.alertContainer,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={[
              styles.alertIcon,
              { backgroundColor: alertConfig.type === "success" ? "#10B981" : 
                              alertConfig.type === "error" ? "#DC2626" : 
                              alertConfig.type === "warning" ? "#F59E0B" : "#7C3AED" }
            ]}>
              <Ionicons 
                name={alertConfig.icon} 
                size={24} 
                color="#fff" 
              />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            </View>
            <TouchableOpacity onPress={hideAlert} style={styles.alertClose}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Live Request Modal */}
      <Modal
        visible={showLiveRequestModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Live Pictures/Video</Text>
              <TouchableOpacity 
                onPress={() => setShowLiveRequestModal(false)}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Ionicons name="videocam" size={48} color="#7C3AED" style={styles.modalIcon} />
              <Text style={styles.modalDescription}>
                Request real-time photos or a video call to see this product in detail before purchasing.
              </Text>
              
              <View style={styles.requestDetails}>
                <Text style={styles.requestLabel}>Product:</Text>
                <Text style={styles.requestValue}>{product.name}</Text>
                
                <Text style={styles.requestLabel}>Seller:</Text>
                <Text style={styles.requestValue}>
                  {seller?.businessName || seller?.name || "Unknown Seller"}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelRequestButton}
                onPress={() => setShowLiveRequestModal(false)}
              >
                <Text style={styles.cancelRequestText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitRequestButton}
                onPress={submitLiveRequest}
              >
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitRequestText}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Images */}
        <View style={styles.imageSection}>
          <Image
            source={{ 
              uri: product.images?.[selectedImage] || "https://via.placeholder.com/400x300?text=No+Image" 
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          
          {/* Image Indicators */}
          {product.images && product.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {product.images.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.imageIndicator,
                    selectedImage === index && styles.imageIndicatorActive
                  ]}
                />
              ))}
            </View>
          )}
          
          {/* Thumbnail Gallery */}
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
                    selectedImage === index && styles.thumbnailActive
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
        </View>

        {/* Product Details */}
        <View style={styles.detailsSection}>
          {/* Product Header */}
          <View style={styles.productHeader}>
            <Text style={styles.name}>{product.name}</Text>
            <View style={styles.statusBadge}>
              <View style={[
                styles.statusDot,
                { backgroundColor: product.stock > 0 ? "#10B981" : "#DC2626" }
              ]} />
              <Text style={styles.statusText}>
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>₦{product.price?.toLocaleString()}</Text>
            
            {product.discount > 0 && (
              <View style={styles.discountContainer}>
                <Text style={styles.originalPrice}>
                  ₦{(product.price / (1 - product.discount / 100)).toLocaleString()}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>SAVE {product.discount}%</Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Ionicons 
                    name="remove" 
                    size={20} 
                    color={quantity <= 1 ? "#9CA3AF" : "#374151"} 
                  />
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={incrementQuantity}
                  disabled={quantity >= product.stock}
                >
                  <Ionicons 
                    name="add" 
                    size={20} 
                    color={quantity >= product.stock ? "#9CA3AF" : "#374151"} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.stockText}>{product.stock} available</Text>
            </View>
          )}

          {/* Product Meta Information */}
          <View style={styles.metaContainer}>
            <Text style={styles.metaTitle}>Product Details</Text>
            
            <View style={styles.metaRow}>
              <Feather name="hash" size={18} color="#7C3AED" />
              <Text style={styles.metaLabel}>SKU:</Text>
              <Text style={styles.metaValue}>{product.sku}</Text>
            </View>

            {product.tags && (
              <View style={styles.metaRow}>
                <Feather name="tag" size={18} color="#7C3AED" />
                <Text style={styles.metaLabel}>Tags:</Text>
                <View style={styles.tagsContainer}>
                  {product.tags.split(',').map((tag, index) => (
                    <View key={index} style={styles.tagBadge}>
                      <Text style={styles.tagText}>{tag.trim()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {product.categories && product.categories.length > 0 && (
              <View style={styles.metaRow}>
                <Feather name="grid" size={18} color="#7C3AED" />
                <Text style={styles.metaLabel}>Categories:</Text>
                <View style={styles.categoriesContainer}>
                  {product.categories.map((category, index) => (
                    <View key={index} style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{category.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Seller Information */}
          {seller && (
            <View style={styles.sellerSection}>
              <Text style={styles.sectionTitle}>Seller Information</Text>
              <TouchableOpacity 
                style={styles.sellerCard}
                onPress={handleSellerProfile}
              >
                <View style={styles.sellerHeader}>
                  <View style={styles.sellerAvatar}>
                    <Feather name="store" size={20} color="#7C3AED" />
                  </View>
                  <View style={styles.sellerInfo}>
                    <Text style={styles.sellerName}>
                      {seller.businessName || seller.name || "Unknown Seller"}
                    </Text>
                    <View style={styles.sellerStats}>
                      <Text style={styles.sellerRating}>
                        ⭐ {seller.rating || "4.5"} 
                      </Text>
                      <Text style={styles.sellerDot}>•</Text>
                      <Text style={styles.sellerSales}>
                        {seller.totalSales || "100+"} sales
                      </Text>
                    </View>
                  </View>
                  <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </View>
                
                <View style={styles.sellerActions}>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => router.push(`/buyer/chat/${seller.userId || seller.id}`)}
                  >
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.liveRequestButton}
                    onPress={handleLiveRequest}
                  >
                    <Ionicons name="videocam-outline" size={18} color="#7C3AED" />
                    <Text style={styles.liveRequestText}>Live View</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleAddToFavorites}
        >
          <Ionicons name="heart-outline" size={22} color="#DC2626" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => showCustomAlert("Share", "Product sharing feature coming soon!", "info")}
        >
          <Ionicons name="share-social-outline" size={22} color="#7C3AED" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cartButton,
            product.stock === 0 && styles.disabledButton
          ]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Ionicons 
            name="cart" 
            size={22} 
            color={product.stock === 0 ? "#9CA3AF" : "#fff"} 
          />
          <Text style={[
            styles.cartButtonText,
            product.stock === 0 && styles.disabledButtonText
          ]}>
            {product.stock === 0 ? "Out of Stock" : `Add to Cart • ₦${(product.price * quantity).toLocaleString()}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  error: {
    color: "#DC2626",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtext: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  // Alert Styles
  alertOverlay: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
  },
  alertClose: {
    padding: 4,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 20,
    width: "90%",
    maxWidth: 400,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
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
    padding: 20,
    alignItems: "center",
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  requestDetails: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
  },
  requestLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  requestValue: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  cancelRequestButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelRequestText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
  submitRequestButton: {
    flex: 2,
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitRequestText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },

  // Image Section
  imageSection: {
    backgroundColor: "#FFFFFF",
  },
  mainImage: {
    width: width,
    height: 380,
  },
  imageIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 6,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  imageIndicatorActive: {
    backgroundColor: "#7C3AED",
    width: 20,
  },
  thumbnailContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  thumbnailActive: {
    borderColor: "#7C3AED",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  // Details Section
  detailsSection: {
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    marginRight: 12,
    lineHeight: 32,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  priceSection: {
    marginBottom: 20,
  },
  price: {
    fontSize: 32,
    color: "#7C3AED",
    fontWeight: "700",
    marginBottom: 8,
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  originalPrice: {
    fontSize: 20,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  discountBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 24,
  },
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quantityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    paddingHorizontal: 20,
  },
  stockText: {
    fontSize: 14,
    color: "#6B7280",
  },
  metaContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  metaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 12,
    marginRight: 12,
    width: 80,
  },
  metaValue: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    gap: 6,
  },
  tagBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1,
    gap: 6,
  },
  categoryBadge: {
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    color: "#7C3AED",
    fontWeight: "500",
  },
  sellerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  sellerCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  sellerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sellerRating: {
    fontSize: 14,
    color: "#F59E0B",
    fontWeight: "600",
  },
  sellerDot: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  sellerSales: {
    fontSize: 14,
    color: "#6B7280",
  },
  sellerActions: {
    flexDirection: "row",
    gap: 12,
  },
  chatButton: {
    flex: 2,
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  liveRequestButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7C3AED",
    gap: 6,
  },
  liveRequestText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "600",
  },

  // Action Section
  actionSection: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
    alignItems: "center",
  },
  favoriteButton: {
    width: 50,
    height: 50,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  shareButton: {
    width: 50,
    height: 50,
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  cartButton: {
    flex: 1,
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#E5E7EB",
  },
  cartButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  disabledButtonText: {
    color: "#9CA3AF",
  },
});