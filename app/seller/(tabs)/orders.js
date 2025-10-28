import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SellerOrders() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'John Doe',
      amount: 29900,
      status: 'pending',
      items: 2,
      date: '2024-01-15',
      address: '123 Main St, Lagos'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      amount: 45900,
      status: 'processing',
      items: 1,
      date: '2024-01-14',
      address: '456 Oak Ave, Abuja'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      amount: 12900,
      status: 'shipped',
      items: 1,
      date: '2024-01-13',
      address: '789 Pine Rd, Port Harcourt'
    },
    {
      id: 'ORD-004',
      customer: 'Sarah Wilson',
      amount: 2500,
      status: 'delivered',
      items: 3,
      date: '2024-01-12',
      address: '321 Elm St, Kano'
    }
  ]);

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
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Orders</Text>
          <Text style={styles.headerSubtitle}>Manage customer orders</Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
            <View style={[
              styles.tabCount,
              activeTab === tab.id && styles.activeTabCount
            ]}>
              <Text style={styles.tabCountText}>{tab.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView style={styles.ordersList} showsVerticalScrollIndicator={false}>
        {filteredOrders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => router.push(`/seller/orders/${order.id}`)}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>{order.id}</Text>
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
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.orderText}>{order.date}</Text>
              </View>
              <View style={styles.orderInfo}>
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text style={styles.orderText} numberOfLines={1}>{order.address}</Text>
              </View>
            </View>

            <View style={styles.orderFooter}>
              <Text style={styles.orderAmount}>₦{order.amount.toLocaleString()}</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 16,
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
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
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
  actionButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});