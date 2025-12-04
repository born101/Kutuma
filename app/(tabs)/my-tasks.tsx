import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import TaskCard from '@/components/TaskCard';

type TabType = 'assigned' | 'posted';

export default function MyTasksScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('posted');

  const postedTasksQuery = trpc.tasks.myTasks.useQuery(
    { userId: user?.id || '', type: 'posted' },
    { enabled: !!user && activeTab === 'posted' }
  );

  const assignedTasksQuery = trpc.tasks.myTasks.useQuery(
    { userId: user?.id || '', type: 'assigned' },
    { enabled: !!user && activeTab === 'assigned' }
  );

  const getCurrentQuery = () => {
    switch (activeTab) {
      case 'posted':
        return postedTasksQuery;
      case 'assigned':
        return assignedTasksQuery;
      default:
        return postedTasksQuery;
    }
  };

  const currentQuery = getCurrentQuery();
  const tasks = currentQuery.data || [];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'assigned' && styles.tabActive]}
          onPress={() => setActiveTab('assigned')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'assigned' && styles.tabTextActive,
            ]}
          >
            Assigned
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'posted' && styles.tabActive]}
          onPress={() => setActiveTab('posted')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'posted' && styles.tabTextActive,
            ]}
          >
            Posted
          </Text>
          {postedTasksQuery.data && postedTasksQuery.data.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{postedTasksQuery.data.length}</Text>
            </View>
          )}
        </TouchableOpacity>


      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {currentQuery.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B4A" />
          </View>
        ) : currentQuery.error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Error</Text>
            <Text style={styles.emptyText}>Failed to load tasks</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => currentQuery.refetch()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks here</Text>
            <Text style={styles.emptyText}>No {activeTab} tasks at the moment</Text>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task as any}
                onPress={() => router.push(`/task/${task.id}` as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B4A',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FF6B4A',
  },
  badge: {
    backgroundColor: '#FF6B4A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  tasksList: {
    paddingTop: 16,
  },
});
