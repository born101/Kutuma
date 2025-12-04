import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Search, Plus, Briefcase, User } from 'lucide-react-native';
import { CATEGORIES } from '@/constants/categories';
import TaskCard from '@/components/TaskCard';
import type { TaskCategory } from '@/types';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';

export default function BrowseTasksScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');

  const tasksQuery = trpc.tasks.list.useQuery({
    category: selectedCategory,
    search: searchQuery,
    status: 'open',
  });

  const filteredTasks = tasksQuery.data || [];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Browse Tasks</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/post-task' as any)}
          >
            <Plus size={24} color="#FFFFFF" strokeWidth={3} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              selectedCategory === 'all' && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.categoryPillText,
                selectedCategory === 'all' && styles.categoryPillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryPill,
                selectedCategory === category.id && styles.categoryPillActive,
                selectedCategory === category.id && {
                  backgroundColor: category.color,
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View
                style={[
                  styles.categoryDot,
                  { backgroundColor: category.color },
                ]}
              />
              <Text
                style={[
                  styles.categoryPillText,
                  selectedCategory === category.id && styles.categoryPillTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {user && (
          <View style={[styles.modeBanner, user.isRunner ? styles.runnerMode : styles.requesterMode]}>
            {user.isRunner ? (
              <Briefcase size={16} color="#FFFFFF" />
            ) : (
              <User size={16} color="#FFFFFF" />
            )}
            <Text style={styles.modeBannerText}>
              {user.isRunner ? 'Runner Mode: Browse and bid on tasks' : 'Requester Mode: Post tasks for runners'}
            </Text>
          </View>
        )}
        <Text style={styles.tasksCount}>
          {filteredTasks.length} TASKS AVAILABLE
        </Text>

        {tasksQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B4A" />
          </View>
        ) : tasksQuery.error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load tasks</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => tasksQuery.refetch()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.tasksList}
            contentContainerStyle={styles.tasksListContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task as any}
                onPress={() => router.push(`/task/${task.id}` as any)}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  categoriesScroll: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 8,
  },
  categoryPillActive: {
    backgroundColor: '#FF6B4A',
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modeBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  runnerMode: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  requesterMode: {
    backgroundColor: 'rgba(255, 107, 74, 0.15)',
  },
  modeBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  tasksCount: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  tasksList: {
    flex: 1,
  },
  tasksListContent: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6B4A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
