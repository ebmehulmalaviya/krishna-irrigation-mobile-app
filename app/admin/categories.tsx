import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useApp } from '@/context/AppContext';
import { Category } from '@/types';
import { IrrigationGraphic } from '@/components/IrrigationGraphic';
import { uploadImageToSupabase } from '@/lib/storage';

export default function CategoriesManageScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const { categories, addCategory, updateCategory, deleteCategory, role } = useApp();

  // Route protection: Only Admin can add/edit/delete categories
  if (role !== 'admin') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Ionicons name="lock-closed" size={56} color="#dc2626" />
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 16, textAlign: 'center' }}>
          એક્સેસ મર્યાદિત છે (Admin Only)
        </Text>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
          કેટેગરી કે પેટા-કેટેગરી ઉમેરવા અથવા ફોટો બદલવા માટે એડમિન લૉગિન જરૂરી છે.
        </Text>
        <Pressable
          style={{ marginTop: 24, backgroundColor: '#166534', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: '#ffffff', fontWeight: '700' }}>પાછા જાઓ</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const [newCatName, setNewCatName] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [graphicType, setGraphicType] = useState('cat-valves');
  const [parentId, setParentId] = useState<string | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Root categories
  const rootCategories = categories.filter((c) => !c.parent_id);

  // 1. Pick Image from Phone Gallery for Form
  const handlePickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('પરવાનગી જરૂરી', 'ગેલેરીમાંથી ફોટો પસંદ કરવા માટે પરવાનગી આપો.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const cloudUrl = await uploadImageToSupabase(result.assets[0], 'categories');
        setImageUrl(cloudUrl);
      }
    } catch (err) {
      Alert.alert('ભૂલ', 'ફોટો પસંદ કરવામાં ભૂલ આવી.');
    }
  };

  // 2. Take Photo with Phone Camera for Form
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('પરવાનગી જરૂરી', 'ફોટો પાડવા માટે કેમેરા પરવાનગી આપો.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const cloudUrl = await uploadImageToSupabase(result.assets[0], 'categories');
        setImageUrl(cloudUrl);
      }
    } catch (err) {
      Alert.alert('ભૂલ', 'કેમેરા શરૂ કરવામાં ભૂલ આવી.');
    }
  };

  // 3. Quick Change Photo directly for an Existing Category / Subcategory
  const handleQuickChangePhoto = async (cat: Category) => {
    Alert.alert(
      `"${cat.name}" નો ફોટો અપલોડ કરો`,
      'તમે ફોટો ક્યાંથી પસંદ કરવા માંગો છો?',
      [
        {
          text: '🖼️ ગેલેરીમાંથી પસંદ કરો',
          onPress: async () => {
            try {
              const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
              });
              if (!res.canceled && res.assets[0]) {
                const cloudUrl = await uploadImageToSupabase(res.assets[0], 'categories');
                await updateCategory(cat.id, { image_url: cloudUrl });
                Alert.alert('સફળ!', `"${cat.name}" નો ફોટો ક્લાઉડ પર અપડેટ થઈ ગયો છે.`);
              }
            } catch (e) {
              Alert.alert('ભૂલ', 'ફોટો સિલેક્ટ કરવામાં ભૂલ આવી.');
            }
          },
        },
        {
          text: '📷 કેમેરાથી ફોટો પાડો',
          onPress: async () => {
            try {
              const perm = await ImagePicker.requestCameraPermissionsAsync();
              if (!perm.granted) {
                Alert.alert('પરવાનગી જરૂરી', 'કેમેરા પરવાનગી આપો.');
                return;
              }
              const res = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
              });
              if (!res.canceled && res.assets[0]) {
                const cloudUrl = await uploadImageToSupabase(res.assets[0], 'categories');
                await updateCategory(cat.id, { image_url: cloudUrl });
                Alert.alert('સફળ!', `"${cat.name}" નો ફોટો ક્લાઉડ પર અપડેટ થઈ ગયો છે.`);
              }
            } catch (e) {
              Alert.alert('ભૂલ', 'કેમેરા શરૂ કરવામાં ભૂલ આવી.');
            }
          },
        },
        { text: 'રદ કરો', style: 'cancel' },
      ]
    );
  };

  // 4. Save Category or Subcategory
  const handleSaveCategory = async () => {
    if (!newCatName.trim()) {
      Alert.alert('ભૂલ', 'કૃપા કરીને કેટેગરીનું નામ દાખલ કરો.');
      return;
    }

    const pastelColors = [
      '#bfe9e4',
      '#e3f4cb',
      '#fce1cc',
      '#eedcfa',
      '#cdebee',
      '#dff4cb',
      '#fed7aa',
      '#fef08a',
      '#ddd6fe',
    ];
    const chosenColor = parentId
      ? '#ecfdf5'
      : pastelColors[categories.length % pastelColors.length];

    if (editingCatId) {
      await updateCategory(editingCatId, {
        name: newCatName.trim(),
        name_en: newCatNameEn.trim(),
        image_url: imageUrl.trim() || undefined,
        graphic_type: graphicType,
        parent_id: parentId,
      });
      Alert.alert('સફળ', 'કેટેગરી અને ઇમેજ સફળતાપૂર્વક અપડેટ થઈ ગઈ છે!');
      setEditingCatId(null);
    } else {
      await addCategory({
        name: newCatName.trim(),
        name_en: newCatNameEn.trim(),
        image_url: imageUrl.trim() || undefined,
        graphic_type: graphicType,
        parent_id: parentId,
        display_order: categories.length + 1,
        is_active: true,
        color: chosenColor,
        icon: parentId ? 'construct-outline' : 'water',
      });
      Alert.alert(
        'સફળ',
        parentId
          ? 'નવી પેટા-કેટેગરી ઇમેજ સાથે ઉમેરાઈ ગઈ છે!'
          : 'નવી મુખ્ય કેટેગરી ઇમેજ સાથે ઉમેરાઈ ગઈ છે!'
      );
    }

    setNewCatName('');
    setNewCatNameEn('');
    setImageUrl('');
    setGraphicType('cat-valves');
    setParentId(null);
  };

  const handleEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setNewCatName(cat.name);
    setNewCatNameEn(cat.name_en || '');
    setImageUrl(cat.image_url || '');
    setGraphicType(cat.graphic_type || 'cat-valves');
    setParentId(cat.parent_id || null);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'કેટેગરી ડિલીટ કરો',
      `શું તમે ખરેખર "${name}" અને તેની પેટા કેટેગરીઓ ડિલીટ કરવા માંગો છો?`,
      [
        { text: 'રદ કરો', style: 'cancel' },
        {
          text: 'હા, ડિલીટ કરો',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(id);
          },
        },
      ]
    );
  };

  const handleToggleActive = async (cat: Category) => {
    await updateCategory(cat.id, { is_active: !cat.is_active });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Form to Add / Edit Category */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {editingCatId ? 'કેટેગરી / પેટા-કેટેગરી એડિટ કરો' : 'નવી કેટેગરી / પેટા-કેટેગરી ઉમેરો'}
          </Text>

          {/* 1. BIG PROMINENT IMAGE UPLOAD SECTION RIGHT AT THE TOP */}
          <View style={styles.topImageCard}>
            <Text style={styles.topImageLabel}>📸 કેટેગરીનો ફોટો / ઇમેજ પસંદ કરો</Text>

            <View style={styles.topImageRow}>
              {/* Tapable Preview Box */}
              <Pressable style={styles.bigPreviewBox} onPress={handlePickFromGallery}>
                {imageUrl ? (
                  <Image source={{ uri: imageUrl }} style={styles.bigPreviewImg} resizeMode="contain" />
                ) : (
                  <View style={styles.emptyImgPlaceholder}>
                    <IrrigationGraphic type={graphicType as any} width={70} height={70} />
                    <View style={styles.tapToChangeBadge}>
                      <Text style={styles.tapToChangeText}>ફોટો બદલો</Text>
                    </View>
                  </View>
                )}
              </Pressable>

              {/* 2 Big Visible Buttons */}
              <View style={styles.topActionBtnsCol}>
                <Pressable style={styles.bigGreenUploadBtn} onPress={handlePickFromGallery}>
                  <Ionicons name="images" size={20} color="#ffffff" />
                  <Text style={styles.bigUploadBtnText}>ગેલેરીમાંથી ફોટો લો</Text>
                </Pressable>

                <Pressable style={styles.bigBlueCameraBtn} onPress={handleTakePhoto}>
                  <Ionicons name="camera" size={20} color="#ffffff" />
                  <Text style={styles.bigUploadBtnText}>કેમેરાથી ફોટો પાડો</Text>
                </Pressable>
              </View>
            </View>

            {/* URL Input */}
            <View style={styles.urlInputRow}>
              <Ionicons name="link-outline" size={18} color="#64748b" />
              <TextInput
                style={[
                  styles.urlInput,
                  { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="અથવા ફોટો લિંક / URL પેસ્ટ કરો..."
                placeholderTextColor={theme.textSecondary}
                value={imageUrl}
                onChangeText={setImageUrl}
              />
              {imageUrl ? (
                <Pressable style={styles.clearImgBtn} onPress={() => setImageUrl('')}>
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* 2. Category Name in Gujarati */}
          <Text style={[styles.label, { color: theme.text }]}>કેટેગરીનું નામ (ગુજરાતી)*</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="દા.ત. પીવીસી પાઇપ ફિટિંગ્સ, યુનિયન વાલ્વ..."
            placeholderTextColor={theme.textSecondary}
            value={newCatName}
            onChangeText={setNewCatName}
          />

          {/* 3. Optional English Name */}
          <Text style={[styles.label, { color: theme.text }]}>અંગ્રેજી નામ (વૈકલ્પિક)</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="e.g. PVC Pipe Fittings"
            placeholderTextColor={theme.textSecondary}
            value={newCatNameEn}
            onChangeText={setNewCatNameEn}
          />

          {/* 4. Parent Category Selector */}
          <Text style={[styles.label, { color: theme.text }]}>
            મુખ્ય કેટેગરી (પેટા-કેટેગરી બનાવવી હોય તો પસંદ કરો)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 4 }}>
            <Pressable
              style={[
                styles.parentChip,
                {
                  backgroundColor: parentId === null ? theme.primary : theme.surfaceMuted,
                  borderColor: parentId === null ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setParentId(null)}
            >
              <Text style={[styles.parentChipText, { color: parentId === null ? '#ffffff' : theme.text }]}>
                [કોઈ નહીં - મુખ્ય કેટેગરી]
              </Text>
            </Pressable>

            {rootCategories.map((rc) => {
              const active = parentId === rc.id;
              return (
                <Pressable
                  key={rc.id}
                  style={[
                    styles.parentChip,
                    {
                      backgroundColor: active ? theme.primary : theme.surfaceMuted,
                      borderColor: active ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setParentId(rc.id)}
                >
                  <Text style={[styles.parentChipText, { color: active ? '#ffffff' : theme.text }]}>
                    {rc.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Form Actions: Save / Cancel */}
          <View style={styles.formBtnRow}>
            {editingCatId && (
              <Pressable
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={() => {
                  setEditingCatId(null);
                  setNewCatName('');
                  setNewCatNameEn('');
                  setImageUrl('');
                  setGraphicType('cat-valves');
                  setParentId(null);
                }}
              >
                <Text style={[styles.cancelBtnText, { color: theme.text }]}>રદ કરો</Text>
              </Pressable>
            )}

            <Pressable style={[styles.saveBtn, { backgroundColor: '#166534' }]} onPress={handleSaveCategory}>
              <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
              <Text style={styles.saveBtnText}>
                {editingCatId ? 'અપડેટ કરો' : 'કેટેગરી સેવ કરો'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Existing Categories Tree View with Direct "ફોટો બદલો" Buttons */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            હાલની કેટેગરીઝ અને ફોટો વ્યવસ્થાપન ({categories.length})
          </Text>

          {rootCategories.map((root) => {
            const children = categories.filter((c) => c.parent_id === root.id);
            return (
              <View key={root.id} style={[styles.treeRootBox, { borderColor: theme.border }]}>
                {/* Root Category Row */}
                <View style={styles.treeRow}>
                  {/* Thumbnail (Click to change photo immediately) */}
                  <Pressable
                    style={styles.listThumbBox}
                    onPress={() => handleQuickChangePhoto(root)}
                  >
                    {root.image_url ? (
                      <Image source={{ uri: root.image_url }} style={styles.listThumbImg} resizeMode="cover" />
                    ) : (
                      <IrrigationGraphic type={(root.graphic_type as any) || 'cat-valves'} width={36} height={36} />
                    )}
                    <View style={styles.miniCameraBadge}>
                      <Ionicons name="camera" size={10} color="#ffffff" />
                    </View>
                  </Pressable>

                  <View style={{ flex: 1, paddingHorizontal: 8 }}>
                    <Text style={[styles.treeRootName, { color: theme.text }]}>
                      {root.name}
                    </Text>
                    {root.name_en ? (
                      <Text style={styles.enSub}>{root.name_en}</Text>
                    ) : null}

                    {/* Direct "ફોટો બદલો" button right on the row! */}
                    <Pressable
                      style={styles.rowPhotoBtn}
                      onPress={() => handleQuickChangePhoto(root)}
                    >
                      <Ionicons name="camera-outline" size={13} color="#166534" />
                      <Text style={styles.rowPhotoBtnText}>ફોટો બદલો</Text>
                    </Pressable>
                  </View>

                  <View style={styles.treeActions}>
                    <Pressable style={styles.iconAction} onPress={() => handleToggleActive(root)}>
                      <Ionicons
                        name={root.is_active ? 'eye' : 'eye-off'}
                        size={18}
                        color={root.is_active ? '#15803d' : '#94a3b8'}
                      />
                    </Pressable>
                    <Pressable style={styles.iconAction} onPress={() => handleEdit(root)}>
                      <Ionicons name="pencil" size={16} color="#0284c7" />
                    </Pressable>
                    <Pressable style={styles.iconAction} onPress={() => handleDelete(root.id, root.name)}>
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </Pressable>
                  </View>
                </View>

                {/* Subcategories under this Root */}
                {children.length > 0 && (
                  <View style={styles.childrenContainer}>
                    {children.map((child) => (
                      <View key={child.id} style={[styles.childRow, { borderBottomColor: theme.border }]}>
                        <Pressable
                          style={styles.listThumbBoxSmall}
                          onPress={() => handleQuickChangePhoto(child)}
                        >
                          {child.image_url ? (
                            <Image source={{ uri: child.image_url }} style={styles.listThumbImgSmall} resizeMode="cover" />
                          ) : (
                            <IrrigationGraphic type={(child.graphic_type as any) || 'union-valve'} width={24} height={24} />
                          )}
                        </Pressable>

                        <View style={{ flex: 1, paddingHorizontal: 6 }}>
                          <Text style={[styles.childName, { color: theme.text }]}>
                            {child.name}
                          </Text>
                          <Pressable
                            style={styles.rowPhotoBtnSmall}
                            onPress={() => handleQuickChangePhoto(child)}
                          >
                            <Ionicons name="camera-outline" size={11} color="#166534" />
                            <Text style={styles.rowPhotoBtnTextSmall}>ફોટો બદલો</Text>
                          </Pressable>
                        </View>

                        <View style={styles.treeActions}>
                          <Pressable style={styles.iconAction} onPress={() => handleEdit(child)}>
                            <Ionicons name="pencil" size={14} color="#0284c7" />
                          </Pressable>
                          <Pressable style={styles.iconAction} onPress={() => handleDelete(child.id, child.name)}>
                            <Ionicons name="trash-outline" size={14} color="#ef4444" />
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
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
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  // Top Prominent Image Card
  topImageCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#16a34a',
    gap: 10,
    marginBottom: 8,
  },
  topImageLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#166534',
  },
  topImageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bigPreviewBox: {
    width: 96,
    height: 96,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#166534',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bigPreviewImg: {
    width: '100%',
    height: '100%',
  },
  emptyImgPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tapToChangeBadge: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: 'rgba(22, 101, 52, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tapToChangeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  topActionBtnsCol: {
    flex: 1,
    gap: 8,
  },
  bigGreenUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#166534',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  bigBlueCameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  bigUploadBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 10,
    height: 40,
    gap: 6,
    marginTop: 2,
  },
  urlInput: {
    flex: 1,
    fontSize: 12,
    borderWidth: 0,
    padding: 0,
  },
  clearImgBtn: {
    padding: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  parentChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  parentChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  treeRootBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    marginVertical: 4,
  },
  treeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listThumbBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#166534',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  listThumbImg: {
    width: '100%',
    height: '100%',
  },
  miniCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#166534',
    padding: 2,
    borderTopLeftRadius: 4,
  },
  treeRootName: {
    fontSize: 14,
    fontWeight: '800',
  },
  enSub: {
    fontSize: 10,
    color: '#64748b',
  },
  rowPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  rowPhotoBtnText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
  rowPhotoBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dcfce7',
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 2,
  },
  rowPhotoBtnTextSmall: {
    color: '#166534',
    fontSize: 10,
    fontWeight: '700',
  },
  treeActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconAction: {
    padding: 5,
  },
  childrenContainer: {
    paddingLeft: 14,
    marginTop: 6,
    gap: 4,
  },
  childRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listThumbBoxSmall: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#166534',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  listThumbImgSmall: {
    width: '100%',
    height: '100%',
  },
  childName: {
    fontSize: 13,
    fontWeight: '700',
  },
});
