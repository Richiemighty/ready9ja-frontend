import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';


export default function ViewOrders() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  // Mock orders data
  const orders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      items: 3,
      amount: 45000,
      status: 'pending',
      date: '2 hours ago',
      address: '123 Main St, Lagos'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      items: 1,
      amount: 15000,
      status: 'processing',
      date: '5 hours ago',
      address: '456 Oak Ave, Abuja'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      items: 2,
      amount: 32000,
      status: 'shipped',
      date: '1 day ago',
      address: '789 Pine Rd, Port Harcourt'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
  ];

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'processing': return '#3B82F6';
      case 'shipped': return '#8B5CF6';
      case 'delivered': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const handleOrderAction = (orderId, action) => {
    // Handle order actions (update status, etc.)
    console.log(`Action: ${action} on order: ${orderId}`);
  };

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
        <Text style={styles.headerTitle}>Order Management</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <FlatList
        horizontal
        data={tabs}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === item.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(item.id)}
          >
            <Text style={[
              styles.tabText,
              activeTab === item.id && styles.activeTabText
            ]}>
              {item.label}
            </Text>
            <View style={[
              styles.tabCount,
              activeTab === item.id && styles.activeTabCount
            ]}>
              <Text style={styles.tabCountText}>{item.count}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        renderItem={({ item: order }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(order.status) }
                ]}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.orderInfo}>
                <Ionicons name="person-outline" size={16} color="#6B7280" />
                <Text style={styles.orderText}>{order.customer}</Text>
              </View>
              <View style={styles.orderInfo}>
                <Ionicons name="cube-outline" size={16} color="#6B7280" />
                <Text style={styles.orderText}>{order.items} item(s)</Text>
              </View>
              <View style={styles.orderInfo}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.orderText} numberOfLines={1}>{order.address}</Text>
              </View>
            </View>

            <View style={styles.orderFooter}>
              <Text style={styles.orderAmount}>₦{order.amount.toLocaleString()}</Text>
              
              <View style={styles.orderActions}>
                {order.status === 'pending' && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleOrderAction(order.id, 'process')}
                  >
                    <Text style={styles.actionText}>Process</Text>
                  </TouchableOpacity>
                )}
                {order.status === 'processing' && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleOrderAction(order.id, 'ship')}
                  >
                    <Text style={styles.actionText}>Ship</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={styles.detailsButton}
                  onPress={() => router.push(`/seller/orders/${order.id}`)}
                >
                  <Text style={styles.detailsText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'all' 
                ? 'Orders will appear here when customers make purchases'
                : `No ${activeTab} orders at the moment`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginRight: 8,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabCount: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeTabCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  ordersList: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  orderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailsText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
});