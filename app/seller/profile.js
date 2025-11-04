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
  const { logout, updateUserProfile, switchRole, getActiveRole, user } = useAuth();
  const [loading, setLoading] = useState(true);
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
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    businessAddress: "",
    businessCity: "",
    businessState: "",
    businessCountry: "Nigeria",
    businessDescription: "",
    businessImage: "",
    bannerImages: []
  });

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
    loadBusinessData();
  }, []);

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

  const loadBusinessData = async () => {
    try {
      // Simulate loading business data - replace with your API call
      const mockBusinessData = {
        businessName: "Precious's Mart",
        businessEmail: "business@preciousmart.com",
        businessPhone: "+2348012345678",
        businessAddress: "23 Broad Street",
        businessCity: "Lekki",
        businessState: "Lagos",
        businessCountry: "Nigeria",
        businessDescription: "Your one-stop shop for quality products",
        businessImage: "https://res.cloudinary.com/djock9yc0/image/upload/v1761629904/READY9JA/uvw3y7zdicitwftwobtm.png",
        bannerImages: []
      };
      setBusinessInfo(mockBusinessData);
    } catch (error) {
      console.error("Error loading business data:", error);
    }
  };

  const showCustomAlert = (title, message, type = "info", options = {}) => {
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
        ].filter(Boolean)
      );
      return;
    }

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

  const handleRoleSwitch = async (newRole) => {
    try {
      closeRoleSwitch();
      
      showCustomAlert(
        "🎭 Switch Dashboard?", 
        `Are you sure you want to switch to ${getRoleDisplayName(newRole)} dashboard?`,
        "info",
        {
          showActions: true,
          confirmText: "Continue",
          cancelText: "Cancel",
          onConfirm: async () => {
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
              
              showCustomAlert(
                "✅ Success!", 
                `You are now viewing the ${getRoleDisplayName(newRole)} dashboard`,
                "success",
                { duration: 1500 }
              );
              
              setTimeout(() => {
                router.replace(redirectPath);
              }, 1600);
              
            } catch (switchError) {
              console.error("❌ Error during role switch:", switchError);
              showCustomAlert("Error", "Failed to switch role. Please try again.", "error");
            }
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
        // Update business info
        setBusinessInfo(prev => ({
          ...prev,
          [editingField.field]: editValue.trim()
        }));
        // Here you would make API call to update business info
        showCustomAlert("Success", "Business information updated successfully!", "success");
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
      businessName: "Business Name",
      businessEmail: "Business Email",
      businessPhone: "Business Phone",
      businessAddress: "Business Address",
      businessCity: "City",
      businessState: "State",
      businessCountry: "Country",
      businessDescription: "Business Description"
    };
    return labels[field] || field;
  };

  const getFieldPlaceholder = (field) => {
    const placeholders = {
      businessName: "Enter your business name",
      businessEmail: "Enter business email address",
      businessPhone: "Enter business phone number",
      businessAddress: "Enter business address",
      businessCity: "Enter city",
      businessState: "Enter state",
      businessDescription: "Describe your business"
    };
    return placeholders[field] || `Enter ${field}`;
  };

  const getKeyboardType = (field) => {
    if (field === 'email' || field === 'businessEmail') return 'email-address';
    if (field === 'phone' || field === 'businessPhone') return 'phone-pad';
    return 'default';
  };

  const displayValue = (value) => {
    return value || "Not provided";
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
      count: "15",
      onPress: () => router.push("/seller/(tabs)/products"),
    },
    {
      title: "Orders",
      icon: "shopping-cart",
      iconType: "feather",
      count: "23",
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
      count: "47",
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
      rightElement: <Text style={[styles.settingsValue, {color: '#10B981'}]}>Active</Text>,
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
      {/* Custom Alert Modal */}
      {Platform.OS !== 'ios' && (
        <Modal visible={showAlert} transparent={true} animationType="fade" onRequestClose={hideAlert}>
          <TouchableWithoutFeedback onPress={alertConfig.showActions ? undefined : hideAlert}>
            <View style={styles.alertOverlay}>
              <Animated.View style={[styles.alertContainer, { transform: [{ scale: alertScaleAnim }], opacity: alertScaleAnim }]}>
                <View style={styles.alertIconContainer}>
                  <Ionicons name={alertConfig.icon} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>{alertConfig.title}</Text>
                  <Text style={styles.alertMessage}>{alertConfig.message}</Text>
                </View>
                <TouchableOpacity onPress={hideAlert} style={styles.alertCloseButton}>
                  <Ionicons name="close" size={20} color="#6B7280" />
                </TouchableOpacity>
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
                encodeURIComponent(businessInfo.businessName || "Business") +
                "&background=7C3AED&color=fff&size=200",
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{businessInfo.businessName}</Text>
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
                <Text style={styles.statNumber}>15</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>23</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.8</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => openEditModal('businessName', businessInfo.businessName, true)}
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
              onPress={() => openEditModal('businessName', businessInfo.businessName, true)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "store", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Business Name</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(businessInfo.businessName)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Business Email */}
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('businessEmail', businessInfo.businessEmail, true)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "mail", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Business Email</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(businessInfo.businessEmail)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Business Phone */}
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('businessPhone', businessInfo.businessPhone, true)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "phone", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Business Phone</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(businessInfo.businessPhone)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Business Address */}
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('businessAddress', businessInfo.businessAddress, true)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "map-pin", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Business Address</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue}>{displayValue(businessInfo.businessAddress)}</Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>

            {/* Business Description */}
            <TouchableOpacity 
              style={styles.infoRow}
              onPress={() => openEditModal('businessDescription', businessInfo.businessDescription, true)}
            >
              <View style={styles.infoLeft}>
                {getIconComponent("feather", "file-text", "#6B7280", 18)}
                <Text style={styles.infoLabel}>Business Description</Text>
              </View>
              <View style={styles.infoRight}>
                <Text style={styles.infoValue} numberOfLines={1}>
                  {displayValue(businessInfo.businessDescription)}
                </Text>
                <Feather name="edit-2" size={16} color="#9CA3AF" />
              </View>
            </TouchableOpacity>
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
                  {item.count && (
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
                  multiline={editingField?.field === 'businessDescription'}
                  numberOfLines={editingField?.field === 'businessDescription' ? 3 : 1}
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

// Keep all the same styles from your buyer profile, just update colors if needed
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
  // Modal Styles (same as buyer profile)
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
  // Alert Styles
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
  },
  alertIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#7C3AED",
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
  },
  alertCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
});