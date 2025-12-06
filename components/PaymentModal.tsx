import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (method: string, transactionId?: string) => void;
  isLoading: boolean;
  taskAmount: string;
}

const PAYMENT_METHODS = [
  { id: 'ecocash', name: 'EcoCash', icon: '📱' },
  { id: 'onemoney', name: 'OneMoney', icon: '💳' },
  { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
  { id: 'cash', name: 'Cash', icon: '💵' },
];

export default function PaymentModal({
  visible,
  onClose,
  onSubmit,
  isLoading,
  taskAmount,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');

  const handleSubmit = () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    // Only require transaction ID for digital methods
    if (['ecocash', 'onemoney', 'bank'].includes(selectedMethod)) {
      if (!transactionId.trim()) {
        Alert.alert('Error', 'Please enter transaction ID');
        return;
      }
    }

    onSubmit(selectedMethod, transactionId || undefined);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setTransactionId('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.paymentModal}>
          <View style={styles.header}>
            <Text style={styles.title}>Make Payment</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentPadding}
            showsVerticalScrollIndicator={false}
          >
            {/* Amount Display */}
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Amount Due</Text>
              <Text style={styles.amountValue}>ZWL {taskAmount}</Text>
            </View>

            {/* Payment Methods */}
            <Text style={styles.methodsLabel}>Select Payment Method</Text>
            <View style={styles.methodsGrid}>
              {PAYMENT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    selectedMethod === method.id && styles.methodCardSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <Text style={styles.methodIcon}>{method.icon}</Text>
                  <Text style={styles.methodName}>{method.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Transaction ID Input */}
            {selectedMethod && ['ecocash', 'onemoney', 'bank'].includes(selectedMethod) && (
              <View style={styles.transactionSection}>
                <Text style={styles.transactionLabel}>
                  {selectedMethod === 'bank' 
                    ? 'Reference Number' 
                    : 'Transaction ID'}
                </Text>
                <Text style={styles.transactionHint}>
                  {selectedMethod === 'ecocash' && 'Enter your EcoCash transaction ID'}
                  {selectedMethod === 'onemoney' && 'Enter your OneMoney transaction ID'}
                  {selectedMethod === 'bank' && 'Enter bank reference/transaction number'}
                </Text>
                <TextInput
                  style={styles.transactionInput}
                  placeholder="Enter transaction ID"
                  placeholderTextColor="#666666"
                  value={transactionId}
                  onChangeText={setTransactionId}
                  editable={!isLoading}
                />
              </View>
            )}

            {/* Cash Note */}
            {selectedMethod === 'cash' && (
              <View style={styles.noteBox}>
                <Text style={styles.noteTitle}>Cash Payment</Text>
                <Text style={styles.noteText}>
                  You will pay ZWL {taskAmount} in cash directly to the runner after task completion.
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedMethod || isLoading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedMethod || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Confirm Payment</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  paymentModal: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  amountSection: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FF6B4A',
  },
  methodsLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  methodCard: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: '#FF6B4A',
    backgroundColor: '#2A2A2A',
  },
  methodIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  methodName: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  transactionSection: {
    marginBottom: 20,
  },
  transactionLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  transactionHint: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 10,
  },
  transactionInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    color: '#FFFFFF',
    padding: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  noteBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B4A',
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FF6B4A',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 18,
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
