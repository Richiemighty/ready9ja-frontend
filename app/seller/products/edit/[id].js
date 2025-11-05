import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
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
import { useAuth } from '../../../../hooks/useAuth';

export default function EditProduct() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
  const [originalForm, setOriginalForm] = useState(null);

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

  // Fetch product data
// Fetch product data
    const fetchProduct = async () => {
    try {
        setFetching(true);
        const token = await getTokenFromStorage();
        
        if (!token) {
        Alert.alert('Authentication Required', 'Please login to edit products.');
        router.back();
        return;
        }

        console.log('Fetching product with ID:', id);

        const response = await fetch(`https://ready9ja-api.onrender.com/api/v1/products/${id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        },
        });

        if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Fetched product data:', responseData);

        // Extract product data from the nested structure
        const productData = responseData.product || responseData;

        // Transform API response to form state
        const transformedForm = {
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price?.toString() || "",
        stock: productData.stock?.toString() || "0",
        status: productData.status !== false, // Default to true if not specified
        // Handle tags - if it's a string, split into array; if array, use as is
        tags: productData.tags ? 
            (Array.isArray(productData.tags) ? 
            productData.tags : 
            productData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)) 
            : [],
        // Handle categories - if it's a string, split into array; if array, use as is
        categories: productData.categories ? 
            (Array.isArray(productData.categories) ? 
            productData.categories.map(cat => typeof cat === 'string' ? cat : cat.name || cat) :
            productData.categories.split(',').map(cat => cat.trim()).filter(cat => cat))
            : [],
        sku: productData.sku || "",
        slug: productData.slug || "",
        discount: productData.discount?.toString() || "0",
        images: productData.images || []
        };

        console.log('Transformed form data:', transformedForm);

        setForm(transformedForm);
        setOriginalForm(transformedForm);

    } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Error', `Failed to load product data: ${error.message}`);
        router.back();
    } finally {
        setFetching(false);
    }
    };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

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

  // Check if form has changes
  const hasChanges = () => {
    if (!originalForm) return false;
    
    return JSON.stringify(form) !== JSON.stringify(originalForm);
  };

  // Update product using PATCH

    const handleUpdate = async () => {
    if (!validateForm()) return;

    if (!hasChanges()) {
        Alert.alert('No Changes', 'No changes were made to the product.');
        return;
    }

    setLoading(true);
    
    try {
        const token = await getTokenFromStorage();
        
        if (!token) {
        Alert.alert('Authentication Required', 'Please login to update products.');
        return;
        }

        // Prepare update data according to API schema
        // The API expects tags and categories as comma-separated strings, not arrays
        const updateData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        status: form.status,
        tags: Array.isArray(form.tags) ? form.tags.join(',') : form.tags, // Convert array to string
        categories: Array.isArray(form.categories) ? form.categories.join(',') : form.categories, // Convert array to string
        sku: form.sku.trim(),
        slug: form.slug.trim(),
        discount: parseFloat(form.discount) || 0,
        images: form.images
        };

        console.log('Updating product with data:', updateData);

        const response = await fetch(`https://ready9ja-api.onrender.com/api/v1/products/${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(updateData),
        });

        const result = await response.json();
        console.log('Update response status:', response.status);
        console.log('Update response data:', result);

        if (response.ok) {
        console.log('Product updated successfully');
        setShowSuccessModal(true);
        setOriginalForm(form); // Update original form to current state
        } else {
        throw new Error(result.message || `Failed to update product: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Product update error:', error);
        Alert.alert('Error', error.message || 'Failed to update product. Please try again.');
    } finally {
        setLoading(false);
    }
    };

  // Reset form to original values
  const resetForm = () => {
    if (originalForm) {
      setForm(originalForm);
      Alert.alert('Form Reset', 'All changes have been discarded.');
    }
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

  // Delete product
  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteProduct
        }
      ]
    );
  };

  const deleteProduct = async () => {
    try {
      setLoading(true);
      const token = await getTokenFromStorage();
      
      const response = await fetch(`https://ready9ja-api.onrender.com/api/v1/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Product deleted successfully', [
          { text: 'OK', onPress: () => router.replace('/seller/(tabs)/products') }
        ]);
      } else {
        const result = await response.json();
        throw new Error(result.message || `Failed to delete product: ${response.status}`);
      }
    } catch (error) {
      console.error('Delete product error:', error);
      Alert.alert('Error', error.message || 'Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading product data...</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>Edit Product</Text>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Update your product information below
        </Text>

        {/* Product Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Product Images {form.images.length > 0 && `(${form.images.length})`}
          </Text>
          <Text style={styles.sectionSubtitle}>
            Update product images (Max 10 images)
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
            onPress={resetForm}
            disabled={!hasChanges() || loading}
          >
            <Text style={styles.cancelButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.submitButton, 
              (!hasChanges() || loading) && styles.submitButtonDisabled
            ]}
            onPress={handleUpdate}
            disabled={!hasChanges() || loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Updating...</Text>
              </View>
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Update Product</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Indicator */}
        {hasChanges() && (
          <View style={styles.changesIndicator}>
            <Ionicons name="information-circle" size={16} color="#7C3AED" />
            <Text style={styles.changesText}>You have unsaved changes</Text>
          </View>
        )}
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
            
            <Text style={styles.successTitle}>Product Updated! ✅</Text>
            
            <Text style={styles.successMessage}>
              Your product has been successfully updated on Ready9ja marketplace.
            </Text>

            <View style={styles.successActions}>
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={() => setShowSuccessModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Continue Editing</Text>
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

// ... (styles remain the same as in the previous edit product code)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
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
  deleteButton: {
    padding: 8,
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
    marginBottom: 12,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Changes Indicator
  changesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 32,
    gap: 8,
  },
  changesText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
  },

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