import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Clock, Star, User } from 'lucide-react-native';
import type { Task } from '@/types';
import { getCategoryColor, getCategoryLabel } from '@/constants/categories';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const categoryColor = getCategoryColor(task.category as any);
  const categoryLabel = getCategoryLabel(task.category as any);

  const lowestBid = task.bids.length > 0
    ? Math.min(...task.bids.map(b => Number(b.amount)))
    : null;

  const displayBid = task.bidType === 'max' ? lowestBid : task.fixedPrice;
  const bidLabel = task.bidType === 'max' ? 'MAX' : 'FIXED';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>
        
        {task.bids.length > 0 ? (
          <View style={styles.bidsBadge}>
            <Text style={styles.bidsText}>{task.bids.length} BIDS</Text>
          </View>
        ) : (
          <View style={styles.openBadge}>
            <Text style={styles.openText}>OPEN</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MapPin size={16} color="#9CA3AF" />
          <Text style={styles.detailText}>{task.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color="#9CA3AF" />
          <Text style={styles.detailText}>{task.timeframe}</Text>
        </View>
      </View>

      {task.bids.length > 0 && task.bids[0].runner && (
        <View style={styles.runnerSection}>
          <View style={styles.runnerInfo}>
            <View style={styles.avatar}>
              <User size={20} color="#FF6B4A" />
            </View>
            <View style={styles.runnerDetails}>
              <Text style={styles.runnerName}>{task.bids[0].runner.name}</Text>
              <View style={styles.ratingContainer}>
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.rating}>{task.bids[0].runner.rating}</Text>
              </View>
            </View>
          </View>
          <View style={styles.priceSection}>
            <Text style={styles.bidTypeLabel}>{bidLabel}</Text>
            <Text style={styles.price}>${displayBid}</Text>
          </View>
        </View>
      )}

      {task.bids.length === 0 && task.bidType === 'max' && (
        <View style={styles.runnerSection}>
          <View style={styles.runnerInfo}>
            <Text style={styles.noBidsText}>Awaiting bids</Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={styles.bidTypeLabel}>MAX</Text>
            <Text style={styles.price}>${task.maxBudget}</Text>
          </View>
        </View>
      )}

      {task.bids.length === 0 && task.bidType === 'fixed' && (
        <View style={styles.runnerSection}>
          <View style={styles.runnerInfo}>
            <Text style={styles.noBidsText}>Awaiting runner</Text>
          </View>
          <View style={styles.priceSection}>
            <Text style={styles.bidTypeLabel}>FIXED</Text>
            <Text style={styles.price}>${task.fixedPrice}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  bidsBadge: {
    backgroundColor: '#0891B2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bidsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  openBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  openText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  details: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  runnerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  runnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3F2F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runnerDetails: {
    gap: 4,
  },
  runnerName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
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
  priceSection: {
    alignItems: 'flex-end',
  },
  bidTypeLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#0891B2',
    marginBottom: 2,
  },
  price: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#06B6D4',
  },
  noBidsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic' as const,
  },
});
