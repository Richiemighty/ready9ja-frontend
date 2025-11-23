import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import api from "../../../constants/api";
import { useCart } from "../../../contexts/CartContext";
import { useAuth } from "../../../hooks/useAuth";

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, loading: cartLoading } = useCart();
  const { getUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [logisticsOptions, setLogisticsOptions] = useState([]);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedLogistic, setSelectedLogistic] = useState(null);

  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // promo code
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // mini cart preview
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  // address bottom sheet
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  // animated header
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      const user = await getUser();
      setAddress(user?.address || "");

      const token = user.accessToken;

      const pmRes = await api.get("/checkout/payment-methods", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const lgRes = await api.get("/checkout/logistics-options", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPaymentMethods(pmRes.data.payment_methods || []);
      setLogisticsOptions(lgRes.data.logistics_options || []);

      // Fake saved addresses – you can replace with real API later
      setSavedAddresses([
        {
          id: "1",
          label: "Home",
          value: "12 Unity Road, Ikeja, Lagos",
        },
        {
          id: "2",
          label: "Office",
          value: "3rd Floor, Yaba Tech Hub, Lagos",
        },
      ]);
    } catch (e) {
      console.error("Checkout load error:", e);
      Alert.alert("Error", "Failed to load checkout data.");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const deliveryFee = 0; // if you want, you can later make this dynamic

  const totalAmount = Math.max(subtotal - discountAmount + deliveryFee, 0);

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    // Demo logic
    if (code === "READY9JA10") {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setPromoApplied(true);
      Alert.alert("Promo Applied", "You got 10% off your order!");
    } else {
      setDiscountAmount(0);
      setPromoApplied(false);
      Alert.alert("Invalid Code", "This promo code is not valid.");
    }
  };

  const confirmOrder = async () => {
    if (!address.trim()) {
      Alert.alert("Address Required", "Please enter your delivery address.");
      return;
    }
    if (!selectedPayment) {
      Alert.alert("Payment Method", "Please select a payment method.");
      return;
    }
    if (!selectedLogistic) {
      Alert.alert("Delivery Option", "Please select a logistics provider.");
      return;
    }

    try {
      setSubmitting(true);

      const userData = await getUser();
      const token = userData.accessToken;

      const payload = {
        shippingAddressId: address,
        paymentMethodId: selectedPayment,
        selectedLogisticId: selectedLogistic,
        promoCode: promoApplied ? promoCode.trim().toUpperCase() : undefined,
      };

      const res = await api.post("/orders/confirm", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.message) {
        Alert.alert("Success", "Order created successfully!", [
          {
            text: "View Orders",
            onPress: () => router.push("/buyer/orders"),
          },
        ]);
      }
    } catch (e) {
      console.error("Order confirm error:", e);
      Alert.alert("Error", "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  // Animated header styles
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  const etaText = "Estimated delivery: 1–3 business days";

  if (loading || cartLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={{ marginTop: 8 }}>Loading checkout...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTranslateY }],
            opacity: headerOpacity,
          },
        ]}
      >
        <View>
          <Text style={styles.headerTitle}>Checkout</Text>
          <Text style={styles.headerSubtitle}>Complete your order</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
        >
          {/* MINI CART PREVIEW */}
          <TouchableOpacity
            style={styles.miniCart}
            activeOpacity={0.9}
            onPress={() => setMiniCartOpen((prev) => !prev)}
          >
            <View>
              <Text style={styles.miniCartTitle}>
                {cart.length} item{cart.length !== 1 ? "s" : ""} in cart
              </Text>
              <Text style={styles.miniCartSub}>
                Total: ₦{subtotal.toLocaleString()}
              </Text>
            </View>
            <Ionicons
              name={miniCartOpen ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>

          {miniCartOpen && (
            <View style={styles.miniCartDropdown}>
              {cart.map((item) => (
                <View key={item.uuid} style={styles.miniCartRow}>
                  <Text style={styles.miniCartItemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.miniCartItemPrice}>
                    x{item.quantity} • ₦
                    {(item.product.price * item.quantity).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ETA */}
          <View style={styles.etaBox}>
            <Ionicons name="time-outline" size={18} color="#059669" />
            <Text style={styles.etaText}>{etaText}</Text>
          </View>

          {/* SHIPPING ADDRESS */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={20} color="#7C3AED" />
              <Text style={styles.cardHeaderText}>Shipping Address</Text>
              <TouchableOpacity
                onPress={() => setAddressSheetVisible(true)}
              >
                <Text style={styles.editText}>Change</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.addressInput}
              placeholder="Enter delivery address"
              multiline
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* ORDER ITEMS */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bag-outline" size={20} color="#7C3AED" />
              <Text style={styles.cardHeaderText}>Order Items</Text>
            </View>

            {cart.map((item) => (
              <View key={item.uuid} style={styles.cartItem}>
                <Image
                  source={{ uri: item.product.images[0] }}
                  style={styles.cartImage}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>
                    ₦{(item.product.price * item.quantity).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* PAYMENT METHODS */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="wallet-outline" size={20} color="#7C3AED" />
              <Text style={styles.cardHeaderText}>Payment Method</Text>
            </View>

            {paymentMethods.map((pm) => (
              <TouchableOpacity
                key={pm.uuid}
                style={[
                  styles.radioRow,
                  selectedPayment === pm.uuid && styles.radioSelected,
                ]}
                onPress={() => setSelectedPayment(pm.uuid)}
              >
                <Ionicons
                  name={
                    selectedPayment === pm.uuid
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={22}
                  color="#7C3AED"
                />
                <Text style={styles.radioText}>{pm.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* LOGISTICS */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="cube-outline" size={20} color="#7C3AED" />
              <Text style={styles.cardHeaderText}>Delivery Partner</Text>
            </View>

            {logisticsOptions.map((lg) => (
              <TouchableOpacity
                key={lg.uuid || lg.id}
                style={[
                  styles.radioRow,
                  selectedLogistic === (lg.uuid || lg.id) &&
                    styles.radioSelected,
                ]}
                onPress={() => setSelectedLogistic(lg.uuid || lg.id)}
              >
                <Ionicons
                  name={
                    selectedLogistic === (lg.uuid || lg.id)
                      ? "radio-button-on"
                      : "radio-button-off"
                  }
                  size={22}
                  color="#7C3AED"
                />
                <Text style={styles.radioText}>{lg.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* PROMO CODE */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pricetag-outline" size={20} color="#7C3AED" />
              <Text style={styles.cardHeaderText}>Promo Code</Text>
            </View>

            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                value={promoCode}
                onChangeText={(text) => {
                  setPromoCode(text);
                  if (!text.trim()) {
                    setPromoApplied(false);
                    setDiscountAmount(0);
                  }
                }}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.promoButton}
                onPress={handleApplyPromo}
              >
                <Text style={styles.promoButtonText}>
                  {promoApplied ? "Applied" : "Apply"}
                </Text>
              </TouchableOpacity>
            </View>
            {promoApplied && (
              <Text style={styles.promoAppliedText}>
                Discount: -₦{discountAmount.toLocaleString()}
              </Text>
            )}
          </View>

          {/* ORDER SUMMARY */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="receipt-outline" size={20} color="#7C3AED" />
              <Text style={styles.cardHeaderText}>Order Summary</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ₦{subtotal.toLocaleString()}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                ₦{deliveryFee.toLocaleString()}
              </Text>
            </View>

            {discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text
                  style={[styles.summaryValue, { color: "#059669" }]}
                >
                  -₦{discountAmount.toLocaleString()}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                ₦{totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={{ height: 120 }} />
        </Animated.ScrollView>

        {/* FOOTER WITH PAYMENT ANIMATION */}
        <View style={styles.footer}>
          <TouchableOpacity
            disabled={submitting}
            onPress={confirmOrder}
            style={styles.confirmBtn}
            activeOpacity={0.9}
          >
            {submitting ? (
              <View style={styles.paymentAnimationRow}>
                <Animated.View style={styles.paymentGlow}>
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                </Animated.View>
                <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.confirmText}>Processing payment...</Text>
              </View>
            ) : (
              <Text style={styles.confirmText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* SAVED ADDRESSES BOTTOM SHEET */}
      <Modal
        visible={addressSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPressOut={() => setAddressSheetVisible(false)}
        >
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Saved Address</Text>

            {savedAddresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                style={styles.addressRow}
                onPress={() => {
                  setAddress(addr.value);
                  setAddressSheetVisible(false);
                }}
              >
                <Ionicons name="location-outline" size={20} color="#7C3AED" />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  <Text style={styles.addrValue}>{addr.value}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.addressAddNew}
              onPress={() => setAddressSheetVisible(false)}
            >
              <Ionicons name="add-circle-outline" size={20} color="#7C3AED" />
              <Text style={styles.addressAddNewText}>Use a new address</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingHorizontal: 16,
    paddingTop: 35,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },

  scrollContent: {
    paddingTop: 90,
    paddingHorizontal: 15,
    paddingBottom: 30,
  },

  miniCart: {
    backgroundColor: "#EEF2FF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniCartTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  miniCartSub: {
    fontSize: 12,
    color: "#6B7280",
  },
  miniCartDropdown: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  miniCartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  miniCartItemName: {
    fontSize: 13,
    color: "#374151",
    flex: 1,
    marginRight: 8,
  },
  miniCartItemPrice: {
    fontSize: 13,
    color: "#111827",
  },

  etaBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  etaText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#047857",
    fontWeight: "500",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
    color: "#111827",
    flex: 1,
  },
  editText: {
    fontSize: 14,
    color: "#7C3AED",
    fontWeight: "600",
  },

  addressInput: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
    minHeight: 60,
    fontSize: 14,
    color: "#111",
  },

  cartItem: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 10,
  },
  cartImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  itemQty: { fontSize: 12, color: "#6B7280", marginTop: 3 },
  itemPrice: {
    fontSize: 14,
    color: "#7C3AED",
    fontWeight: "600",
    marginTop: 6,
  },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  radioSelected: {
    backgroundColor: "rgba(124, 58, 237, 0.08)",
  },
  radioText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
  },

  promoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  promoInput: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  promoButton: {
    marginLeft: 8,
    backgroundColor: "#7C3AED",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  promoButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  promoAppliedText: {
    marginTop: 6,
    fontSize: 13,
    color: "#059669",
    fontWeight: "500",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#4B5563",
  },
  summaryValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  summaryTotalLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7C3AED",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 8,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderTopColor: "#E5E7EB",
    borderTopWidth: 1,
  },
  confirmBtn: {
    backgroundColor: "#7C3AED",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  paymentAnimationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentGlow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 25,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  addrLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  addrValue: {
    fontSize: 13,
    color: "#4B5563",
  },
  addressAddNew: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  addressAddNewText: {
    marginLeft: 6,
    color: "#7C3AED",
    fontWeight: "600",
    fontSize: 14,
  },
});
