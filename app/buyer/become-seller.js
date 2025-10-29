import { Feather } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from "../../hooks/useAuth";

export default function BecomeSeller() {
  const router = useRouter();
  const { getUser } = useAuth();
  const [form, setForm] = useState({
    name: "",
    yearFounded: "",
    location_address: "",
    location_city: "",
    location_state: "",
    location_country: "Nigeria",
    category: "",
    nin: "",
  });
  const [loading, setLoading] = useState(false);
  const [businessImage, setBusinessImage] = useState(null);
  const [cacImage, setCacImage] = useState(null);
  const [bannerImages, setBannerImages] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const businessCategories = [
    "Fashion & Clothing",
    "Electronics & Gadgets",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Health & Wellness",
    "Food & Beverages",
    "Baby & Kids Products",
    "Sports & Fitness",
    "Automotive Parts",
    "Books & Stationery",
    "Jewelry & Accessories",
    "Furniture & Decor",
    "Mobile Phones & Tablets",
    "Computers & Laptops",
    "Groceries & Supermarket",
    "Pharmaceuticals",
    "Building Materials",
    "Agricultural Products",
    "Art & Crafts",
    "Others"
  ];

  const nigerianStates = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo", 
    "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", 
    "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", 
    "Yobe", "Zamfara"
  ];

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const pickImage = async (type) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'businessImage' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (type === 'businessImage') {
          setBusinessImage(result.assets[0]);
        } else if (type === 'cacImage') {
          setCacImage(result.assets[0]);
        } else if (type === 'banner') {
          setBannerImages(prev => [...prev, result.assets[0]]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async (type) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera permissions to take photos.');
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === 'businessImage' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (type === 'businessImage') {
          setBusinessImage(result.assets[0]);
        } else if (type === 'cacImage') {
          setCacImage(result.assets[0]);
        } else if (type === 'banner') {
          setBannerImages(prev => [...prev, result.assets[0]]);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePickerOptions = (type) => {
    Alert.alert(
      `Upload ${type === 'businessImage' ? 'Business Image' : type === 'cacImage' ? 'CAC Document' : 'Banner Image'}`,
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => takePhoto(type),
        },
        {
          text: "Choose from Gallery",
          onPress: () => pickImage(type),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const removeBannerImage = (index) => {
    setBannerImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert("Missing Information", "Please enter your business name.");
      return false;
    }
    if (!form.yearFounded || form.yearFounded.length !== 4 || parseInt(form.yearFounded) < 1900 || parseInt(form.yearFounded) > new Date().getFullYear()) {
      Alert.alert("Invalid Year", "Please enter a valid year founded (e.g., 2020).");
      return false;
    }
    if (!businessImage) {
      Alert.alert("Business Image Required", "Please upload your business image.");
      return false;
    }
    if (!form.location_address.trim()) {
      Alert.alert("Address Required", "Please enter your business address.");
      return false;
    }
    if (!form.location_city.trim()) {
      Alert.alert("City Required", "Please enter your business city.");
      return false;
    }
    if (!form.location_state) {
      Alert.alert("State Required", "Please select your business state.");
      return false;
    }
    if (!form.category) {
      Alert.alert("Category Required", "Please select your business category.");
      return false;
    }
    if (!form.nin.trim() || form.nin.length !== 11) {
      Alert.alert("Invalid NIN", "Please enter a valid 11-digit National Identification Number.");
      return false;
    }
    if (!cacImage) {
      Alert.alert("CAC Document Required", "Please upload a picture of your CAC document.");
      return false;
    }
    return true;
  };

  // Helper function to get the auth token
  const getAuthToken = async () => {
    try {
      const userData = await getUser();
      return userData?.accessToken;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Get the authentication token
      const token = await getAuthToken();
      if (!token) {
        Alert.alert(
          "🔐 Authentication Required",
          "Please log in to register a business.",
          [{ text: "OK", style: "default" }]
        );
        setLoading(false);
        return;
      }

      // Create form data for file upload
      const formData = new FormData();
      
      // Append text fields
      formData.append('name', form.name);
      formData.append('yearFounded', parseInt(form.yearFounded));
      formData.append('location_address', form.location_address);
      formData.append('location_city', form.location_city);
      formData.append('location_state', form.location_state);
      formData.append('location_country', form.location_country);
      formData.append('category', form.category);
      formData.append('nin', form.nin);
      
      // Append business image
      if (businessImage) {
        formData.append('businessImage', {
          uri: businessImage.uri,
          type: 'image/jpeg',
          name: `businessImage_${Date.now()}.jpg`,
        });
      }
      
      // Append CAC image
      if (cacImage) {
        formData.append('cacImage', {
          uri: cacImage.uri,
          type: 'image/jpeg',
          name: `cacImage_${Date.now()}.jpg`,
        });
      }
      
      // Append banner images
      bannerImages.forEach((image, index) => {
        formData.append('bannerImages', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `banner_${Date.now()}_${index}.jpg`,
        });
      });

      const response = await fetch("https://ready9ja-api.onrender.com/api/v1/business/register", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        Alert.alert(
          "❌ Registration Failed", 
          errorData.message || "Unable to register your business. Please check your information and try again.",
          [
            { 
              text: "Try Again", 
              style: "default" 
            }
          ]
        );
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert(
        "🌐 Connection Issue", 
        `Unable to connect to our servers right now.

Please check your internet connection and try again.

If the problem persists, contact our support team.`,
        [
          { 
            text: "Retry", 
            style: "default" 
          },
          { 
            text: "Cancel", 
            style: "cancel" 
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Register Business</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.subheader}>
        Complete your business profile to start selling on Ready9ja
      </Text>

      {/* Business Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Business Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your registered business name"
            value={form.name}
            onChangeText={(v) => handleChange("name", v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Year Founded *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2020"
            value={form.yearFounded}
            keyboardType="numeric"
            maxLength={4}
            onChangeText={(v) => handleChange("yearFounded", v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Business Image *</Text>
          <Text style={styles.helperText}>Upload a clear image of your business</Text>
          <TouchableOpacity 
            style={styles.imageUploadButton}
            onPress={() => showImagePickerOptions('businessImage')}
          >
            {businessImage ? (
              <Image source={{ uri: businessImage.uri }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Feather name="upload" size={32} color="#6B7280" />
                <Text style={styles.uploadText}>Tap to upload business image</Text>
                <Text style={styles.uploadSubtext}>Recommended: Square image, 500x500px</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Banner Images */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Banner Images</Text>
          <Text style={styles.helperText}>Upload images for your business banner (optional)</Text>
          
          {bannerImages.length > 0 && (
            <View style={styles.bannerImagesContainer}>
              {bannerImages.map((image, index) => (
                <View key={index} style={styles.bannerImageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.bannerImage} />
                  <TouchableOpacity 
                    style={styles.removeBannerButton}
                    onPress={() => removeBannerImage(index)}
                  >
                    <Feather name="x" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.bannerUploadButton}
            onPress={() => showImagePickerOptions('banner')}
          >
            <Feather name="plus" size={24} color="#7C3AED" />
            <Text style={styles.bannerUploadText}>Add Banner Image</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location Information</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter complete business address"
            multiline
            numberOfLines={3}
            value={form.location_address}
            onChangeText={(v) => handleChange("location_address", v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your business city"
            value={form.location_city}
            onChangeText={(v) => handleChange("location_city", v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>State *</Text>
          <TouchableOpacity 
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal('state')}
          >
            <Text style={form.location_state ? styles.categorySelectedText : styles.categoryPlaceholder}>
              {form.location_state || "Select your state"}
            </Text>
            <Feather name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            value={form.location_country}
            editable={false}
          />
        </View>
      </View>

      {/* Business Category Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Category</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category of Business *</Text>
          <TouchableOpacity 
            style={styles.categorySelector}
            onPress={() => setShowCategoryModal('category')}
          >
            <Text style={form.category ? styles.categorySelectedText : styles.categoryPlaceholder}>
              {form.category || "Select your business category"}
            </Text>
            <Feather name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Legal Documentation Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal Documentation</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>NIN (National Identification Number) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your 11-digit NIN"
            value={form.nin}
            keyboardType="numeric"
            maxLength={11}
            onChangeText={(v) => handleChange("nin", v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>CAC Document *</Text>
          <Text style={styles.helperText}>Upload a clear photo of your CAC registration certificate</Text>
          <TouchableOpacity 
            style={styles.imageUploadButton}
            onPress={() => showImagePickerOptions('cacImage')}
          >
            {cacImage ? (
              <Image source={{ uri: cacImage.uri }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Feather name="file-text" size={32} color="#6B7280" />
                <Text style={styles.uploadText}>Tap to upload CAC document</Text>
                <Text style={styles.uploadSubtext}>Clear photo of your CAC certificate</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Feather name="send" size={20} color="#fff" />
            <Text style={styles.submitText}>Register Business</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        * Required fields{"\n"}
        Your business will be registered immediately upon successful submission.
      </Text>

      {/* Category/State Selection Modal */}
      <Modal
        visible={showCategoryModal !== false}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showCategoryModal === 'category' ? 'Select Business Category' : 'Select State'}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowCategoryModal(false)}
                style={styles.modalClose}
              >
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={showCategoryModal === 'category' ? businessCategories : nigerianStates}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    (showCategoryModal === 'category' ? form.category === item : form.location_state === item) && styles.categoryItemSelected
                  ]}
                  onPress={() => {
                    if (showCategoryModal === 'category') {
                      handleChange("category", item);
                    } else {
                      handleChange("location_state", item);
                    }
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.categoryItemText,
                    (showCategoryModal === 'category' ? form.category === item : form.location_state === item) && styles.categoryItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {(showCategoryModal === 'category' ? form.category === item : form.location_state === item) && (
                    <Feather name="check" size={20} color="#7C3AED" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Custom Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Feather name="check-circle" size={60} color="#10B981" />
            </View>
            
            <Text style={styles.successTitle}>Application Submitted!</Text>
            
            <Text style={styles.successMessage}>
              Your information has been uploaded successfully. We will review and get back to you within 48 hours.
            </Text>
            
            <View style={styles.successDetails}>
              <View style={styles.detailItem}>
                <Feather name="check" size={20} color="#10B981" />
                <Text style={styles.detailText}>Business information received</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="clock" size={20} color="#F59E0B" />
                <Text style={styles.detailText}>Under review (48 hours)</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="mail" size={20} color="#7C3AED" />
                <Text style={styles.detailText}>Email notification upon approval</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.successButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.back();
              }}
            >
              <Text style={styles.successButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    // position: "fixed",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 68,
    position: "sticky",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  placeholder: {
    width: 40,
  },
  subheader: {
    color: "#6B7280",
    fontSize: 14,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    lineHeight: 20,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#FFFFFF",
  },
  categoryPlaceholder: {
    color: "#9CA3AF",
    fontSize: 15,
  },
  categorySelectedText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "500",
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 12,
    overflow: "hidden",
  },
  uploadPlaceholder: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadedImage: {
    width: "100%",
    height: 200,
  },
  uploadText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtext: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
  },
  bannerImagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  bannerImageWrapper: {
    position: "relative",
    width: 80,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  removeBannerButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  bannerUploadText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  footerNote: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 20,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
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
    fontWeight: "bold",
    color: "#1F2937",
  },
  modalClose: {
    padding: 4,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  categoryItemSelected: {
    backgroundColor: "#F5F3FF",
  },
  categoryItemText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  categoryItemTextSelected: {
    color: "#7C3AED",
    fontWeight: "600",
  },
  // Success Modal Styles
  successModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
    textAlign: "center",
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  successDetails: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
    flex: 1,
  },
  successButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});