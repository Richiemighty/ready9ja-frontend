import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Modal,
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
  const [imageUrl, setImageUrl] = useState(""); // For manual image URL input

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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

  // COMMENTED OUT: Cloudinary upload function
  /*
  const uploadImageToCloudinary = async (imageUri) => {
    try {
      // Get the file name from the URI
      const filename = imageUri.split('/').pop();
      
      // Determine the MIME type
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const formData = new FormData();
      
      // Append the file correctly for React Native
      formData.append('file', {
        uri: imageUri,
        type: type,
        name: filename || 'product-image.jpg'
      });
      
      formData.append('upload_preset', 'READY9JA');
      formData.append('cloud_name', 'djock9yc0');

      console.log('Uploading to Cloudinary...', {
        upload_preset: 'READY9JA',
        cloud_name: 'djock9yc0'
      });

      const response = await fetch('https://api.cloudinary.com/v1_1/djock9yc0/image/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      console.log('Cloudinary response:', data);
      
      if (data.secure_url) {
        console.log('Image uploaded successfully:', data.secure_url);
        return data.secure_url;
      } else {
        console.error('Cloudinary upload failed:', data);
        throw new Error(data.error?.message || 'Image upload failed');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };
  */

  // COMMENTED OUT: Image picker with Cloudinary upload
  /*
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
        setImageUploading(true);
        
        try {
          const uploadedImageUrls = [];
          
          for (const asset of result.assets) {
            if (form.images.length + uploadedImageUrls.length >= 10) {
              Alert.alert('Limit reached', 'You can only upload up to 10 images');
              break;
            }
            
            try {
              console.log('Uploading image:', asset.uri);
              const uploadedUrl = await uploadImageToCloudinary(asset.uri);
              uploadedImageUrls.push(uploadedUrl);
            } catch (uploadError) {
              console.error('Failed to upload image:', uploadError);
              Alert.alert('Upload Error', `Failed to upload one image: ${uploadError.message}`);
            }
          }
          
          if (uploadedImageUrls.length > 0) {
            setForm(prev => ({
              ...prev,
              images: [...prev.images, ...uploadedImageUrls]
            }));
            Alert.alert('Success', `Successfully uploaded ${uploadedImageUrls.length} images!`);
          }
          
        } catch (error) {
          console.error('Upload process error:', error);
          Alert.alert('Upload Error', 'Failed to upload images. Please try again.');
        } finally {
          setImageUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
      setImageUploading(false);
    }
  };
  */

  // Add image via URL
  const addImageByUrl = () => {
    if (imageUrl.trim() && !form.images.includes(imageUrl.trim())) {
      // Basic URL validation
      if (!imageUrl.trim().startsWith('http')) {
        Alert.alert('Invalid URL', 'Please enter a valid image URL starting with http:// or https://');
        return;
      }

      if (form.images.length >= 10) {
        Alert.alert('Limit reached', 'You can only add up to 10 images');
        return;
      }

      setForm(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
      setImageUrl("");
      Alert.alert('Success', 'Image URL added successfully!');
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

  // Submit form to API
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Prepare data for API
      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        status: form.status,
        tags: form.tags.join(','),
        categories: form.categories,
        sku: form.sku.trim(),
        slug: form.slug.trim(),
        discount: parseFloat(form.discount) || 0,
        images: form.images // Using direct image URLs
      };

      console.log('Submitting product:', productData);

      const response = await fetch('https://ready9ja-api.onrender.com/api/v1/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Product created successfully:', result);
        setShowSuccessModal(true);
      } else {
        console.error('API Error response:', result);
        throw new Error(result.message || `Failed to create product: ${response.status}`);
      }
      
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', error.message || 'Failed to create product. Please try again.');
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
    setImageUrl("");
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
          >
            <Ionicons name="arrow-back" size={24} color="#7C3AED" />
          </TouchableOpacity>
          <Text style={styles.title}>Add New Product</Text>
          <View style={styles.headerRight} />
        </View>

        <Text style={styles.subtitle}>
          Fill in the details below to list your product on Ready9ja
        </Text>

        {/* Product Images - UPDATED FOR URL INPUT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Product Images {form.images.length > 0 && `(${form.images.length})`}
          </Text>
          <Text style={styles.sectionSubtitle}>
            Add product image URLs (Max 10 images)
          </Text>

          {/* Image URL Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image URL</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChangeText={setImageUrl}
                onSubmitEditing={addImageByUrl}
                keyboardType="url"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.addTagButton}
                onPress={addImageByUrl}
                disabled={!imageUrl.trim()}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={imageUrl.trim() ? "#7C3AED" : "#9CA3AF"} 
                />
              </TouchableOpacity>
            </View>
            <Text style={[styles.sectionSubtitle, {fontSize: 12, marginTop: 4}]}>
              Enter full image URL (e.g., https://res.cloudinary.com/.../image.jpg)
            </Text>
          </View>

          {/* Image Previews */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.imagesContainer}
          >
            {/* Add Image Placeholder */}
            <View style={styles.addImageButton}>
              <Ionicons name="link-outline" size={32} color="#7C3AED" />
              <Text style={styles.addImageText}>Add URL</Text>
              <Text style={styles.imageCount}>
                {form.images.length}/10
              </Text>
            </View>

            {/* Image Previews */}
            {form.images.map((image, index) => (
              <View key={index} style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: image }} 
                  style={styles.imagePreview} 
                  onError={() => {
                    console.log('Failed to load image:', image);
                    Alert.alert('Image Error', `Failed to load image: ${image}`);
                  }}
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(image)}
                >
                  <Ionicons name="close-circle" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Sample Image URLs for Testing */}
          <View style={styles.sampleUrlsContainer}>
            <Text style={styles.sampleUrlsTitle}>Sample Image URLs (for testing):</Text>
            <TouchableOpacity onPress={() => setImageUrl('https://res.cloudinary.com/djock9yc0/image/upload/v1761630324/READY9JA/lfdrqj0xm2bkcidppt1l.webp')}>
              <Text style={styles.sampleUrl}>Sample Product Image 1</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setImageUrl('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400')}>
              <Text style={styles.sampleUrl}>Sample Product Image 2</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name"
              value={form.name}
              onChangeText={(value) => handleInputChange('name', value)}
              onBlur={generateSlug}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your product features, specifications, etc."
              value={form.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Price (₦) *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={form.price}
                onChangeText={(value) => handleInputChange('price', formatPrice(value))}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Stock Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={form.stock}
                onChangeText={(value) => handleInputChange('stock', value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Discount (%)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={form.discount}
                onChangeText={(value) => handleInputChange('discount', value.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
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
              <TouchableOpacity onPress={generateSKU} style={styles.generateButton}>
                <Text style={styles.generateButtonText}>Generate</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="SKU12345"
              value={form.sku}
              onChangeText={(value) => handleInputChange('sku', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Product Slug</Text>
              <TouchableOpacity onPress={generateSlug} style={styles.generateButton}>
                <Text style={styles.generateButtonText}>Generate</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="product-name"
              value={form.slug}
              onChangeText={(value) => handleInputChange('slug', value)}
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
                style={[styles.input, styles.tagInput]}
                placeholder="Add a category (e.g., Electronics)"
                value={currentCategory}
                onChangeText={setCurrentCategory}
                onSubmitEditing={addCategory}
              />
              <TouchableOpacity 
                style={styles.addTagButton}
                onPress={addCategory}
                disabled={!currentCategory.trim()}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={currentCategory.trim() ? "#7C3AED" : "#9CA3AF"} 
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
                style={[styles.input, styles.tagInput]}
                placeholder="Add a tag (e.g., smartphone)"
                value={currentTag}
                onChangeText={setCurrentTag}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity 
                style={styles.addTagButton}
                onPress={addTag}
                disabled={!currentTag.trim()}
              >
                <Ionicons 
                  name="add" 
                  size={20} 
                  color={currentTag.trim() ? "#7C3AED" : "#9CA3AF"} 
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
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
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
  // Sample URLs
  sampleUrlsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  sampleUrlsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  sampleUrl: {
    fontSize: 12,
    color: '#7C3AED',
    textDecorationLine: 'underline',
    marginBottom: 4,
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