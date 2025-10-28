import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function SellerAnalytics() {
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState({
    revenue: 125000,
    orders: 89,
    customers: 45,
    conversion: 3.2,
    salesData: [12000, 19000, 15000, 25000, 22000, 30000, 28000],
    topProducts: [
      { name: 'Wireless Headphones', sales: 45, revenue: 134550 },
      { name: 'Smart Watch', sales: 32, revenue: 146880 },
      { name: 'Laptop Backpack', sales: 28, revenue: 36120 },
      { name: 'USB-C Cable', sales: 56, revenue: 14000 },
    ]
  });

  const timeRanges = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  // Simple bar chart component
  const BarChart = ({ data }) => {
    const maxValue = Math.max(...data);
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {data.map((value, index) => (
            <View key={index} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: (value / maxValue) * 120,
                    backgroundColor: index === data.length - 1 ? '#7C3AED' : '#DDD6FE',
                  }
                ]}
              />
              <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics</Text>
          <Text style={styles.headerSubtitle}>Track your store performance</Text>
        </View>
      </View>

      {/* Time Range Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRangeContainer}>
        {timeRanges.map((range) => (
          <TouchableOpacity
            key={range.id}
            style={[
              styles.timeRangeButton,
              timeRange === range.id && styles.activeTimeRangeButton
            ]}
            onPress={() => setTimeRange(range.id)}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === range.id && styles.activeTimeRangeText
            ]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#F0F9FF' }]}>
            <Ionicons name="cash-outline" size={24} color="#3B82F6" />
          </View>
          <Text style={styles.metricValue}>₦{analytics.revenue.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Total Revenue</Text>
          <View style={styles.metricTrend}>
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text style={styles.trendText}>12%</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="cart-outline" size={24} color="#10B981" />
          </View>
          <Text style={styles.metricValue}>{analytics.orders}</Text>
          <Text style={styles.metricLabel}>Total Orders</Text>
          <View style={styles.metricTrend}>
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text style={styles.trendText}>8%</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="people-outline" size={24} color="#EF4444" />
          </View>
          <Text style={styles.metricValue}>{analytics.customers}</Text>
          <Text style={styles.metricLabel}>Customers</Text>
          <View style={styles.metricTrend}>
            <Ionicons name="trending-up" size={16} color="#10B981" />
            <Text style={styles.trendText}>5%</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#FFFBEB' }]}>
            <Ionicons name="trending-up-outline" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.metricValue}>{analytics.conversion}%</Text>
          <Text style={styles.metricLabel}>Conversion Rate</Text>
          <View style={styles.metricTrend}>
            <Ionicons name="trending-down" size={16} color="#EF4444" />
            <Text style={[styles.trendText, { color: '#EF4444' }]}>2%</Text>
          </View>
        </View>
      </View>

      {/* Sales Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales Overview</Text>
        <View style={styles.chartCard}>
          <BarChart data={analytics.salesData} />
          <View style={styles.chartStats}>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatValue}>₦28,000</Text>
              <Text style={styles.chartStatLabel}>Today</Text>
            </View>
            <View style={styles.chartStat}>
              <Text style={styles.chartStatValue}>₦180,000</Text>
              <Text style={styles.chartStatLabel}>This Week</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Top Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Products</Text>
        <View style={styles.productsCard}>
          {analytics.topProducts.map((product, index) => (
            <View key={index} style={styles.productRow}>
              <View style={styles.productInfo}>
                <Text style={styles.productRank}>{index + 1}</Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productSales}>{product.sales} sales</Text>
                </View>
              </View>
              <Text style={styles.productRevenue}>₦{product.revenue.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsCard}>
          <View style={styles.performanceMetric}>
            <Text style={styles.metricName}>Average Order Value</Text>
            <Text style={styles.metricValue}>₦1,404</Text>
          </View>
          <View style={styles.performanceMetric}>
            <Text style={styles.metricName}>Customer Retention</Text>
            <Text style={styles.metricValue}>42%</Text>
          </View>
          <View style={styles.performanceMetric}>
            <Text style={styles.metricName}>Inventory Turnover</Text>
            <Text style={styles.metricValue}>3.2x</Text>
          </View>
          <View style={styles.performanceMetric}>
            <Text style={styles.metricName}>Return Rate</Text>
            <Text style={styles.metricValue}>2.1%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
  timeRangeContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  activeTimeRangeButton: {
    backgroundColor: '#7C3AED',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTimeRangeText: {
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 140,
    gap: 8,
  },
  barContainer: {
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    width: 20,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  chartStat: {
    alignItems: 'center',
  },
  chartStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  chartStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  productsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    fontSize: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  productSales: {
    fontSize: 12,
    color: '#6B7280',
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  performanceMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metricName: {
    fontSize: 14,
    color: '#6B7280',
  },
});