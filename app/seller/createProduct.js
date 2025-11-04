import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from '../../hooks/useAuth';

export default function AddProduct() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    status: true,
    tags: [],
    categories: [],
    sku: "",
    slug: "",
    discount: "0",
    images: []
  });

  const [currentTag, setCurrentTag] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Get token from storage
  const getTokenFromStorage = async () => {
    try {
      let token;
      if (Platform.OS === "web") {
        token = await AsyncStorage.getItem("access_token");
      } else {
        token = await SecureStore.getItemAsync("access_token");
      }
      
      console.log('Retrieved token:', token ? `Length: ${token.length}` : 'No token');
      
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
          console.log('Fallback token from user_data:', token ? `Length: ${token.length}` : 'No token');
        }
      }
      
      return token;
    } catch (error) {
      console.error("Error getting token from storage:", error);
      return null;
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add tag
  const addTag = () => {
    if (currentTag.trim() && !form.tags.includes(currentTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Pick images from device
  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: false,
        selectionLimit: 10 - form.images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setForm(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
        Alert.alert('Success', `Added ${newImages.length} images!`);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  // Remove image
  const removeImage = (imageToRemove) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }));
  };

  // Generate SKU
  const generateSKU = () => {
    const randomSKU = `SKU${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    handleInputChange('sku', randomSKU);
  };

  // Generate slug from name
  const generateSlug = () => {
    if (form.name) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      handleInputChange('slug', `${slug}-${randomNum}`);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return false;
    }
    if (!form.description.trim()) {
      Alert.alert('Validation Error', 'Product description is required');
      return false;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      Alert.alert('Validation Error', 'Valid price is required');
      return false;
    }
    if (!form.stock || parseInt(form.stock) < 0) {
      Alert.alert('Validation Error', 'Valid stock quantity is required');
      return false;
    }
    if (form.images.length === 0) {
      Alert.alert('Validation Error', 'At least one product image is required');
      return false;
    }
    if (form.categories.length === 0) {
      Alert.alert('Validation Error', 'At least one category is required');
      return false;
    }
    return true;
  };

  // Get file name from URI
  const getFileNameFromUri = (uri) => {
    return uri.split('/').pop();
  };

  // Get MIME type from URI
  const getMimeTypeFromUri = (uri) => {
    const extension = uri.split('.').pop().toLowerCase();
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    return mimeTypes[extension] || 'image/jpeg';
  };

  // Main product submission using XMLHttpRequest (better for file uploads)
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const token = await getTokenFromStorage();
      
      if (!token) {
        Alert.alert('Authentication Required', 'Please login to create products.');
        setLoading(false);
        return;
      }

      console.log('Creating FormData with token:', token.substring(0, 20) + '...');

      // Create FormData object
      const formData = new FormData();

      // Append all fields as form data
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('price', parseFloat(form.price).toString());
      formData.append('stock', parseInt(form.stock).toString());
      formData.append('status', form.status.toString());
      formData.append('tags', form.tags.join(','));
      formData.append('categories', form.categories.join(','));
      formData.append('sku', form.sku.trim());
      formData.append('slug', form.slug.trim());
      formData.append('discount', (parseFloat(form.discount) || 0).toString());

      // Append images as files
      form.images.forEach((imageUri, index) => {
        const fileName = getFileNameFromUri(imageUri);
        const mimeType = getMimeTypeFromUri(imageUri);
        
        formData.append('images', {
          uri: imageUri,
          type: mimeType,
          name: fileName || `product-image-${index}.jpg`
        });
      });

      console.log('FormData created, submitting to API via XHR...');

      // Use XMLHttpRequest for better FormData support
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.open('POST', 'https://ready9ja-api.onrender.com/api/v1/products');
        xhr.setRequestHeader('Accept', '*/*');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        
        xhr.onload = function() {
          console.log('XHR Response status:', xhr.status);
          
          try {
            const result = JSON.parse(xhr.responseText);
            console.log('XHR Response:', result);

            if (xhr.status >= 200 && xhr.status < 300) {
              console.log('Product created successfully:', result);
              setShowSuccessModal(true);
              resolve(result);
            } else {
              console.error('XHR API Error response:', result);
              
              // If XHR fails, try alternative method
              if (xhr.status === 401 || xhr.status === 500) {
                Alert.alert(
                  'Upload Failed', 
                  'Trying alternative upload method...',
                  [
                    {
                      text: 'OK',
                      onPress: () => tryAlternativeUploadMethod()
                    }
                  ]
                );
              } else {
                reject(new Error(result.message || `Failed to create product: ${xhr.status}`));
              }
            }
          } catch (parseError) {
            console.error('XHR Parse error:', parseError);
            reject(new Error('Failed to parse response'));
          }
        };
        
        xhr.onerror = function() {
          console.error('XHR Network error');
          Alert.alert(
            'Network Error', 
            'Trying alternative upload method...',
            [
              {
                text: 'OK',
                onPress: () => tryAlternativeUploadMethod()
              }
            ]
          );
        };
        
        xhr.ontimeout = function() {
          console.error('XHR Timeout');
          reject(new Error('Request timeout'));
        };
        
        console.log('Sending XHR request with FormData...');
        xhr.send(formData);
      });
      
    } catch (error) {
      console.error('Product creation error:', error);
      Alert.alert('Error', error.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Alternative upload method using fetch
  const tryAlternativeUploadMethod = async () => {
    try {
      setLoading(true);
      const token = await getTokenFromStorage();
      
      console.log('Trying alternative upload method with fetch...');
      
      const formData = new FormData();
      
      // Append all fields
      formData.append('name', form.name.trim());
      formData.append('description', form.description.trim());
      formData.append('price', parseFloat(form.price).toString());
      formData.append('stock', parseInt(form.stock).toString());
      formData.append('status', form.status.toString());
      formData.append('tags', form.tags.join(','));
      formData.append('categories', form.categories.join(','));
      formData.append('sku', form.sku.trim());
      formData.append('slug', form.slug.trim());
      formData.append('discount', (parseFloat(form.discount) || 0).toString());

      // Append images
      form.images.forEach((imageUri, index) => {
        const fileName = getFileNameFromUri(imageUri);
        const mimeType = getMimeTypeFromUri(imageUri);
        
        formData.append('images', {
          uri: imageUri,
          type: mimeType,
          name: fileName || `product-image-${index}.jpg`
        });
      });

      // Don't set Content-Type header - let React Native set it with boundary
      const response = await fetch('https://ready9ja-api.onrender.com/api/v1/products', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      console.log('Alternative method response:', response.status, result);

      if (response.ok) {
        console.log('Product created successfully via alternative method:', result);
        setShowSuccessModal(true);
      } else {
        throw new Error(result.message || `Failed to create product: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Alternative method error:', error);
      Alert.alert('Upload Failed', error.message || 'Please try again with smaller images or check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      status: true,
      tags: [],
      categories: [],
      sku: "",
      slug: "",
      discount: "0",
      images: []
    });
    setShowSuccessModal(false);
  };

  // Format price
  const formatPrice = (value) => {
    const numericValue = value.replace(/[^\d.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return numericValue;
  };

  // Add category
  const addCategory = () => {
    if (currentCategory.trim() && !form.categories.includes(currentCategory.trim())) {
      setForm(prev => ({
        ...prev,
        categories: [...prev.categories, currentCategory.trim()]
      }));
      setCurrentCategory("");
    }
  };

  // Remove category
  const removeCategory = (categoryToRemove) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category !== categoryToRemove)
    }));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#7C3AED" />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Product</Text>
          <View style={styles.headerRight} />
        </View>

        <Text style={styles.subtitle}>
          Fill in the details below to list your product on Ready9ja
        </Text>

        {/* Product Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Product Images {form.images.length > 0 && `(${form.images.length})`}
          </Text>
          <Text style={styles.sectionSubtitle}>
            Upload product images from your device (Max 10 images)
          </Text>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imagesContainer}
          >
            {/* Add Image Button */}
            <TouchableOpacity 
              style={[styles.addImageButton, loading && styles.disabledButton]}
              onPress={pickImages}
              disabled={form.images.length >= 10 || loading}
            >
              <Ionicons name="camera-outline" size={32} color="#7C3AED" />
              <Text style={styles.addImageText}>Add Images</Text>
              <Text style={styles.imageCount}>
                {form.images.length}/10
              </Text>
            </TouchableOpacity>

            {/* Image Previews */}
            {form.images.map((image, index) => (
              <View key={index} style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(image)}
                  disabled={loading}
                >
                  <Ionicons name="close-circle" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={[styles.input, loading && styles.disabledInput]}
              placeholder="Enter product name"
              value={form.name}
              onChangeText={(value) => handleInputChange('name', value)}
              onBlur={generateSlug}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, loading && styles.disabledInput]}
              placeholder="Describe your product features, specifications, etc."
              value={form.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price (₦) *</Text>
              <TextInput
                style={[styles.input, loading && styles.disabledInput]}
                placeholder="0.00"
                value={form.price}
                onChangeText={(value) => handleInputChange('price', formatPrice(value))}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Stock Quantity *</Text>
              <TextInput
                style={[styles.input, loading && styles.disabledInput]}
                placeholder="0"
                value={form.stock}
                onChangeText={(value) => handleInputChange('stock', value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Discount (%)</Text>
              <TextInput
                style={[styles.input, loading && styles.disabledInput]}
                placeholder="0"
                value={form.discount}
                onChangeText={(value) => handleInputChange('discount', value.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Product Status</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>
                    {form.status ? 'Active' : 'Inactive'}
                  </Text>
                  <Switch
                    value={form.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                    trackColor={{ false: '#D1D5DB', true: '#7C3AED' }}
                    thumbColor="#FFFFFF"
                    disabled={loading}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Product Identifiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Identifiers</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>SKU (Stock Keeping Unit)</Text>
              <TouchableOpacity 
                onPress={generateSKU} 
                style={[styles.generateButton, loading && styles.disabledButton]}
                disabled={loading}
              >
                <Text style={styles.generateButtonText}>Generate</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, loading && styles.disabledInput]}
              placeholder="SKU12345"
              value={form.sku}
              onChangeText={(value) => handleInputChange('sku', value)}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Product Slug</Text>
              <TouchableOpacity 
                onPress={generateSlug} 
                style={[styles.generateButton, loading && styles.disabledButton]}
                disabled={loading}
              >
                <Text style={styles.generateButtonText}>Generate</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, loading && styles.disabledInput]}
              placeholder="product-name"
              value={form.slug}
              onChangeText={(value) => handleInputChange('slug', value)}
              editable={!loading}
            />
          </View>
        </View>

        {/* Categories & Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories & Tags</Text>
          
          {/* Categories */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categories *</Text>
            <Text style={styles.sectionSubtitle}>
              Enter category names (e.g., Electronics, Fashion, Food)
            </Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.input, styles.tagInput, loading && styles.disabledInput]}
                placeholder="Add a category (e.g., Electronics)"
                value={currentCategory}
                onChangeText={setCurrentCategory}
                onSubmitEditing={addCategory}
                editable={!loading}
              />
              <TouchableOpacity 
                style={[styles.addTagButton, loading && styles.disabledButton]}
                onPress={addCategory}
                disabled={!currentCategory.trim() || loading}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={currentCategory.trim() && !loading ? "#7C3AED" : "#9CA3AF"} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Category Tags */}
            {form.categories.length > 0 && (
              <View style={styles.tagsContainer}>
                {form.categories.map((category, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{category}</Text>
                    <TouchableOpacity 
                      onPress={() => removeCategory(category)}
                      style={styles.removeTagButton}
                      disabled={loading}
                    >
                      <Ionicons name="close" size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Tags */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.input, styles.tagInput, loading && styles.disabledInput]}
                placeholder="Add a tag (e.g., smartphone)"
                value={currentTag}
                onChangeText={setCurrentTag}
                onSubmitEditing={addTag}
                editable={!loading}
              />
              <TouchableOpacity 
                style={[styles.addTagButton, loading && styles.disabledButton]}
                onPress={addTag}
                disabled={!currentTag.trim() || loading}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={currentTag.trim() && !loading ? "#7C3AED" : "#9CA3AF"} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Tag Tags */}
            {form.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {form.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity 
                      onPress={() => removeTag(tag)}
                      style={styles.removeTagButton}
                      disabled={loading}
                    >
                      <Ionicons name="close" size={14} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton, loading && styles.disabledButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.submitButton, 
              loading && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Publishing...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Publish Product</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            </View>
            
            <Text style={styles.successTitle}>Product Published! 🎉</Text>
            
            <Text style={styles.successMessage}>
              Your product has been successfully listed on Ready9ja marketplace.
            </Text>

            <View style={styles.successActions}>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={resetForm}
              >
                <Text style={styles.secondaryButtonText}>Add Another Product</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={() => router.push('/seller/(tabs)/products')}
              >
                <Text style={styles.primaryButtonText}>View Products</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    color: '#9CA3AF',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  switchContainer: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  generateButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  // Images Section
  imagesContainer: {
    flexDirection: 'row',
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#F9FAFB',
  },
  addImageText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
    marginTop: 8,
  },
  imageCount: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // Tags & Categories
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    marginRight: 8,
  },
  addTagButton: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '500',
  },
  removeTagButton: {
    padding: 2,
  },
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#C4B5FD',
    shadowOpacity: 0.1,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});