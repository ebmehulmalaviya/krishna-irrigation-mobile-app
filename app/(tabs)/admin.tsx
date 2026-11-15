import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp } from '@/context/AppContext';

export default function AdminScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { role, setRole, stats, products, sales, stockTransactions, verifyAdminPin } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'stock' | 'history'>('overview');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = () => {
    if (verifyAdminPin(pin)) {
      setRole('admin');
      setPin('');
      setErrorMsg('');
      Alert.alert('સ્વાગત છે!', 'તમે સફળતાપૂર્વક એડમિન મોડમાં લૉગિન થયા છો.');
    } else {
      setErrorMsg('ખોટો PIN! સાચો એડમિન PIN દાખલ કરો.');
      Alert.alert('ખોટો PIN', 'કૃપા કરીને સાચો એડમિન PIN દાખલ કરો.');
    }
  };

  // If user is in User mode, show prompt to login as Admin
  if (role !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loginPromptContainer}>
          <View style={[styles.lockCircle, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="lock-closed" size={48} color="#15803d" />
          </View>

          <Text style={[styles.lockTitle, { color: theme.text }]}>
            🔐 એડમિન પોર્ટલ લૉગિન
          </Text>

          <Text style={[styles.lockSubtitle, { color: theme.textSecondary }]}>
            આ વિભાગ માત્ર સ્ટોર માલિક / એડમિન માટે છે. ખરીદ ભાવ, સ્ટોક ઇન, વેચાણ અને ઇન્વેન્ટરી કંટ્રોલ કરવા માટે એડમિન PIN દાખલ કરો.
          </Text>

          {/* PIN Input */}
          <View style={[styles.pinBox, { borderColor: errorMsg ? '#dc2626' : theme.border }]}>
            <Ionicons name="keypad-outline" size={20} color="#64748b" />
            <TextInput
              style={[styles.pinInput, { color: theme.text }]}
              placeholder="4-અંકનો PIN (દા.ત. 9898)"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              value={pin}
              onChangeText={(t) => {
                setPin(t);
                setErrorMsg('');
              }}
            />
          </View>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          <Pressable
            style={[styles.loginBtn, { backgroundColor: '#166534' }]}
            onPress={handleAdminLogin}
          >
            <Ionicons name="key-outline" size={20} color="#ffffff" />
            <Text style={styles.loginBtnText}>એડમિન તરીકે લૉગિન કરો</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Admin Header with Switch to User Mode */}
        <View style={[styles.adminHeader, { backgroundColor: '#14532d' }]}>
          <View style={styles.adminHeaderRow}>
            <View>
              <Text style={styles.adminBadge}>ADMIN DASHBOARD</Text>
              <Text style={styles.adminHeading}>કૃષ્ણા ઇરિગેશન કંટ્રોલ પેનલ</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Pressable
                style={styles.exitAdminBtn}
                onPress={() => router.push('/modal' as any)}
              >
                <Ionicons name="key" size={14} color="#ffffff" />
                <Text style={styles.exitAdminText}>PIN બદલો</Text>
              </Pressable>

              <Pressable
                style={styles.exitAdminBtn}
                onPress={() => {
                  setRole('user');
                  Alert.alert('ગ્રાહક મોડ', 'તમે હવે સામાન્ય ગ્રાહક વ્યૂમાં છો.');
                }}
              >
                <Ionicons name="log-out-outline" size={16} color="#ffffff" />
                <Text style={styles.exitAdminText}>ગ્રાહક મોડ</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* 4 Action Buttons Grid */}
        <View style={styles.actionGrid}>
          {/* 1. Stock In / Purchase */}
          <Pressable
            style={[styles.actionCard, { backgroundColor: theme.card, borderColor: '#16a34a' }]}
            onPress={() => router.push('/admin/stock-in' as any)}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="arrow-down-circle" size={24} color="#15803d" />
            </View>
            <Text style={[styles.actionCardTitle, { color: theme.text }]}>
              સ્ટોક ઇન (ખરીદી)
            </Text>
            <Text style={[styles.actionCardSub, { color: theme.textSecondary }]}>
              માલની નવી આવક ઉમેરો
            </Text>
          </Pressable>

          {/* 2. Sales Entry / Stock Out */}
          <Pressable
            style={[styles.actionCard, { backgroundColor: theme.card, borderColor: '#0284c7' }]}
            onPress={() => router.push('/admin/sale-out' as any)}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#e0f2fe' }]}>
              <Ionicons name="arrow-up-circle" size={24} color="#0284c7" />
            </View>
            <Text style={[styles.actionCardTitle, { color: theme.text }]}>
              વેચાણ એન્ટ્રી
            </Text>
            <Text style={[styles.actionCardSub, { color: theme.textSecondary }]}>
              ગ્રાહક વેચાણ બિલ બનાવો
            </Text>
          </Pressable>

          {/* 3. Add / Edit Product */}
          <Pressable
            style={[styles.actionCard, { backgroundColor: theme.card, borderColor: '#d97706' }]}
            onPress={() => router.push('/admin/add-product' as any)}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="add-circle" size={24} color="#d97706" />
            </View>
            <Text style={[styles.actionCardTitle, { color: theme.text }]}>
              નવી પ્રોડક્ટ & સાઇઝ
            </Text>
            <Text style={[styles.actionCardSub, { color: theme.textSecondary }]}>
              ઉત્પાદન અને ભાવ ઉમેરો
            </Text>
          </Pressable>

          {/* 4. Categories & Subcategories Manager */}
          <Pressable
            style={[styles.actionCard, { backgroundColor: theme.card, borderColor: '#7c3aed' }]}
            onPress={() => router.push('/admin/categories' as any)}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#f3e8ff' }]}>
              <Ionicons name="git-network" size={24} color="#7c3aed" />
            </View>
            <Text style={[styles.actionCardTitle, { color: theme.text }]}>
              કેટેગરી વ્યવસ્થાપન
            </Text>
            <Text style={[styles.actionCardSub, { color: theme.textSecondary }]}>
              પેટા કેટેગરીઝ ગોઠવો
            </Text>
          </Pressable>
        </View>

        {/* Tab Switcher: Overview vs Stock vs History */}
        <View style={[styles.tabBar, { backgroundColor: theme.surfaceMuted }]}>
          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'overview' && [styles.activeTabItem, { backgroundColor: theme.card }],
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <Text
              style={[
                styles.tabItemText,
                { color: activeTab === 'overview' ? theme.primary : theme.textSecondary },
              ]}
            >
              ડેશબોર્ડ આંકડા
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'stock' && [styles.activeTabItem, { backgroundColor: theme.card }],
            ]}
            onPress={() => setActiveTab('stock')}
          >
            <Text
              style={[
                styles.tabItemText,
                { color: activeTab === 'stock' ? theme.primary : theme.textSecondary },
              ]}
            >
              સ્ટોક લિસ્ટ
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.tabItem,
              activeTab === 'history' && [styles.activeTabItem, { backgroundColor: theme.card }],
            ]}
            onPress={() => setActiveTab('history')}
          >
            <Text
              style={[
                styles.tabItemText,
                { color: activeTab === 'history' ? theme.primary : theme.textSecondary },
              ]}
            >
              ઓડિટ લોગ
            </Text>
          </Pressable>
        </View>

        {/* Tab 1: Overview Metrics */}
        {activeTab === 'overview' && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="cube-outline" size={22} color="#15803d" />
                <Text style={[styles.metricVal, { color: theme.text }]}>{stats.totalProducts}</Text>
                <Text style={[styles.metricLbl, { color: theme.textSecondary }]}>કુલ પ્રોડક્ટ્સ</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="layers-outline" size={22} color="#0284c7" />
                <Text style={[styles.metricVal, { color: theme.text }]}>
                  {stats.totalInventoryQuantity}
                </Text>
                <Text style={[styles.metricLbl, { color: theme.textSecondary }]}>કુલ નંગ સ્ટોક</Text>
              </View>
            </View>

            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="wallet-outline" size={22} color="#d97706" />
                <Text style={[styles.metricVal, { color: theme.text }]}>
                  ₹{stats.totalPurchaseValue.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.metricLbl, { color: theme.textSecondary }]}>સ્ટોક મૂલ્યાંકન (ખરીદ)</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="cash-outline" size={22} color="#16a34a" />
                <Text style={[styles.metricVal, { color: theme.text }]}>
                  ₹{stats.totalSalesValue.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.metricLbl, { color: theme.textSecondary }]}>કુલ વેચાણ ટર્નઓવર</Text>
              </View>
            </View>

            {/* Low stock alert box */}
            {stats.lowStockCount > 0 && (
              <View style={[styles.alertBox, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                <Ionicons name="warning" size={22} color="#dc2626" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>ઓછા સ્ટોકની ચેતવણી!</Text>
                  <Text style={styles.alertSubtitle}>
                    {stats.lowStockCount} પ્રોડક્ટ્સ લઘુત્તમ સ્ટોક મર્યાદાથી નીચે છે. તાત્કાલિક ખરીદી કરો.
                  </Text>
                </View>
              </View>
            )}

            {/* Recent Sales List */}
            <View style={[styles.recentSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.recentTitle, { color: theme.text }]}>તાજેતરના વેચાણ ટ્રાન્ઝેક્શન</Text>
              {sales.slice(0, 4).map((sale) => (
                <View key={sale.id} style={[styles.recentRow, { borderBottomColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recentCustomer, { color: theme.text }]}>
                      {sale.customer_name || 'સામાન્ય ગ્રાહક'}
                    </Text>
                    <Text style={[styles.recentDate, { color: theme.textSecondary }]}>
                      તારીખ: {sale.sale_date}
                    </Text>
                  </View>
                  <Text style={[styles.recentAmount, { color: '#15803d' }]}>
                    ₹{sale.total_amount.toLocaleString('en-IN')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tab 2: Stock List per Variant */}
        {activeTab === 'stock' && (
          <View style={styles.stockContainer}>
            {products.map((p) => (
              <View
                key={p.id}
                style={[styles.stockProductCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <Text style={[styles.stockProdName, { color: theme.text }]}>{p.name}</Text>
                <View style={styles.variantTable}>
                  {p.variants.map((v) => {
                    const isLow = v.current_stock <= v.low_stock_limit;
                    return (
                      <View
                        key={v.id}
                        style={[
                          styles.variantRow,
                          { borderBottomColor: theme.border },
                          isLow && { backgroundColor: '#fff1f2' },
                        ]}
                      >
                        <Text style={[styles.vSize, { color: theme.text }]}>{v.size}</Text>
                        <Text style={[styles.vRate, { color: theme.textSecondary }]}>
                          ખરીદ: ₹{v.purchase_rate} | વેચાણ: ₹{v.selling_rate}
                        </Text>
                        <View style={[styles.stockChip, { backgroundColor: isLow ? '#fee2e2' : '#dcfce7' }]}>
                          <Text style={[styles.stockChipText, { color: isLow ? '#b91c1c' : '#15803d' }]}>
                            {v.current_stock} નંગ
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 3: Audit Transactions Log */}
        {activeTab === 'history' && (
          <View style={styles.historyContainer}>
            {stockTransactions.slice(0, 15).map((tx) => {
              const isPlus = tx.quantity > 0;
              return (
                <View
                  key={tx.id}
                  style={[styles.txCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={[styles.txBadge, { backgroundColor: isPlus ? '#dcfce7' : '#fee2e2' }]}>
                    <Ionicons
                      name={isPlus ? 'arrow-down' : 'arrow-up'}
                      size={18}
                      color={isPlus ? '#15803d' : '#dc2626'}
                    />
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.txTitle, { color: theme.text }]}>
                      {tx.product_name} ({tx.variant_size})
                    </Text>
                    <Text style={[styles.txNotes, { color: theme.textSecondary }]}>
                      {tx.notes} • {new Date(tx.created_at).toLocaleDateString('gu-IN')}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.txQty,
                      { color: isPlus ? '#15803d' : '#dc2626' },
                    ]}
                  >
                    {isPlus ? `+${tx.quantity}` : tx.quantity}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 14,
    paddingBottom: 40,
  },
  loginPromptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  lockCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  lockSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
    width: '100%',
  },
  pinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    width: '100%',
    height: 50,
    backgroundColor: '#ffffff',
    gap: 8,
    marginTop: 6,
  },
  pinInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  adminHeader: {
    borderRadius: 14,
    padding: 16,
  },
  adminHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminBadge: {
    color: '#86efac',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  adminHeading: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  exitAdminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  exitAdminText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    width: '48.5%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 6,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  actionCardSub: {
    fontSize: 11,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabItem: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsContainer: {
    gap: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricLbl: {
    fontSize: 11,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  alertTitle: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '800',
  },
  alertSubtitle: {
    color: '#991b1b',
    fontSize: 12,
    marginTop: 2,
  },
  recentSection: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recentCustomer: {
    fontSize: 13,
    fontWeight: '700',
  },
  recentDate: {
    fontSize: 11,
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  stockContainer: {
    gap: 10,
  },
  stockProductCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  stockProdName: {
    fontSize: 15,
    fontWeight: '800',
  },
  variantTable: {
    gap: 4,
  },
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  vSize: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 40,
  },
  vRate: {
    fontSize: 11,
    flex: 1,
    marginHorizontal: 8,
  },
  stockChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  stockChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  historyContainer: {
    gap: 8,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  txBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  txNotes: {
    fontSize: 11,
  },
  txQty: {
    fontSize: 15,
    fontWeight: '800',
  },
});

