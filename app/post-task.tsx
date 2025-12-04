import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { X } from 'lucide-react-native';
import { CATEGORIES } from '@/constants/categories';
import type { TaskCategory } from '@/types';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';

export default function PostTaskScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<TaskCategory>('groceries');
  const [budgetType, setBudgetType] = useState<'max' | 'fixed'>('max');
  const [amount, setAmount] = useState('');
  const [timeframe, setTimeframe] = useState('');

  const utils = trpc.useUtils();
  const createTaskMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      Alert.alert('Success', 'Task posted successfully!');
      router.back();
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to post task');
    },
  });

  const handleSubmit = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post a task');
      return;
    }

    if (!title || !description || !location || !amount || !timeframe) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    createTaskMutation.mutate({
      title,
      description,
      location,
      category,
      timeframe,
      bidType: budgetType,
      maxBudget: budgetType === 'max' ? amountNum : undefined,
      fixedPrice: budgetType === 'fixed' ? amountNum : undefined,
      createdBy: user.id,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={28} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Task</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.label}>Task Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Buy groceries from OK Mart"
            placeholderTextColor="#6B7280"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what you need done in detail..."
            placeholderTextColor="#6B7280"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. OK Mart, Avondale"
            placeholderTextColor="#6B7280"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Timeframe</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. in about 2 hours"
            placeholderTextColor="#6B7280"
            value={timeframe}
            onChangeText={setTimeframe}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContent}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  category === cat.id && {
                    backgroundColor: cat.color,
                  },
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    category === cat.id && styles.categoryPillTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Budget Type</Text>
          <View style={styles.budgetTypeContainer}>
            <TouchableOpacity
              style={[
                styles.budgetTypeButton,
                budgetType === 'max' && styles.budgetTypeButtonActive,
              ]}
              onPress={() => setBudgetType('max')}
            >
              <Text
                style={[
                  styles.budgetTypeText,
                  budgetType === 'max' && styles.budgetTypeTextActive,
                ]}
              >
                Max Budget (Accept Bids)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.budgetTypeButton,
                budgetType === 'fixed' && styles.budgetTypeButtonActive,
              ]}
              onPress={() => setBudgetType('fixed')}
            >
              <Text
                style={[
                  styles.budgetTypeText,
                  budgetType === 'fixed' && styles.budgetTypeTextActive,
                ]}
              >
                Fixed Price
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {budgetType === 'max' ? 'Maximum Budget ($)' : 'Fixed Price ($)'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 15"
            placeholderTextColor="#6B7280"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>
            {budgetType === 'max'
              ? 'Runners can bid at or below this amount'
              : 'Runners will accept this exact price'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.postButton,
            (!title || !description || !location || !amount || !timeframe || createTaskMutation.isPending) &&
              styles.postButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!title || !description || !location || !amount || !timeframe || createTaskMutation.isPending}
        >
          {createTaskMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.postButtonText}>Post Task</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#FF6B4A',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  hint: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
  },
  categoriesScroll: {
    flexGrow: 0,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoriesContent: {
    gap: 8,
    paddingHorizontal: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#9CA3AF',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  budgetTypeContainer: {
    gap: 12,
  },
  budgetTypeButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  budgetTypeButtonActive: {
    borderColor: '#FF6B4A',
    backgroundColor: 'rgba(255, 107, 74, 0.1)',
  },
  budgetTypeText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#9CA3AF',
  },
  budgetTypeTextActive: {
    color: '#FF6B4A',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  postButton: {
    backgroundColor: '#FF6B4A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#374151',
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
