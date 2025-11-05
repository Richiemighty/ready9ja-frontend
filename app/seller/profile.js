// seller/profile.js
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
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { useAuth } from "../../hooks/useAuth";

export default function SellerProfile() {
  const router = useRouter();
  const { logout, updateUserProfile, switchRole, getActiveRole, user, getUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [currentRole, setCurrentRole] = useState("seller");
  const [showRoleSwitch, setShowRoleSwitch] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  // Animation refs
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const alertScaleAnim = useRef(new Animated.Value(0)).current;

  // Business-specific state
  const [businessInfo, setBusinessInfo] = useState({
    id: "",
    name: "",
    yearFounded: "",
    ownedBy: "",
    category: "",
    location_address: "",
    location_city: "",
    location_state: "",
    location_country: "Nigeria",
    nin: "",
    cacImage: "",
    businessImage: "",
    bannerImages: [],
    isApproved: false,
    createdAt: "",
    updatedAt: ""
  });

  const [businessStats, setBusinessStats] = useState({
    products: 0,
    orders: 0,
    rating: 0
  });

  const getItem = async (key) => {
    if (Platform.OS === "web") return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  };

  const setItem = async (key, value) => {
    if (Platform.OS === "web") return AsyncStorage.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  };

  // Get token from storage
  const getTokenFromStorage = async () => {
    try {
      let token;
      if (Platform.OS === "web") {
        token = await AsyncStorage.getItem("access_token");
      } else {
        token = await SecureStore.getItemAsync("access_token");
      }
      
      if (!token) {
        // Try to get from user_data as fallback
        let userData;
        if (Platform.OS === "web") {
          userData = await AsyncStorage.getItem("user_data");
        } else {
          userData = await SecureStore.getItemAsync("user_data");
        }
        
        if (userData) {
          const parsed = JSON.parse(userData);
          token = parsed.accessToken;
        }
      }
      
      return token;
    } catch (error) {
      console.error("Error getting token from storage:", error);
      return null;
    }
  };

  useEffect(() => {
    loadUserData();
    loadBusinessData();
    loadBusinessStats();
  }, []);

  // ENHANCED: Alert System from Buyer's Profile
  const showCustomAlert = (title, message, type = "info", options = {}) => {
    // On iOS, use native Alert for better compatibility
    if (Platform.OS === 'ios' && options.showActions) {
      Alert.alert(
        title,
        message,
        [
          {
            text: options.cancelText || 'Cancel',
            style: 'cancel',
            onPress: options.onCancel
          },
          {
            text: options.confirmText || 'OK',
            style: type === 'error' ? 'destructive' : 'default',
            onPress: options.onConfirm
          }
        ].filter(Boolean) // Remove null buttons
      );
      return;
    }

    // For non-iOS or non-action alerts, use custom modal
    setAlertConfig({
      title,
      message,
      type,
      icon: type === "success" ? "checkmark-circle" : 
            type === "error" ? "close-circle" : 
            type === "warning" ? "warning" : "information",
      ...options
    });
    
    setShowAlert(true);
    alertScaleAnim.setValue(0);
    
    Animated.spring(alertScaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Auto hide for non-action alerts
    if (!options.showActions) {
      setTimeout(() => {
        hideAlert();
      }, options.duration || 3000);
    }
  };

  const hideAlert = () => {
    Animated.timing(alertScaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowAlert(false);
      setAlertConfig({});
    });
  };

  const loadUserData = async () => {
    try {
      const data = await getItem("user_data");
      if (data) {
        const parsed = JSON.parse(data);
        setTempUser(parsed.user);
      }
    } catch (err) {
      console.warn("Error loading profile:", err);
      showCustomAlert("Error", "Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch actual business data from API
  const loadBusinessData = async () => {
    try {
      setBusinessLoading(true);
      const token = await getTokenFromStorage();
      
      if (!token) {
        console.warn("No token found for business data");
        return;
      }

      console.log("Fetching business profile...");

      const response = await fetch("https://ready9ja-api.onrender.com/api/v1/business/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch business profile: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Business profile response:", responseData);

      if (responseData.businessProfile) {
        const businessData = responseData.businessProfile;
        setBusinessInfo({
          id: businessData.id || "",
          name: businessData.name || "",
          yearFounded: businessData.yearFounded || "",
          ownedBy: businessData.ownedBy || "",
          category: businessData.category || "",
          location_address: businessData.location_address || "",
          location_city: businessData.location_city || "",
          location_state: businessData.location_state || "",
          location_country: businessData.location_country || "Nigeria",
          nin: businessData.nin || "",
          cacImage: businessData.cacImage || "",
          businessImage: businessData.businessImage || "",
          bannerImages: businessData.bannerImages || [],
          isApproved: businessData.isApproved || false,
          createdAt: businessData.createdAt || "",
          updatedAt: businessData.updatedAt || ""
        });
        
      } else {
        throw new Error("No business profile found in response");
      }

    } catch (error) {
      console.error("Error loading business data:", error);
      showCustomAlert("Error", "Failed to load business data", "error");
    } finally {
      setBusinessLoading(false);
    }
  };

  // Load business statistics (products, orders, etc.)
  const loadBusinessStats = async () => {
    try {
      const token = await getTokenFromStorage();
      if (!token) return;

      // Fetch products count
      const productsResponse = await fetch(`https://ready9ja-api.onrender.com/api/v1/products/business/${businessInfo.id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const productsCount = productsData.products?.length || 0;
        
        setBusinessStats(prev => ({
          ...prev,
          products: productsCount
        }));
      }

    } catch (error) {
      console.error("Error loading business stats:", error);
    }
  };

  const openEditModal = (field, value = "", isBusinessField = false) => {
    setEditingField({ field, isBusinessField });
    setEditValue(value || "");
    setEditModalVisible(true);
    slideAnim.setValue(300);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeEditModal = () => {
    Keyboard.dismiss();
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

  const openRoleSwitch = () => {
    setShowRoleSwitch(true);
    fadeAnim.setValue(0);
    Animated.spring(fadeAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeRoleSwitch = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowRoleSwitch(false);
    });
  };

  // ENHANCED: Role switching with iOS-compatible alerts
  const handleRoleSwitch = async (newRole) => {
    try {
      console.log("🔄 Starting role switch to:", newRole);
      
      closeRoleSwitch();
      
      // Use the enhanced alert system
      showCustomAlert(
        "🎭 Switch Dashboard?", 
        `Are you sure you want to switch to ${getRoleDisplayName(newRole)} dashboard?`,
        "info",
        {
          showActions: true,
          confirmText: "Continue",
          cancelText: "Cancel",
          onConfirm: async () => {
            console.log("✅ User confirmed role switch to:", newRole);
            
            try {
              await switchRole(newRole);
              setCurrentRole(newRole);
              
              let redirectPath;
              switch(newRole.toLowerCase()) {
                case 'seller':
                  redirectPath = '/seller/(tabs)/dashboard';
                  break;
                case 'admin':
                  redirectPath = '/admin/(tabs)/dashboard';  
                  break;
                case 'user':
                default:
                  redirectPath = '/buyer/(tabs)/marketplace';
              }
              
              console.log("🎯 Redirecting to:", redirectPath);
              
              // Show success message
              showCustomAlert(
                "✅ Success!", 
                `You are now viewing the ${getRoleDisplayName(newRole)} dashboard`,
                "success",
                {
                  showActions: false,
                  duration: 1500
                }
              );
              
              setTimeout(() => {
                router.replace(redirectPath);
              }, 1600);
              
            } catch (switchError) {
              console.error("❌ Error during role switch:", switchError);
              showCustomAlert(
                "Error", 
                "Failed to switch role. Please try again.", 
                "error"
              );
            }
          },
          onCancel: () => {
            console.log("❌ User cancelled role switch");
          }
        }
      );
      
    } catch (error) {
      console.error("❌ Error in role switch flow:", error);
      showCustomAlert("Error", "Failed to switch role. Please try again.", "error");
    }
  };

  const handleSave = async () => {
    if (!editValue || !editValue.trim() || !editingField) {
      showCustomAlert("Validation Error", "Please enter a valid value", "warning");
      return;
    }

    setIsSaving(true);
    try {
      if (editingField.isBusinessField) {
        // Update business info via API
        const updateSuccess = await updateBusinessProfile(editingField.field, editValue.trim());
        
        if (updateSuccess) {
          setBusinessInfo(prev => ({
            ...prev,
            [editingField.field]: editValue.trim()
          }));
          showCustomAlert("Success", "Business information updated successfully!", "success");
        }
      } else {
        // Update user profile
        const updateSuccess = await updateProfileDirectly(editingField.field, editValue.trim());
        
        if (updateSuccess) {
          const updatedUser = {
            ...tempUser,
            [editingField.field]: editValue.trim()
          };
          setTempUser(updatedUser);

          const userData = await getItem("user_data");
          if (userData) {
            const parsed = JSON.parse(userData);
            parsed.user = updatedUser;
            await setItem("user_data", JSON.stringify(parsed));
          }

          showCustomAlert("Success", "Profile updated successfully!", "success");
        }
      }
    } catch (error) {
      console.error("Error updating:", error);
      showCustomAlert("Error", "Failed to update. Please try again.", "error");
    } finally {
      setIsSaving(false);
      closeEditModal();
    }
  };

  // Update business profile via API
  const updateBusinessProfile = async (field, value) => {
    try {
      const token = await getTokenFromStorage();
      if (!token) {
        console.warn("⚠️ No token found for business update");
        return false;
      }

      const payload = { [field]: value };
      console.log("Updating business profile with:", payload);

      const response = await fetch(
        "https://ready9ja-api.onrender.com/api/v1/business/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        console.log("Business profile updated successfully");
        return true;
      } else {
        const errorText = await response.text();
        console.error("Business update failed:", response.status, errorText);
        showCustomAlert("Update Failed", "Failed to update business profile. Please try again.", "error");
        return false;
      }
    } catch (error) {
      console.error("❌ Business update error:", error);
      return false;
    }
  };

  const updateProfileDirectly = async (field, value) => {
    try {
      let token;
      if (Platform.OS === "web") {
        token = await AsyncStorage.getItem("access_token");
      } else {
        token = await SecureStore.getItemAsync("access_token");
      }

      if (!token) {
        console.warn("⚠️ No token found");
        return false;
      }

      const payload = { [field]: value };
      const response = await fetch(
        "https://ready9ja-api.onrender.com/api/v1/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await response.text();
      return response.ok;
    } catch (error) {
      console.error("❌ Update error:", error);
      return false;
    }
  };

  // ENHANCED: Logout with iOS-compatible alert
  const handleLogout = () => {
    showCustomAlert(
      "🚪 Logout", 
      "Are you sure you want to logout?",
      "warning",
      {
        showActions: true,
        confirmText: "Logout",
        cancelText: "Cancel",
        onConfirm: async () => {
          await logout();
          router.replace("/login");
        }
      }
    );
  };

  const getFieldLabel = (field) => {
    const labels = {
      firstname: "First Name",
      lastname: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      address: "Address",
      name: "Business Name",
      category: "Business Category",
      location_address: "Business Address",
      location_city: "City",
      location_state: "State",
      location_country: "Country",
      nin: "NIN Number",
      yearFounded: "Year Founded"
    };
    return labels[field] || field;
  };

  const getFieldPlaceholder = (field) => {
    const placeholders = {
      name: "Enter your business name",
      category: "Enter business category",
      location_address: "Enter business address",
      location_city: "Enter city",
      location_state: "Enter state",
      nin: "Enter NIN number",
      yearFounded: "Enter year founded"
    };
    return placeholders[field] || `Enter ${field}`;
  };

  const getKeyboardType = (field) => {
    if (field === 'email') return 'email-address';
    if (field === 'phone') return 'phone-pad';
    if (field === 'yearFounded') return 'number-pad';
    if (field === 'nin') return 'number-pad';
    return 'default';
  };

  const displayValue = (value) => {
    return value || "Not provided";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      user: "Buyer",
      seller: "Seller",
      admin: "Administrator"
    };
    return roleNames[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      user: "person-outline",
      seller: "storefront-outline",
      admin: "shield-outline"
    };
    return icons[role] || "person-outline";
  };

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

  const sellerMenuItems = [
    {
      title: "My Products",
      icon: "package",
      iconType: "feather",
      count: businessStats.products.toString(),
      onPress: () => router.push("/seller/(tabs)/products"),
    },
    {
      title: "Orders",
      icon: "shopping-cart",
      iconType: "feather",
      count: businessStats.orders.toString(),
      onPress: () => router.push("/seller/orders"),
    },
    {
      title: "Store Analytics",
      icon: "bar-chart",
      iconType: "feather",
      onPress: () => router.push("/seller/analytics"),
    },
    {
      title: "Customer Reviews",
      icon: "star",
      iconType: "feather",
      count: "0", // Placeholder
      onPress: () => router.push("/seller/reviews"),
    },
  ];

  const settingsItems = [
    {
      title: "Store Notifications",
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
      title: "Store Status",
      icon: "store",
      iconType: "material",
      rightElement: (
        <Text style={[styles.settingsValue, {color: businessInfo.isApproved ? '#10B981' : '#F59E0B'}]}>
          {businessInfo.isApproved ? 'Approved' : 'Pending Approval'}
        </Text>
      ),
    },
  ];

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );

  if (!tempUser)
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
      {/* ENHANCED: Custom Alert Modal from Buyer's Profile */}
      {Platform.OS !== 'ios' && (
        <Modal
          visible={showAlert}
          transparent={true}
          animationType="fade"
          onRequestClose={hideAlert}
          statusBarTranslucent={true}
        >
          <TouchableWithoutFeedback onPress={alertConfig.showActions ? undefined : hideAlert}>
            <View style={styles.alertOverlay}>
              <Animated.View 
                style={[
                  styles.alertContainer,
                  { 
                    transform: [{
                      scale: alertScaleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1]
                      })
                    }],
                    opacity: alertScaleAnim,
                    backgroundColor: alertConfig.type === "success" ? "#F0F9FF" : 
                                   alertConfig.type === "error" ? "#FEF2F2" : 
                                   alertConfig.type === "warning" ? "#FFFBEB" : "#F0F9FF"
                  }
                ]}
              >
                <View style={[
                  styles.alertIconContainer,
                  { backgroundColor: alertConfig.type === "success" ? "#10B981" : 
                                   alertConfig.type === "error" ? "#DC2626" : 
                                   alertConfig.type === "warning" ? "#F59E0B" : "#7C3AED" }
                ]}>
                  <Ionicons 
                    name={alertConfig.icon} 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </View>
                
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alertConfig.title}</Text>
                  <Text style={styles.alertMessage}>{alertConfig.message}</Text>
                  
                  {alertConfig.showActions && (
                    <View style={styles.alertActions}>
                      {alertConfig.cancelText && (
                        <TouchableOpacity 
                          style={styles.alertCancelButton}
                          onPress={() => {
                            hideAlert();
                            alertConfig.onCancel?.();
                          }}
                        >
                          <Text style={styles.alertCancelText}>{alertConfig.cancelText}</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        style={[
                          styles.alertConfirmButton,
                          { backgroundColor: alertConfig.type === "success" ? "#10B981" : 
                                          alertConfig.type === "error" ? "#DC2626" : 
                                          alertConfig.type === "warning" ? "#F59E0B" : "#7C3AED" }
                        ]}
                        onPress={() => {
                          hideAlert();
                          alertConfig.onConfirm?.();
                        }}
                      >
                        <Text style={styles.alertConfirmText}>
                          {alertConfig.confirmText || "OK"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}              
                </View>
                
                {!alertConfig.showActions && (
                  <TouchableOpacity onPress={hideAlert} style={styles.alertCloseButton}>
                    <Ionicons name="close" size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={{
              uri: businessInfo.businessImage || "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(businessInfo.name || "Business") +
                "&background=7C3AED&color=fff&size=200",
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{businessInfo.name || "Your Business"}</Text>
            <View style={styles.roleContainer}>
              <Text style={styles.role}>
                {getRoleDisplayName(currentRole)}
              </Text>
              <TouchableOpacity 
                style={styles.roleSwitchButton}
                onPress={openRoleSwitch}
              >
                <Feather name="repeat" size={14} color="#7C3AED" />
                <Text style={styles.roleSwitchText}>Switch to Buyer</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{businessStats.products}</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{businessStats.orders}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{businessStats.rating || "0.0"}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => openEditModal('name', businessInfo.name, true)}
        >
          <Feather name="edit-3" size={18} color="#7C3AED" />
          <Text style={styles.editButtonText}>Edit Store</Text>
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT SCROLLVIEW */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* BUSINESS INFORMATION SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          <View style={styles.card}>
            {/* Business Name */}
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('name', businessInfo.name, true)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "store", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Business Name</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(businessInfo.name)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Business Category */}
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('category', businessInfo.category, true)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "tag", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Business Category</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(businessInfo.category)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Year Founded */}
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('yearFounded', businessInfo.yearFounded, true)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "calendar", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Year Founded</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(businessInfo.yearFounded)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* NIN Number */}
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('nin', businessInfo.nin, true)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "credit-card", "#6B7280", 18)}
                <Text style={styles.infoLabel}>NIN Number</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(businessInfo.nin)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Business Address */}
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('location_address', businessInfo.location_address, true)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "map-pin", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Business Address</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(businessInfo.location_address)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Location */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "map", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Location</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>
                  {[businessInfo.location_city, businessInfo.location_state, businessInfo.location_country]
                    .filter(Boolean)
                    .join(', ') || "Not provided"}
                </Text>
              </View>
            </View>

            {/* Approval Status */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "check-circle", businessInfo.isApproved ? "#10B981" : "#F59E0B", 18)}
                <Text style={styles.infoLabel}>Approval Status</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={[styles.infoValue, {color: businessInfo.isApproved ? '#10B981' : '#F59E0B'}]}>
                  {businessInfo.isApproved ? 'Approved' : 'Pending Approval'}
                </Text>
              </View>
            </View>

            {/* Member Since */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "clock", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Member Since</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{formatDate(businessInfo.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* PERSONAL INFORMATION SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('firstname', tempUser.firstname)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "user", "#6B7280", 18)}
                <Text style={styles.infoLabel}>First Name</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(tempUser.firstname)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('email', tempUser.email)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "mail", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Email Address</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(tempUser.email)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* SELLER MENU SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Management</Text>
          <View style={styles.card}>
            {sellerMenuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuLeft}>
                  {getIconComponent(item.iconType, item.icon, "#6B7280", 20)}
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <View style={styles.menuRight}>
                  {item.count && item.count !== "0" && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.count}</Text>
                    </View>
                  )}
                  <Feather name="chevron-right" size={18} color="#D1D5DB" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Settings</Text>
          <View style={styles.card}>
            {settingsItems.map((item, index) => (
              <View key={index} style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  {getIconComponent(item.iconType, item.icon, "#6B7280", 20)}
                  <Text style={styles.menuText}>{item.title}</Text>
                </View>
                <View style={styles.menuRight}>
                  {item.rightElement}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* REFRESH BUSINESS DATA BUTTON */}
        {businessLoading && (
          <View style={styles.refreshContainer}>
            <ActivityIndicator size="small" color="#7C3AED" />
            <Text style={styles.refreshText}>Loading business data...</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadBusinessData}
          disabled={businessLoading}
        >
          <Feather name="refresh-cw" size={18} color="#7C3AED" />
          <Text style={styles.refreshButtonText}>
            {businessLoading ? "Refreshing..." : "Refresh Business Data"}
          </Text>
        </TouchableOpacity>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ready9ja Seller v1.0.0</Text>
          <Text style={styles.footerSubtext}>Business ID: {businessInfo.id || "Not set"}</Text>
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent={true} animationType="none">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Edit {getFieldLabel(editingField?.field)}
                  </Text>
                  <TouchableOpacity onPress={closeEditModal} style={styles.closeButton}>
                    <Feather name="x" size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.textInput}
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder={getFieldPlaceholder(editingField?.field)}
                  keyboardType={getKeyboardType(editingField?.field)}
                  autoCapitalize={editingField?.field === 'email' ? 'none' : 'words'}
                  autoFocus={true}
                  multiline={editingField?.field === 'description'}
                  numberOfLines={editingField?.field === 'description' ? 3 : 1}
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
                    style={[styles.modalButton, styles.saveButton, (!editValue || !editValue.trim()) && styles.saveButtonDisabled]}
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

      {/* Role Switch Modal */}
      <Modal visible={showRoleSwitch} transparent={true} animationType="fade">
        <TouchableWithoutFeedback onPress={closeRoleSwitch}>
          <View style={styles.roleModalOverlay}>
            <Animated.View style={[styles.roleModalContent, { opacity: fadeAnim }]}>
              <View style={styles.roleModalHeader}>
                <Text style={styles.roleModalTitle}>Switch Dashboard</Text>
                <TouchableOpacity onPress={closeRoleSwitch} style={styles.roleCloseButton}>
                  <Feather name="x" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.roleModalSubtitle}>
                Choose a role to switch to its dashboard
              </Text>

              <View style={styles.roleList}>
                <TouchableOpacity
                  style={[styles.roleItem, styles.roleItemActive]}
                  onPress={() => handleRoleSwitch('seller')}
                >
                  <View style={styles.roleIconContainer}>
                    <Ionicons name="storefront-outline" size={24} color="#7C3AED" />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleName, styles.roleNameActive]}>
                      Seller
                    </Text>
                    <Text style={styles.roleDescription}>
                      Manage your store and products
                    </Text>
                  </View>
                  <Feather name="check" size={20} color="#7C3AED" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.roleItem}
                  onPress={() => handleRoleSwitch('user')}
                >
                  <View style={styles.roleIconContainer}>
                    <Ionicons name="person-outline" size={24} color="#6B7280" />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={styles.roleName}>
                      Buyer
                    </Text>
                    <Text style={styles.roleDescription}>
                      Shop and browse products
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Updated styles with enhanced alert styles from buyer's profile
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
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  role: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
  },
  roleSwitchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    gap: 4,
  },
  roleSwitchText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
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
  settingsValue: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  refreshContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginHorizontal: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginTop: 20,
  },
  refreshText: {
    color: "#6B7280",
    fontSize: 14,
    marginLeft: 8,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F3FF",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  refreshButtonText: {
    color: "#7C3AED",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 20,
    marginTop: 20,
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
  footerSubtext: {
    color: "#9CA3AF",
    fontSize: 10,
    marginTop: 4,
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
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
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
  // Role Switch Modal Styles
  roleModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  roleModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  roleModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  roleModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  roleCloseButton: {
    padding: 4,
  },
  roleModalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  roleList: {
    gap: 8,
  },
  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  roleItemActive: {
    backgroundColor: "#F5F3FF",
    borderColor: "#7C3AED",
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  roleNameActive: {
    color: "#7C3AED",
  },
  roleDescription: {
    fontSize: 12,
    color: "#6B7280",
  },
  // ENHANCED: Alert Styles from Buyer's Profile
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "flex-start",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 16,
  },
  alertActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  alertCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  alertCancelText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  alertConfirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  alertConfirmText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  alertCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
});