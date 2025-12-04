import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { MapPin, Clock, Star, User, ChevronLeft, DollarSign, X } from 'lucide-react-native';
import { getCategoryColor, getCategoryLabel } from '@/constants/categories';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const taskId = typeof id === 'string' ? id : '';
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  const taskQuery = trpc.tasks.get.useQuery({ id: taskId });
  const utils = trpc.useUtils();
  
  const acceptBidMutation = trpc.bids.accept.useMutation({
    onSuccess: () => {
      utils.tasks.get.invalidate({ id: taskId });
      utils.tasks.list.invalidate();
      Alert.alert('Success', 'Bid accepted successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to accept bid');
    },
  });

  const createBidMutation = trpc.bids.create.useMutation({
    onSuccess: () => {
      utils.tasks.get.invalidate({ id: taskId });
      utils.tasks.list.invalidate();
      setBidModalVisible(false);
      setBidAmount('');
      setBidMessage('');
      Alert.alert('Success', 'Bid placed successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to place bid');
    },
  });

  if (taskQuery.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B4A" />
        </View>
      </View>
    );
  }

  if (taskQuery.error || !taskQuery.data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Task not found</Text>
      </View>
    );
  }

  const task = taskQuery.data;
  const categoryColor = getCategoryColor(task.category as any);
  const categoryLabel = getCategoryLabel(task.category as any);
  const sortedBids = [...task.bids].sort((a, b) => a.amount - b.amount);

  const handleAcceptBid = (bidId: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }
    acceptBidMutation.mutate({ bidId, userId: user.id });
  };

  const handlePlaceBid = () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    if (!user.isRunner) {
      Alert.alert('Error', 'Switch to Runner mode in your profile to place bids');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (task.bidType === 'max' && amount > (task.maxBudget || 0)) {
      Alert.alert('Error', `Bid cannot exceed maximum budget of ${task.maxBudget}`);
      return;
    }

    createBidMutation.mutate({
      taskId: task.id,
      runnerId: user.id,
      amount,
      message: bidMessage || undefined,
    });
  };

  const userHasAlreadyBid = task?.bids.some((bid) => bid.runner?.id === user?.id);
  const isTaskOwner = task?.createdBy === user?.id;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={28} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>

        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description}>{task.description}</Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MapPin size={20} color="#9CA3AF" />
            <Text style={styles.detailText}>{task.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={20} color="#9CA3AF" />
            <Text style={styles.detailText}>{task.timeframe}</Text>
          </View>
        </View>

        <View style={styles.budgetSection}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <View style={styles.budgetCard}>
            <View>
              <Text style={styles.budgetLabel}>
                {task.bidType === 'max' ? 'Maximum Budget' : 'Fixed Price'}
              </Text>
              <Text style={styles.budgetAmount}>
                ${task.bidType === 'max' ? task.maxBudget : task.fixedPrice}
              </Text>
            </View>
            <View style={styles.budgetBadge}>
              <Text style={styles.budgetBadgeText}>
                {task.bidType === 'max' ? 'MAX' : 'FIXED'}
              </Text>
            </View>
          </View>
        </View>

        {sortedBids.length > 0 && (
          <View style={styles.bidsSection}>
            <View style={styles.bidsSectionHeader}>
              <Text style={styles.sectionTitle}>Bids</Text>
              <View style={styles.bidsCount}>
                <Text style={styles.bidsCountText}>{sortedBids.length}</Text>
              </View>
            </View>

            {sortedBids.map((bid) => (
              bid.runner && (
                <View key={bid.id} style={styles.bidCard}>
                  <View style={styles.bidRunner}>
                    <View style={styles.avatar}>
                      <User size={24} color="#FF6B4A" />
                    </View>
                    <View style={styles.bidRunnerInfo}>
                      <Text style={styles.bidRunnerName}>{bid.runner.name}</Text>
                      <View style={styles.ratingContainer}>
                        <Star size={14} color="#FBBF24" fill="#FBBF24" />
                        <Text style={styles.rating}>{bid.runner.rating}</Text>
                        <Text style={styles.completedTasks}>
                          • {bid.runner.completedTasks} tasks
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.bidDetails}>
                    <Text style={styles.bidAmount}>${bid.amount}</Text>
                    {task.createdBy === user?.id && task.status === 'open' && (
                      <TouchableOpacity 
                        style={styles.acceptButton}
                        onPress={() => handleAcceptBid(bid.id)}
                        disabled={acceptBidMutation.isPending}
                      >
                        {acceptBidMutation.isPending ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )
            ))}
          </View>
        )}

        {sortedBids.length === 0 && (
          <View style={styles.noBidsSection}>
            <Text style={styles.noBidsTitle}>No bids yet</Text>
            <Text style={styles.noBidsText}>
              Your task is live. Runners will start bidding soon!
            </Text>
          </View>
        )}
      </ScrollView>

      {user?.isRunner && !isTaskOwner && task.status === 'open' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.bidButton,
              userHasAlreadyBid && styles.bidButtonDisabled,
            ]}
            onPress={() => setBidModalVisible(true)}
            disabled={userHasAlreadyBid}
          >
            <DollarSign size={20} color="#FFFFFF" />
            <Text style={styles.bidButtonText}>
              {userHasAlreadyBid ? 'Bid Already Placed' : 'Place a Bid'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={bidModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBidModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Place Your Bid</Text>
              <TouchableOpacity
                onPress={() => setBidModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.budgetInfo}>
                <Text style={styles.budgetInfoLabel}>
                  {task?.bidType === 'max' ? 'Maximum Budget:' : 'Fixed Price:'}
                </Text>
                <Text style={styles.budgetInfoValue}>
                  ${task?.bidType === 'max' ? task?.maxBudget : task?.fixedPrice}
                </Text>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Your Bid Amount ($)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  placeholderTextColor="#6B7280"
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  keyboardType="numeric"
                />
                {task?.bidType === 'max' && (
                  <Text style={styles.inputHint}>
                    Bid at or below ${task?.maxBudget}
                  </Text>
                )}
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Message (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add a note to your bid..."
                  placeholderTextColor="#6B7280"
                  value={bidMessage}
                  onChangeText={setBidMessage}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitBidButton,
                  (!bidAmount || createBidMutation.isPending) && styles.submitBidButtonDisabled,
                ]}
                onPress={handlePlaceBid}
                disabled={!bidAmount || createBidMutation.isPending}
              >
                {createBidMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBidButtonText}>Submit Bid</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
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
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
    marginBottom: 24,
  },
  details: {
    gap: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  budgetSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  budgetCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#06B6D4',
  },
  budgetBadge: {
    backgroundColor: '#0891B2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  budgetBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  bidsSection: {
    marginBottom: 24,
  },
  bidsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bidsCount: {
    backgroundColor: '#FF6B4A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bidsCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  bidCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidRunner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3F2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidRunnerInfo: {
    flex: 1,
  },
  bidRunnerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FBBF24',
  },
  completedTasks: {
    fontSize: 14,
    color: '#6B7280',
  },
  bidDetails: {
    alignItems: 'flex-end',
    gap: 8,
  },
  bidAmount: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#06B6D4',
  },
  acceptButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  noBidsSection: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  noBidsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noBidsText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  bidButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bidButtonDisabled: {
    backgroundColor: '#374151',
  },
  bidButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
  },
  budgetInfo: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetInfoLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  budgetInfoValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#06B6D4',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  inputHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
  },
  submitBidButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBidButtonDisabled: {
    backgroundColor: '#374151',
  },
  submitBidButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButton: {
    backgroundColor: '#06B6D4',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
