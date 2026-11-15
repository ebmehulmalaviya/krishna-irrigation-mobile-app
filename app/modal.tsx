import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useApp } from '@/context/AppContext';

export default function RoleModalScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { role, setRole, verifyAdminPin, changeAdminPin } = useApp();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Change PIN states
  const [showChangePin, setShowChangePin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // Admin PIN Login Verification
  const handleAdminLogin = () => {
    if (verifyAdminPin(pin)) {
      setRole('admin');
      setPin('');
      setErrorMsg('');
      Alert.alert('સ્વાગત છે!', 'તમે સફળતાપૂર્વક એડમિન તરીકે લૉગિન થયા છો. હવે તમને ખરીદી, વેચાણ અને સ્ટોક મેનેજમેન્ટની તમામ પરવાનગી મળી ગઈ છે.');
    } else {
      setErrorMsg('ખોટો PIN! સાચો એડમિન PIN દાખલ કરો.');
      Alert.alert('ખોટો PIN', 'કૃપા કરીને સાચો એડમિન PIN દાખલ કરો.');
    }
  };

  // Change PIN Submit
  const handleChangePinSubmit = async () => {
    if (!currentPin.trim() || !newPin.trim()) {
      Alert.alert('ભૂલ', 'કૃપા કરીને બધા ખાના ભરો.');
      return;
    }
    if (newPin.trim().length < 4) {
      Alert.alert('ભૂલ', 'નવો PIN ઓછામાં ઓછો 4 અંકનો હોવો જોઈએ.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('ભૂલ', 'નવો PIN અને કન્ફર્મ PIN મેળ ખાતા નથી!');
      return;
    }
    const res = await changeAdminPin(currentPin, newPin);
    if (res.success) {
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      setShowChangePin(false);
      Alert.alert('સફળ!', res.message);
    } else {
      Alert.alert('ભૂલ', res.message);
    }
  };

  // Switch back to normal User/Customer mode
  const handleSwitchToUser = () => {
    setRole('user');
    Alert.alert('ગ્રાહક મોડ', 'તમે હવે સામાન્ય ગ્રાહક વ્યૂમાં છો (માત્ર કેટેગરી અને વેચાણ ભાવ દેખાશે).');
  };

  // Protected navigation: only admins can navigate
  const navigateTo = (path: string) => {
    if (role !== 'admin') {
      Alert.alert(
        'એક્સેસ મર્યાદિત છે',
        'ખરીદી, વેચાણ કે પ્રોડક્ટ મેનેજમેન્ટ માટે એડમિન લૉગિન જરૂરી છે.'
      );
      return;
    }
    router.push(path as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>એડમિન લૉગિન & સેટિંગ્સ</Text>
          <Pressable style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
        </View>

        {/* Current Role Banner */}
        <View
          style={[
            styles.roleBanner,
            { backgroundColor: role === 'admin' ? '#14532d' : '#0369a1' },
          ]}
        >
          <View style={styles.roleIconBox}>
            <Ionicons
              name={role === 'admin' ? 'shield-checkmark' : 'person-circle'}
              size={36}
              color="#ffffff"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.roleBannerTitle}>
              {role === 'admin' ? 'એડમિન મોડ સક્રિય (ADMIN MODE)' : 'સામાન્ય ગ્રાહક મોડ (CUSTOMER VIEW)'}
            </Text>
            <Text style={styles.roleBannerSub}>
              {role === 'admin'
                ? 'સંપૂર્ણ પરવાનગી: નવી કેટેગરી, પ્રોડક્ટ્સ, ખરીદી, વેચાણ અને સ્ટોક મેનેજમેન્ટ.'
                : 'ગ્રાહકને માત્ર કેટેગરી, પ્રોડક્ટ સાઇઝ અને ટેક્ષ પેડ રેટ દેખાશે. ખરીદી કે વેચાણની પરવાનગી નથી.'}
            </Text>
          </View>
        </View>

        {/* ADMIN MODE VIEW: Show All Action Buttons */}
        {role === 'admin' ? (
          <View style={styles.adminSection}>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>
              એડમિન કંટ્રોલ અને ઝડપી એન્ટ્રી (Admin Actions)
            </Text>

            <View style={styles.actionMenu}>
              {/* 1. Add Category Button */}
              <Pressable
                style={[styles.menuItem, { backgroundColor: '#f0fdf4', borderColor: '#16a34a' }]}
                onPress={() => navigateTo('/admin/categories')}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#16a34a' }]}>
                  <Ionicons name="folder-open" size={22} color="#ffffff" />
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={[styles.menuItemTitle, { color: '#166534' }]}>
                    ➕ નવી કેટેગરી ઉમેરો / એડિટ કરો
                  </Text>
                  <Text style={styles.menuItemSub}>
                    મુખ્ય કેટેગરી, સબકેટેગરી અને ફોટો અપલોડ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#16a34a" />
              </Pressable>

              {/* 2. Add Product Button */}
              <Pressable
                style={[styles.menuItem, { backgroundColor: '#fefce8', borderColor: '#ca8a04' }]}
                onPress={() => navigateTo('/admin/add-product')}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#ca8a04' }]}>
                  <Ionicons name="add-circle" size={22} color="#ffffff" />
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={[styles.menuItemTitle, { color: '#854d0e' }]}>
                    ➕ નવી પ્રોડક્ટ & ભાવ ઉમેરો
                  </Text>
                  <Text style={styles.menuItemSub}>
                    વાલ્વ, ફિટિંગ્સ, સાઇઝ, ખરીદ ભાવ અને વેચાણ ભાવ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ca8a04" />
              </Pressable>

              {/* 3. Stock In (Purchase) */}
              <Pressable
                style={[styles.menuItem, { backgroundColor: '#eff6ff', borderColor: '#2563eb' }]}
                onPress={() => navigateTo('/admin/stock-in')}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#2563eb' }]}>
                  <Ionicons name="arrow-down-circle" size={22} color="#ffffff" />
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={[styles.menuItemTitle, { color: '#1e40af' }]}>
                    📥 સ્ટોક ઇન (ખરીદી એન્ટ્રી)
                  </Text>
                  <Text style={styles.menuItemSub}>
                    સપ્લાયર પાસેથી આવેલા માલની આવક નોંધો
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#2563eb" />
              </Pressable>

              {/* 4. Sales Entry */}
              <Pressable
                style={[styles.menuItem, { backgroundColor: '#faf5ff', borderColor: '#9333ea' }]}
                onPress={() => navigateTo('/admin/sale-out')}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#9333ea' }]}>
                  <Ionicons name="cart" size={22} color="#ffffff" />
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={[styles.menuItemTitle, { color: '#6b21a8' }]}>
                    📤 વેચાણ એન્ટ્રી (ગ્રાહક બિલ / સેલ)
                  </Text>
                  <Text style={styles.menuItemSub}>
                    માલ વેચી સ્ટોક ઓટોમેટિક ઓછો કરો
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9333ea" />
              </Pressable>

              {/* 5. Admin Dashboard */}
              <Pressable
                style={[styles.menuItem, { backgroundColor: '#fff7ed', borderColor: '#ea580c' }]}
                onPress={() => navigateTo('/admin')}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: '#ea580c' }]}>
                  <Ionicons name="stats-chart" size={22} color="#ffffff" />
                </View>
                <View style={styles.menuTextBox}>
                  <Text style={[styles.menuItemTitle, { color: '#9a3412' }]}>
                    📊 એડમિન ડેશબોર્ડ & સ્ટોક લિસ્ટ
                  </Text>
                  <Text style={styles.menuItemSub}>
                    કુલ સ્ટોક, ખરીદ કિંમત અને સેલ્સ રિપોર્ટ
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ea580c" />
              </Pressable>
            </View>

            {/* Change PIN Section */}
            <View style={[styles.changePinCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Pressable
                style={styles.changePinHeader}
                onPress={() => setShowChangePin(!showChangePin)}
              >
                <View style={styles.changePinHeaderLeft}>
                  <Ionicons name="key" size={20} color="#166534" />
                  <Text style={[styles.changePinTitle, { color: theme.text }]}>
                    🔑 નવો PIN / પાસવર્ડ બદલો
                  </Text>
                </View>
                <Ionicons
                  name={showChangePin ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>

              {showChangePin && (
                <View style={styles.changePinForm}>
                  <Text style={styles.inputLabel}>વર્તમાન PIN (હાલનો પાસવર્ડ):</Text>
                  <TextInput
                    style={[styles.inputBox, { color: theme.text }]}
                    placeholder="દા.ત. 9898"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={8}
                    value={currentPin}
                    onChangeText={setCurrentPin}
                  />

                  <Text style={styles.inputLabel}>નવો PIN:</Text>
                  <TextInput
                    style={[styles.inputBox, { color: theme.text }]}
                    placeholder="ઓછામાં ઓછો 4 અંકનો નવો PIN"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={8}
                    value={newPin}
                    onChangeText={setNewPin}
                  />

                  <Text style={styles.inputLabel}>નવો PIN ફરીથી નાખો (કન્ફર્મ કરો):</Text>
                  <TextInput
                    style={[styles.inputBox, { color: theme.text }]}
                    placeholder="નવો PIN ફરીથી દાખલ કરો"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={8}
                    value={confirmPin}
                    onChangeText={setConfirmPin}
                  />

                  <Pressable style={styles.savePinBtn} onPress={handleChangePinSubmit}>
                    <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                    <Text style={styles.savePinBtnText}>નવો PIN સેવ કરો</Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Logout Button */}
            <Pressable style={styles.logoutBtn} onPress={handleSwitchToUser}>
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text style={styles.logoutBtnText}>એડમિન લૉગ આઉટ કરો (ગ્રાહક મોડમાં સ્વિચ)</Text>
            </Pressable>
          </View>
        ) : (
          /* USER MODE VIEW: Secure Admin Login Form */
          <View style={[styles.loginCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.lockIconBox}>
              <Ionicons name="lock-closed" size={32} color="#166534" />
            </View>

            <Text style={[styles.loginCardTitle, { color: theme.text }]}>
              🔐 એડમિન લૉગિન
            </Text>

            <Text style={[styles.loginCardDesc, { color: theme.textSecondary }]}>
              ખરીદી (Stock In), વેચાણ (Sales) કે ભાવ બદલવા માટે એડમિન PIN દાખલ કરો.
            </Text>

            {/* PIN Input */}
            <View style={[styles.pinInputRow, { borderColor: errorMsg ? '#dc2626' : theme.border }]}>
              <Ionicons name="keypad-outline" size={20} color="#64748b" />
              <TextInput
                style={[styles.pinInput, { color: theme.text }]}
                placeholder="એડમિન PIN દાખલ કરો (ડિફોલ્ટ: 9898)"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                secureTextEntry
                maxLength={8}
                value={pin}
                onChangeText={(t) => {
                  setPin(t);
                  setErrorMsg('');
                }}
              />
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            {/* Login Button */}
            <Pressable style={styles.adminLoginBtn} onPress={handleAdminLogin}>
              <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
              <Text style={styles.adminLoginBtnText}>એડમિન તરીકે લૉગિન કરો</Text>
            </Pressable>
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
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 6,
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  roleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBannerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  roleBannerSub: {
    color: '#f0fdf4',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  adminSection: {
    gap: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  actionMenu: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  menuIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextBox: {
    flex: 1,
    gap: 2,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  menuItemSub: {
    fontSize: 11,
    color: '#475569',
  },
  changePinCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    gap: 10,
  },
  changePinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  changePinHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changePinTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  changePinForm: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
  },
  inputBox: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  savePinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#166534',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 6,
  },
  savePinBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2',
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '800',
  },
  loginCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  lockIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginCardTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  loginCardDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  pinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    width: '100%',
    height: 48,
    backgroundColor: '#ffffff',
    gap: 8,
    marginTop: 4,
  },
  pinInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  adminLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#166534',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 6,
  },
  adminLoginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
