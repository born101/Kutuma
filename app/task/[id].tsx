import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { MapPin, Clock, Star, User, ChevronLeft, DollarSign, X, CheckCircle } from 'lucide-react-native';
import { getCategoryColor, getCategoryLabel } from '@/constants/categories';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import PaymentModal from '@/components/PaymentModal';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const taskId = typeof id === 'string' ? id : '';
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);

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
      utils.tasks.myTasks.invalidate();
      setBidModalVisible(false);
      setBidAmount('');
      setBidMessage('');
      Alert.alert('Success', 'Bid placed successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to place bid');
    },
  });

  const completeTaskMutation = trpc.tasks.complete.useMutation({
    onSuccess: () => {
      utils.tasks.get.invalidate({ id: taskId });
      utils.tasks.list.invalidate();
      utils.tasks.myTasks.invalidate();
      // Show rating modal after completion
      setRatingModalVisible(true);
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to complete task');
    },
  });

  const createRatingMutation = trpc.ratings.create.useMutation({
    onSuccess: () => {
      utils.tasks.get.invalidate({ id: taskId });
      utils.ratings.list.invalidate();
      setRatingModalVisible(false);
      setRating(0);
      setRatingComment('');
      Alert.alert('Success', 'Rating submitted successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to submit rating');
    },
  });

  const createPaymentMutation = trpc.payments.create.useMutation({
    onSuccess: () => {
      utils.tasks.get.invalidate({ id: taskId });
      utils.tasks.list.invalidate();
      setPaymentModalVisible(false);
      Alert.alert('Success', 'Payment created successfully!');
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to create payment');
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
  const sortedBids = [...task.bids].sort((a, b) => Number(a.amount) - Number(b.amount));

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
  const isAssignedRunner = task?.assignedRunnerId === user?.id;
  const canComplete = (isTaskOwner || isAssignedRunner) && task?.status === 'active';

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
        <View style={styles.statusSection}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{categoryLabel}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            task.status === 'open' && { backgroundColor: '#10B981' },
            task.status === 'active' && { backgroundColor: '#F59E0B' },
            task.status === 'completed' && { backgroundColor: '#6B7280' },
            task.status === 'cancelled' && { backgroundColor: '#EF4444' },
          ]}>
            <Text style={styles.statusText}>{task.status.toUpperCase()}</Text>
          </View>
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

      {canComplete && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              Alert.alert(
                'Complete Task',
                isTaskOwner
                  ? 'Mark this task as completed? The runner will be notified.'
                  : 'Mark this task as completed? The requester will be notified.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Complete',
                    style: 'default',
                    onPress: () => {
                      completeTaskMutation.mutate({
                        taskId: task.id,
                        userId: user!.id,
                        completedBy: isTaskOwner ? 'requester' : 'runner',
                      });
                    },
                  },
                ]
              );
            }}
            disabled={completeTaskMutation.isPending}
          >
            {completeTaskMutation.isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>Mark as Completed</Text>
              </>
            )}
          </TouchableOpacity>
          {isTaskOwner && task?.status === 'active' && (
            <TouchableOpacity
              style={styles.paymentButton}
              onPress={() => setPaymentModalVisible(true)}
            >
              <DollarSign size={20} color="#FFFFFF" />
              <Text style={styles.paymentButtonText}>Make Payment</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

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

      {/* Rating Modal */}
      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ratingModal}>
            <View style={styles.ratingHeader}>
              <Text style={styles.ratingTitle}>Rate {task?.assignedRunnerId === user?.id ? 'Task Requester' : 'Runner'}</Text>
              <TouchableOpacity
                onPress={() => {
                  setRatingModalVisible(false);
                  setRating(0);
                  setRatingComment('');
                }}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.ratingContent}
              contentContainerStyle={styles.ratingContentPadding}
              showsVerticalScrollIndicator={false}
            >
              {/* Star Rating */}
              <View style={styles.starsContainer}>
                <Text style={styles.starsLabel}>How would you rate this experience?</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.starButton}
                    >
                      <Star
                        size={40}
                        color={star <= rating ? '#FF6B4A' : '#333333'}
                        fill={star <= rating ? '#FF6B4A' : 'none'}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Comment Input */}
              <View style={styles.commentSection}>
                <Text style={styles.commentLabel}>Additional feedback (optional)</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your experience..."
                  placeholderTextColor="#666666"
                  value={ratingComment}
                  onChangeText={setRatingComment}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                <Text style={styles.charCount}>{ratingComment.length}/500</Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  rating === 0 && styles.submitButtonDisabled
                ]}
                onPress={() => {
                  if (rating === 0) {
                    Alert.alert('Error', 'Please select a rating');
                    return;
                  }
                  
                  if (!user) {
                    Alert.alert('Error', 'You must be logged in');
                    return;
                  }
                  
                  const toUserId = task?.assignedRunnerId === user?.id 
                    ? task?.createdBy 
                    : task?.assignedRunnerId;
                  
                  if (!toUserId) {
                    Alert.alert('Error', 'Unable to determine who to rate');
                    return;
                  }

                  createRatingMutation.mutate({
                    taskId: task.id,
                    fromUserId: user.id,
                    toUserId,
                    rating,
                    comment: ratingComment || undefined,
                  });
                }}
                disabled={createRatingMutation.isPending || rating === 0}
              >
                {createRatingMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Rating</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        taskAmount={(task?.fixedPrice || task?.maxBudget || '0').toString()}
        isLoading={createPaymentMutation.isPending}
        onSubmit={(method, transactionId) => {
          if (!user) {
            Alert.alert('Error', 'You must be logged in');
            return;
          }

          const amount = task?.fixedPrice || task?.maxBudget;
          if (!amount) {
            Alert.alert('Error', 'Unable to determine payment amount');
            return;
          }

          const recipientId = task?.createdBy === user.id 
            ? task?.assignedRunnerId 
            : task?.createdBy;
          
          if (!recipientId) {
            Alert.alert('Error', 'Unable to determine payment recipient');
            return;
          }

          createPaymentMutation.mutate({
            taskId: task.id,
            payerId: user.id,
            recipientId,
            amount: parseFloat(amount.toString()),
            method: method as 'ecocash' | 'onemoney' | 'bank' | 'cash',
            transactionId,
          });
        }}
      />
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
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
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
  completeButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  paymentButton: {
    backgroundColor: '#0891B2',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  paymentButtonText: {
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
  ratingModal: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    marginTop: 'auto',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  ratingContent: {
    flex: 1,
  },
  ratingContentPadding: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  starsContainer: {
    marginBottom: 30,
  },
  starsLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  starButton: {
    padding: 5,
  },
  commentSection: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  commentInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    color: '#FFFFFF',
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#FF6B4A',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 16,
  },
});
