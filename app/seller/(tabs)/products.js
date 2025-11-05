import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../../constants/api';
import { useAuth } from '../../../hooks/useAuth';

export default function SellerProducts() {
  const router = useRouter();
  const { getUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [businessId, setBusinessId] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    loadBusinessIdAndProducts();
  }, []);

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

  const getAuthToken = async () => {
    try {
      const userData = await getUser();
      return userData?.accessToken;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Fetch business profile to get the actual business ID
  const getBusinessProfile = async () => {
    try {
      const token = await getTokenFromStorage();
      if (!token) {
        console.warn("No token found for business profile");
        return null;
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
        if (response.status === 404) {
          console.log("Business profile not found - user may not have completed business registration");
          return null;
        }
        throw new Error(`Failed to fetch business profile: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Business profile response:", responseData);

      if (responseData.businessProfile) {
        const businessData = responseData.businessProfile;
        setBusinessInfo(businessData);
        return businessData.id; // Return the actual business ID
      } else {
        throw new Error("No business profile found in response");
      }

    } catch (error) {
      console.error('Error fetching business profile:', error);
      return null;
    }
  };

  const getBusinessId = async () => {
    try {
      // First try to get from business profile API
      const businessProfileId = await getBusinessProfile();
      if (businessProfileId) {
        console.log("Found business ID from business profile:", businessProfileId);
        return businessProfileId;
      }

      // Fallback to user data
      const userData = await getUser();
      
      if (userData?.user?.businessId) {
        console.log("Found business ID from user data:", userData.user.businessId);
        return userData.user.businessId;
      }
      
      const token = await getAuthToken();
      if (!token) return null;

      // Final fallback - try seller profile
      try {
        const sellerProfileResponse = await api.get('/seller/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (sellerProfileResponse.data?.businessId) {
          console.log("Found business ID from seller profile:", sellerProfileResponse.data.businessId);
          return sellerProfileResponse.data.businessId;
        }
      } catch (sellerError) {
        console.log('Seller profile not available');
      }

      // If no business ID found, show appropriate message
      console.log('No business ID found - user needs to complete business registration');
      return null;
      
    } catch (error) {
      console.error('Error getting business ID:', error);
      return null;
    }
  };

  const loadBusinessIdAndProducts = async () => {
    setLoading(true);
    try {
      const businessId = await getBusinessId();
      if (!businessId) {
        Alert.alert(
          'Business Registration Required', 
          'You need to complete your business registration before you can manage products. Please set up your business profile first.',
          [
            { 
              text: 'Setup Business', 
              onPress: () => router.push('/seller/business-setup') 
            },
            { 
              text: 'Cancel', 
              style: 'cancel' 
            }
          ]
        );
        setLoading(false);
        return;
      }
      
      setBusinessId(businessId);
      await loadProducts(businessId);
    } catch (error) {
      console.error('Error loading business data:', error);
      Alert.alert('Error', 'Failed to load business information.');
      setLoading(false);
    }
  };

  const loadProducts = async (businessId) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to view products.');
        return;
      }

      console.log(`Fetching products for business ID: ${businessId}`);

      const response = await api.get(`/products/business/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Products API Response:', response.data);

      const productsData = response.data?.products || [];
      setProducts(productsData);
      
      if (productsData.length === 0) {
        console.log('No products found for this business');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      
      if (error.response) {
        console.error('API Error Response:', error.response.data);
        if (error.response.status === 404) {
          Alert.alert('Business Not Found', 'Your business profile was not found. Please complete your seller setup.');
        } else if (error.response.status === 401) {
          Alert.alert('Authentication Failed', 'Please log in again.');
        } else {
          Alert.alert('Error', `Failed to load products: ${error.response.data?.message || 'Server error'}`);
        }
      } else {
        Alert.alert('Error', 'Failed to load products. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (businessId) {
      await loadProducts(businessId);
    } else {
      await loadBusinessIdAndProducts();
    }
    setRefreshing(false);
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getAuthToken();
              await api.delete(`/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              Alert.alert('Success', 'Product deleted successfully');
              
              if (businessId) {
                await loadProducts(businessId);
              }
            } catch (error) {
              console.error('Error deleting product:', error);
              
              if (error.response) {
                Alert.alert('Error', `Failed to delete product: ${error.response.data?.message || 'Server error'}`);
              } else {
                Alert.alert('Error', 'Failed to delete product. Please try again.');
              }
            }
          }
        }
      ]
    );
  };

  const handleEditProduct = (productId) => {
    router.push(`/seller/products/edit/${productId}`);
  };

  const handleViewProduct = (productId) => {
    router.push(`/seller/products/${productId}`);
  };

  const getStatusColor = (product) => {
    if (product.stock === 0) return '#EF4444';
    if (product.status === false) return '#6B7280';
    return '#10B981';
  };

  const getStatusText = (product) => {
    if (product.stock === 0) return 'Out of Stock';
    if (product.status === false) return 'Inactive';
    return 'Active';
  };

  const getProductStats = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status !== false && (p.stock > 0 || p.stock === undefined)).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    
    return { totalProducts, activeProducts, outOfStockProducts };
  };

  const { totalProducts, activeProducts, outOfStockProducts } = getProductStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Products</Text>
          <Text style={styles.headerSubtitle}>Manage your product catalog</Text>
          {businessInfo ? (
            <View style={styles.businessInfoContainer}>
              <Text style={styles.businessName}>{businessInfo.name}</Text>
              <Text style={styles.businessIdText}>Business ID: {businessId}</Text>
              <Text style={styles.businessStatus}>
                Status: <Text style={{ color: businessInfo.isApproved ? '#10B981' : '#F59E0B' }}>
                  {businessInfo.isApproved ? 'Approved' : 'Pending Approval'}
                </Text>
              </Text>
            </View>
          ) : businessId ? (
            <Text style={styles.businessIdText}>Business ID: {businessId}</Text>
          ) : null}
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/seller/addProduct')}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>
            {businessId ? 'Loading your products...' : 'Loading business information...'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.productId?.toString() || item.id?.toString()}
          ListHeaderComponent={
            products.length > 0 ? (
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{totalProducts}</Text>
                  <Text style={styles.statLabel}>Total Products</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{activeProducts}</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{outOfStockProducts}</Text>
                  <Text style={styles.statLabel}>Out of Stock</Text>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => handleViewProduct(item.productId)}
            >
              <Image
                source={{
                  uri: item.images?.[0] || 'https://via.placeholder.com/60x60?text=No+Image'
                }}
                style={styles.productImage}
                defaultSource={{ uri: 'https://via.placeholder.com/60x60?text=Loading...' }}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name || 'Unnamed Product'}
                </Text>
                <Text style={styles.productPrice}>
                  ₦{item.price?.toLocaleString() || '0'}
                </Text>
                <View style={styles.productMeta}>
                  <Text style={styles.stockText}>
                    Stock: {item.stock !== undefined ? item.stock : 'N/A'}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(item) }
                    ]}>
                      {getStatusText(item)}
                    </Text>
                  </View>
                </View>
                {item.categories && item.categories.length > 0 && (
                  <Text style={styles.categoryText}>
                    Categories: {item.categories.map(cat => cat.name).join(', ')}
                  </Text>
                )}
                {item.tags && (
                  <Text style={styles.tagsText} numberOfLines={1}>
                    Tags: {item.tags}
                  </Text>
                )}
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditProduct(item.productId)}
                >
                  <Ionicons name="create-outline" size={16} color="#7C3AED" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteProduct(item.productId)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.productsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No products found</Text>
              <Text style={styles.emptySubtext}>
                {businessId 
                  ? 'Add your first product to get started' 
                  : 'Please complete your business registration to start adding products.'
                }
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => {
                  if (businessId) {
                    router.push('/seller/addProduct');
                  } else {
                    router.push('/seller/business-setup');
                  }
                }}
              >
                <Text style={styles.emptyButtonText}>
                  {businessId ? 'Add Your First Product' : 'Setup Business'}
                </Text>
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#7C3AED"]}
              tintColor="#7C3AED"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  businessInfoContainer: {
    marginTop: 4,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 2,
  },
  businessIdText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  businessStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  productsList: {
    padding: 16,
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  tagsText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actionButtons: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  editButton: {
    padding: 6,
    backgroundColor: '#F5F3FF',
    borderRadius: 6,
    marginBottom: 8,
  },
  deleteButton: {
    padding: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
  },
});