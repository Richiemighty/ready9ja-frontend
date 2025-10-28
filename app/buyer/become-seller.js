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

export default function BecomeSeller() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: "",
    yearLaunched: "",
    businessAddress: "",
    category: "",
    nin: "",
  });
  const [loading, setLoading] = useState(false);
  const [logoImage, setLogoImage] = useState(null);
  const [cacImage, setCacImage] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

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
        aspect: type === 'logo' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (type === 'logo') {
          setLogoImage(result.assets[0]);
        } else {
          setCacImage(result.assets[0]);
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
        aspect: type === 'logo' ? [1, 1] : [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (type === 'logo') {
          setLogoImage(result.assets[0]);
        } else {
          setCacImage(result.assets[0]);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImagePickerOptions = (type) => {
    Alert.alert(
      `Upload ${type === 'logo' ? 'Business Logo' : 'CAC Document'}`,
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

  const validateForm = () => {
    if (!form.businessName.trim()) {
      Alert.alert("Missing Information", "Please enter your business name.");
      return false;
    }
    if (!form.yearLaunched || form.yearLaunched.length !== 4 || parseInt(form.yearLaunched) < 1900 || parseInt(form.yearLaunched) > new Date().getFullYear()) {
      Alert.alert("Invalid Year", "Please enter a valid year of launch (e.g., 2020).");
      return false;
    }
    if (!logoImage) {
      Alert.alert("Logo Required", "Please upload your business logo.");
      return false;
    }
    if (!form.businessAddress.trim()) {
      Alert.alert("Address Required", "Please enter your business office address.");
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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create form data for file upload
      const formData = new FormData();
      
      formData.append('businessName', form.businessName);
      formData.append('yearLaunched', form.yearLaunched);
      formData.append('businessAddress', form.businessAddress);
      formData.append('category', form.category);
      formData.append('nin', form.nin);
      
      // Append logo image
      if (logoImage) {
        formData.append('logo', {
          uri: logoImage.uri,
          type: 'image/jpeg',
          name: `logo_${Date.now()}.jpg`,
        });
      }
      
      // Append CAC image
      if (cacImage) {
        formData.append('cacDocument', {
          uri: cacImage.uri,
          type: 'image/jpeg',
          name: `cac_${Date.now()}.jpg`,
        });
      }

      const response = await fetch("https://ready9ja-api.onrender.com/api/sellers/request", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert(
          "✅ Success", 
          "Your seller application has been submitted successfully! Our team will review your application within 2-3 business days.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        const errorData = await response.json();
        Alert.alert("❌ Submission Failed", errorData.message || "Unable to submit your request. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("❌ Network Error", "Unable to connect to server. Please check your internet connection and try again.");
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
        <Text style={styles.headerTitle}>Become a Seller</Text>
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
            value={form.businessName}
            onChangeText={(v) => handleChange("businessName", v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Year Launched *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2020"
            value={form.yearLaunched}
            keyboardType="numeric"
            maxLength={4}
            onChangeText={(v) => handleChange("yearLaunched", v)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Business Logo *</Text>
          <Text style={styles.helperText}>Upload a clear image of your business logo</Text>
          <TouchableOpacity 
            style={styles.imageUploadButton}
            onPress={() => showImagePickerOptions('logo')}
          >
            {logoImage ? (
              <Image source={{ uri: logoImage.uri }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Feather name="upload" size={32} color="#6B7280" />
                <Text style={styles.uploadText}>Tap to upload logo</Text>
                <Text style={styles.uploadSubtext}>Recommended: Square image, 500x500px</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Business Office Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter complete business address including city and state"
            multiline
            numberOfLines={3}
            value={form.businessAddress}
            onChangeText={(v) => handleChange("businessAddress", v)}
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
            onPress={() => setShowCategoryModal(true)}
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
            onPress={() => showImagePickerOptions('cac')}
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
            <Text style={styles.submitText}>Submit Application</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        * Required fields{"\n"}
        Your application will be reviewed within 2-3 business days. You'll receive a notification once approved.
      </Text>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Business Category</Text>
              <TouchableOpacity 
                onPress={() => setShowCategoryModal(false)}
                style={styles.modalClose}
              >
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={businessCategories}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    form.category === item && styles.categoryItemSelected
                  ]}
                  onPress={() => {
                    handleChange("category", item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[
                    styles.categoryItemText,
                    form.category === item && styles.categoryItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {form.category === item && (
                    <Feather name="check" size={20} color="#7C3AED" />
                  )}
                </TouchableOpacity>
              )}
            />
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
});