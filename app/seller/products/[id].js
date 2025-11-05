import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../hooks/useAuth';

export default function ProductDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);

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
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = await getTokenFromStorage();
      
      if (!token) {
        Alert.alert('Authentication Required', 'Please login to view product details.');
        router.back();
        return;
      }

      console.log('Fetching product details with ID:', id);

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
      console.log('Fetched product details:', responseData);

      // Extract product data from the nested structure
      const productData = responseData.product || responseData;
      setProduct(productData);
      
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', `Failed to load product details: ${error.message}`);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/seller/products/edit/${id}`);
  };

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
    }
  };

  const getStatusColor = () => {
    if (!product) return '#6B7280';
    if (product.stock === 0) return '#EF4444';
    if (product.status === false) return '#6B7280';
    return '#10B981';
  };

  const getStatusText = () => {
    if (!product) return 'Loading...';
    if (product.stock === 0) return 'Out of Stock';
    if (product.status === false) return 'Inactive';
    return 'Active';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#6B7280" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#7C3AED" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={20} color="#7C3AED" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Debug Info */}
        <View style={styles.debugSection}>
          <Text style={styles.debugText}>Product ID: {id}</Text>
          <Text style={styles.debugText}>Images: {product.images?.length || 0}</Text>
          <Text style={styles.debugText}>Categories: {product.categories?.length || 0}</Text>
        </View>

        {/* Product Images */}
        <View style={styles.imagesSection}>
          {product.images && product.images.length > 0 ? (
            <>
              <Image
                source={{ uri: product.images[imageIndex] }}
                style={styles.mainImage}
                resizeMode="cover"
              />
              {product.images.length > 1 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.thumbnailsContainer}
                >
                  {product.images.map((image, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setImageIndex(index)}
                    >
                      <Image
                        source={{ uri: image }}
                        style={[
                          styles.thumbnail,
                          index === imageIndex && styles.thumbnailActive
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={64} color="#D1D5DB" />
              <Text style={styles.noImageText}>No images available</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.section}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() + '20' }
            ]}>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.productPrice}>₦{product.price?.toLocaleString()}</Text>
          
          {product.discount > 0 && (
            <View style={styles.discountContainer}>
              <Text style={styles.originalPrice}>
                ₦{(product.price / (1 - product.discount / 100)).toLocaleString()}
              </Text>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>SKU</Text>
              <Text style={styles.detailValue}>{product.sku || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Slug</Text>
              <Text style={styles.detailValue}>{product.slug || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Stock</Text>
              <Text style={styles.detailValue}>{product.stock || 0}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Discount</Text>
              <Text style={styles.detailValue}>{product.discount || 0}%</Text>
            </View>
          </View>
        </View>

        {/* Categories & Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories & Tags</Text>
          
          {product.categories && product.categories.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Categories:</Text>
              <View style={styles.tagsContainer}>
                {product.categories.map((category, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>
                      {typeof category === 'string' ? category : category.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {product.tags && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Tags:</Text>
              <View style={styles.tagsContainer}>
                {product.tags.split(',').map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Business Info */}
        {product.business && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{product.business.name}</Text>
              {product.business.location_address && (
                <Text style={styles.businessAddress}>
                  {product.business.location_address}, {product.business.location_city}
                </Text>
              )}
              <Text style={styles.businessLocation}>
                {product.business.location_state}, {product.business.location_country}
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.editFullButton]}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
  },
  debugSection: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    marginBottom: 0,
  },
  debugText: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  imagesSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  mainImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },
  thumbnailsContainer: {
    marginTop: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#7C3AED',
  },
  noImageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  noImageText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: '48%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  tagsSection: {
    marginBottom: 12,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '500',
  },
  businessInfo: {
    marginTop: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  businessLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  editFullButton: {
    backgroundColor: '#7C3AED',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});