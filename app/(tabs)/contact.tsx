import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

const CONTACT_INFO = {
  name: 'કૃષ્ણા ઇરિગેશન સિસ્ટમ્સ (KRISHNA IRRIGATION)',
  phone: '+919876543210',
  phoneDisplay: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'info@krishnairrigation.com',
  address: 'પ્લોટ નં. ૪૨-૪૫, જી.આઈ.ડી.સી. ફેઝ-૨, રાજકોટ, ગુજરાત - ૩૬૦૦૦૨',
  hours: 'સોમવાર થી શનિવાર: સવારે ૯:૦૦ થી સાંજે ૭:૦૦',
};

const FAQS = [
  {
    q: 'શું આ ભાવ પત્રક જીએસટી (GST) સહિત છે?',
    a: 'ના, દર્શાવેલ વેચાણ ભાવ ટેક્સ મુક્ત ફેક્ટરી ભાવ છે. રાજ્ય મુજબ નિયમાનુસાર 12% થી 18% કૃષિ જીએસટી લાગુ પડશે.',
  },
  {
    q: 'જથ્થાબંધ (Bulk) ઓર્ડર માટે વધુ ડિસ્કાઉન્ટ મળશે?',
    a: 'હા! ડીલરો અને મોટા કૃષિ સહકારી મંડળીઓ માટે વિશેષ ડીલર માર્જિન ઉપલબ્ધ છે. કૃપા કરીને અમારા સેલ્સ ડેસ્કનો સંપર્ક કરો.',
  },
  {
    q: 'શું ઉત્પાદનો સરકાર માન્ય સબસિડી (PMKSY / GGRC) માં માન્ય છે?',
    a: 'હા, કૃષ્ણા ઇરિગેશનના તમામ ઉત્પાદનો BIS (IS 13488, IS 4984) ગુણવત્તા પ્રમાણિત છે અને રાજ્ય સરકારી સબસિડી પોર્ટલ પર નોંધાયેલા છે.',
  },
];

export default function ContactScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleCall = () => {
    Linking.openURL(`tel:${CONTACT_INFO.phone}`);
  };

  const handleWhatsApp = () => {
    const text = encodeURI('નમસ્તે કૃષ્ણા ઇરિગેશન, મારે ઇરિગેશન ઉત્પાદનો અને ડીલરશિપ વિશે માહિતી મેળવવી છે.');
    Linking.openURL(`https://wa.me/${CONTACT_INFO.whatsapp}?text=${text}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${CONTACT_INFO.email}?subject=Irrigation Products Inquiry`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Brand Banner */}
        <View style={[styles.brandCard, { backgroundColor: '#14532d' }]}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>IS 13488 પ્રમાણિત</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>સ્થાપના ૨૦૧૨</Text>
            </View>
          </View>

          <Text style={styles.brandTitle}>કૃષ્ણા ઇરિગેશન</Text>
          <Text style={styles.brandSubtitle}>
            ગુણવત્તા અને ખેડૂત વિશ્વાસનું વિશ્વસનીય નામ
          </Text>

          <Text style={styles.brandDesc}>
            અમે ૧૦૦% વર્જિન પોલીમરમાંથી બનાવેલ ઉચ્ચ ગુણવત્તાવાળા એગ્રીકલ્ચર વાલ્વ, ડ્રિપ લેટરલ, સ્પ્રિંકલર અને રેઇન પાઇપ ફિટિંગ્સનું ઉત્પાદન કરીએ છીએ.
          </Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionGrid}>
          <Pressable
            style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handleCall}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="call" size={22} color="#15803d" />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>સેલ્સ કોલ</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              {CONTACT_INFO.phoneDisplay}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handleWhatsApp}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>વોટ્સએપ</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              તાત્કાલિક પૂછપરછ
            </Text>
          </Pressable>
        </View>

        {/* Factory Address */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.infoRowHeader}>
            <Ionicons name="business-outline" size={20} color="#15803d" />
            <Text style={[styles.infoTitle, { color: theme.text }]}>ફેક્ટરી & હેડ ઓફિસ</Text>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.addressText, { color: theme.text }]}>{CONTACT_INFO.address}</Text>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.addressText, { color: theme.text }]}>{CONTACT_INFO.hours}</Text>
          </View>

          <View style={styles.addressRow}>
            <Ionicons name="mail-outline" size={18} color={theme.textSecondary} />
            <Pressable onPress={handleEmail}>
              <Text style={[styles.addressText, { color: '#0284c7', textDecorationLine: 'underline' }]}>
                {CONTACT_INFO.email}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* FAQs */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.infoTitle, { color: theme.text, marginBottom: 4 }]}>
            વારંવાર પૂછાતા પ્રશ્નો (FAQ)
          </Text>

          {FAQS.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <View
                key={index}
                style={[
                  styles.faqItem,
                  { borderBottomColor: theme.border },
                  index === FAQS.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <Pressable
                  style={styles.faqHeaderRow}
                  onPress={() => setExpandedFaq(isExpanded ? null : index)}
                >
                  <Text style={[styles.faqQuestion, { color: theme.text }]}>{faq.q}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={theme.textSecondary}
                  />
                </Pressable>
                {isExpanded && (
                  <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                    {faq.a}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 14,
    gap: 14,
    paddingBottom: 40,
  },
  brandCard: {
    padding: 18,
    borderRadius: 14,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    color: '#86efac',
    fontSize: 11,
    fontWeight: '800',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  brandSubtitle: {
    color: '#86efac',
    fontSize: 13,
    fontWeight: '600',
  },
  brandDesc: {
    color: '#dcfce7',
    fontSize: 12,
    lineHeight: 18,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 11,
  },
  infoCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  infoRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  addressRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  addressText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  faqItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    gap: 6,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    lineHeight: 18,
  },
  faqAnswer: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});

