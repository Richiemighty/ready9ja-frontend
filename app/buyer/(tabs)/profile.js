import {
  Feather,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal, Platform, ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { useAuth } from "../../../hooks/useAuth";


export default function Profile() {
  const router = useRouter();
  const { logout, updateUserProfile } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false); // Track if user is already a seller

  // Animation values
  const slideAnim = useState(new Animated.Value(300))[0];

  // cross-platform getter and setter
  const getItem = async (key) => {
    if (Platform.OS === "web") return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  };

  const setItem = async (key, value) => {
    if (Platform.OS === "web") return AsyncStorage.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await getItem("user_data");
      if (data) {
        const parsed = JSON.parse(data);
        setUser(parsed.user);
        setTempUser(parsed.user);
        // Check if user is already a seller
        setIsSeller(parsed.user?.isSeller || false);
      }
    } catch (err) {
      console.warn("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (field, value = "") => {
    setEditingField(field);
    // Handle null or undefined values by converting to empty string
    setEditValue(value || "");
    setEditModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeEditModal = () => {
    Keyboard.dismiss(); // Dismiss keyboard when closing modal
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setEditModalVisible(false);
      setEditingField(null);
      setEditValue("");
    });
  };

  const handleSave = async () => {
    // Safe check for editValue
    if (!editValue || !editValue.trim() || !editingField) return;

    setIsSaving(true);
    try {
      // Update local state first
      const updatedUser = {
        ...tempUser,
        [editingField]: editValue.trim()
      };

      setTempUser(updatedUser);
      setUser(updatedUser);

      // Update in secure storage
      const userData = await getItem("user_data");
      if (userData) {
        const parsed = JSON.parse(userData);
        parsed.user = updatedUser;
        await setItem("user_data", JSON.stringify(parsed));
      }

      // Update in database via API
      const updateSuccess = await updateUserInDatabase(updatedUser);
      
      if (updateSuccess) {
        Alert.alert("Success", "Profile updated successfully!");
      } else {
        Alert.alert("Error", "Failed to update profile. Please try again.");
        // Revert local changes if API call fails
        await loadUserData();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
      await loadUserData();
    } finally {
      setIsSaving(false);
      closeEditModal();
    }
  };

  const updateUserInDatabase = async (userData) => {
    try {
      // Cross-platform get token
      let token;
      if (Platform.OS === "web") {
        token = await AsyncStorage.getItem("access_token");
      } else {
        token = await SecureStore.getItemAsync("access_token");
      }

      if (!token) {
        console.warn("⚠️ No token found in storage!");
        return false;
      }

      const response = await fetch(
        "https://ready9ja-api.onrender.com/api/v1/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Profile update failed:", errorText);
        return false;
      }

      const result = await response.json();
      console.log("✅ User updated successfully:", result);
      return true;
    } catch (error) {
      console.error("❌ Database update error:", error);
      return false;
    }
  };

  const handleBecomeSeller = () => {
    if (isSeller) {
      Alert.alert(
        "Seller Account",
        "You are already a registered seller!",
        [{ text: "OK" }]
      );
    } else {
      router.push("/buyer/become-seller");
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
          }
        }
      ]
    );
  };

  const getFieldLabel = (field) => {
    const labels = {
      firstname: "First Name",
      lastname: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      address: "Address"
    };
    return labels[field] || field;
  };

  const getFieldPlaceholder = (field) => {
    const placeholders = {
      firstname: "Enter your first name",
      lastname: "Enter your last name",
      email: "Enter your email address",
      phone: "Enter your phone number",
      address: "Enter your address"
    };
    return placeholders[field] || `Enter ${field}`;
  };

  const getKeyboardType = (field) => {
    if (field === 'email') return 'email-address';
    if (field === 'phone') return 'phone-pad';
    return 'default';
  };

  // Safe value display function
  const displayValue = (value) => {
    return value || "Not provided";
  };

  const menuItems = [
    {
      title: "My Orders",
      icon: "package",
      iconType: "feather",
      count: "5",
      onPress: () => router.push("/orders"),
    },
    {
      title: "Wishlist",
      icon: "heart",
      iconType: "feather",
      count: "12",
      onPress: () => router.push("/wishlist"),
    },
    {
      title: "Shipping Addresses",
      icon: "map-pin",
      iconType: "feather",
      count: "3",
      onPress: () => router.push("/addresses"),
    },
    {
      title: "Payment Methods",
      icon: "credit-card",
      iconType: "feather",
      onPress: () => router.push("/payments"),
    },
    {
      title: "My Reviews",
      icon: "star",
      iconType: "feather",
      count: "8",
      onPress: () => router.push("/reviews"),
    },
  ];

  const settingsItems = [
    {
      title: "Notifications",
      icon: "notifications",
      iconType: "ionicons",
      rightElement: (
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: "#D1D5DB", true: "#7C3AED" }}
        />
      ),
    },
    {
      title: "Promotional Emails",
      icon: "email",
      iconType: "material",
      rightElement: (
        <Switch
          value={promotionalEmails}
          onValueChange={setPromotionalEmails}
          trackColor={{ false: "#D1D5DB", true: "#7C3AED" }}
        />
      ),
    },
    {
      title: "Dark Mode",
      icon: "moon",
      iconType: "feather",
      rightElement: (
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: "#D1D5DB", true: "#7C3AED" }}
        />
      ),
    },
    {
      title: "Language",
      icon: "globe",
      iconType: "feather",
      rightElement: <Text style={styles.settingsValue}>English</Text>,
    },
    {
      title: "Currency",
      icon: "dollar-sign",
      iconType: "feather",
      rightElement: <Text style={styles.settingsValue}>USD ($)</Text>,
    },
  ];

  const supportItems = [
    {
      title: "Help Center",
      icon: "help-circle",
      iconType: "feather",
      onPress: () => router.push("/help"),
    },
    {
      title: "Contact Support",
      icon: "headset",
      iconType: "material",
      onPress: () => router.push("/support"),
    },
    {
      title: "About Us",
      icon: "info",
      iconType: "feather",
      onPress: () => router.push("/about"),
    },
    {
      title: "Privacy Policy",
      icon: "shield",
      iconType: "feather",
      onPress: () => router.push("/privacy"),
    },
  ];

  const getIconComponent = (iconType, iconName, color = "#6B7280", size = 20) => {
    switch (iconType) {
      case "ionicons":
        return <Ionicons name={iconName} size={size} color={color} />;
      case "material":
        return <MaterialIcons name={iconName} size={size} color={color} />;
      case "fontawesome":
        return <FontAwesome name={iconName} size={size} color={color} />;
      case "feather":
        return <Feather name={iconName} size={size} color={color} />;
      case "material-community":
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      default:
        return <Feather name={iconName} size={size} color={color} />;
    }
  };

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );

  if (!user)
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>User not found</Text>
        <TouchableOpacity onPress={() => router.replace("/login")} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={{
              uri:
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(`${user.firstname} ${user.lastname}`) +
                "&background=7C3AED&color=fff&size=200",
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user.firstname} {user.lastname}</Text>
            <Text style={styles.role}>
              {isSeller ? "Verified Seller" : (user.roles?.[0]?.description || "Premium Member")}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>Wishlist</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Years</Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => openEditModal('firstname', user.firstname)}
        >
          <Feather name="edit-3" size={18} color="#7C3AED" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* SELLER REGISTRATION CTA */}
        {!isSeller && (
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sellerCtaCard}
              onPress={handleBecomeSeller}
            >
              <View style={styles.sellerCtaContent}>
                <View style={styles.sellerIconContainer}>
                  <Feather name="store" size={24} color="#7C3AED" />
                </View>
                <View style={styles.sellerCtaText}>
                  <Text style={styles.sellerCtaTitle}>
                    Are you a Small Business Owner?
                  </Text>
                  <Text style={styles.sellerCtaSubtitle}>
                    Request to become a Seller and start selling on Ready9ja
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </View>
              <View style={styles.sellerCtaBadge}>
                <Text style={styles.sellerCtaBadgeText}>Start Selling</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuLeft}>
                  {getIconComponent(item.iconType, item.icon, "#7C3AED")}
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <View style={styles.menuRight}>
                  {item.count && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.count}</Text>
                    </View>
                  )}
                  <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PERSONAL INFORMATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('firstname', user.firstname)}
            >
              <View style={styles.infoLeft}>
                <Feather name="user" size={18} color="#7C3AED" />
                <Text style={styles.infoLabel}>First Name</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(user.firstname)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('lastname', user.lastname)}
            >
              <View style={styles.infoLeft}>
                <Feather name="user" size={18} color="#7C3AED" />
                <Text style={styles.infoLabel}>Last Name</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(user.lastname)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('email', user.email)}
            >
              <View style={styles.infoLeft}>
                <Feather name="mail" size={18} color="#7C3AED" />
                <Text style={styles.infoLabel}>Email Address</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(user.email)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('phone', user.phone)}
            >
              <View style={styles.infoLeft}>
                <Feather name="phone" size={18} color="#7C3AED" />
                <Text style={styles.infoLabel}>Phone Number</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(user.phone)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('address', user.address)}
            >
              <View style={styles.infoLeft}>
                <Feather name="map-pin" size={18} color="#7C3AED" />
                <Text style={styles.infoLabel}>Address</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(user.address)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Feather name="calendar" size={18} color="#7C3AED" />
                <Text style={styles.infoLabel}>Member Since</Text>
              </View>
              <Text style={styles.infoValue}>
                {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Feather name="shield" size={18} color="#7C3AED" />
                <Text style={styles.infoLabel}>Account Status</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: user.status ? "#DCFCE7" : "#FEE2E2" }]}>
                <Text style={[styles.statusText, { color: user.status ? "#166534" : "#991B1B" }]}>
                  {user.status ? "Verified" : "Pending"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* SETTINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuLeft}>
                  {getIconComponent(item.iconType, item.icon, "#7C3AED")}
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                {item.rightElement}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SUPPORT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            {supportItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuLeft}>
                  {getIconComponent(item.iconType, item.icon, "#7C3AED")}
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Feather name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>App Version 1.0.0</Text>
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeEditModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardAvoidingView}
            >
              <Animated.View 
                style={[
                  styles.modalContent,
                  { transform: [{ translateY: slideAnim }] }
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Edit {getFieldLabel(editingField)}
                  </Text>
                  <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
                    <Feather name="x" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.textInput}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder={getFieldPlaceholder(editingField)}
                  keyboardType={getKeyboardType(editingField)}
                  autoCapitalize={editingField === 'email' ? 'none' : 'words'}
                  autoFocus={true}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={closeEditModal}
                    disabled={isSaving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.modalButton, 
                      styles.saveButton,
                      // Safe check for editValue
                      ((!editValue || !editValue.trim()) || isSaving) && styles.saveButtonDisabled
                    ]}
                    onPress={handleSave}
                    disabled={(!editValue || !editValue.trim()) || isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: "#7C3AED",
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  userInfo: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  role: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 15,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  editButtonText: {
    color: "#7C3AED",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sellerCtaCard: {
    backgroundColor: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    padding: 20,
    elevation: 6,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sellerCtaContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sellerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sellerCtaText: {
    flex: 1,
  },
  sellerCtaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  sellerCtaSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 18,
  },
  sellerCtaBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F59E0B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sellerCtaBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
    fontWeight: "500",
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
    fontWeight: "500",
  },
  infoRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    textAlign: "right",
    marginRight: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  settingsValue: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  error: {
    color: "#d9534f",
    fontSize: 18,
    marginBottom: 10,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
    // Ensure modal stays above keyboard
    marginBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  saveButton: {
    backgroundColor: "#7C3AED",
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});