import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { User, Briefcase, ArrowRight, RefreshCw } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { trpcClient } from '@/lib/trpc';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default function ProfileSetupScreen() {
  const { login } = useAuth();
  const params = useLocalSearchParams<{ email?: string; phone?: string }>();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<'runner' | 'requester' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const attemptProfileCreation = useCallback(async (attempt: number = 1): Promise<boolean> => {
    console.log(`🚀 Profile creation attempt ${attempt}/${MAX_RETRIES}`);
    console.log('📍 Email:', params.email);
    console.log('📍 Phone:', params.phone);
    console.log('📍 Name:', name.trim());
    console.log('📍 Is Runner:', selectedType === 'runner');

    try {
      if (params.email) {
        console.log('🔄 Creating account with email:', params.email);
        
        const result = await trpcClient.auth.verifyEmail.mutate({
          email: params.email,
          code: '000000',
          name: name.trim(),
          isRunner: selectedType === 'runner',
        });

        console.log('✅ Account created successfully:', result.user.id);
        await login(result.user, result.token);
        router.replace('/(tabs)');
        return true;
      } else if (params.phone) {
        console.log('🔄 Creating account with phone:', params.phone);
        
        const result = await trpcClient.auth.verifyOTP.mutate({
          phone: params.phone,
          code: '000000',
          name: name.trim(),
          isRunner: selectedType === 'runner',
        });

        console.log('✅ Account created successfully:', result.user.id);
        await login(result.user, result.token);
        router.replace('/(tabs)');
        return true;
      } else {
        console.error('❌ No email or phone provided');
        setLastError('Missing authentication data. Please go back and try again.');
        return false;
      }
    } catch (error: any) {
      console.error(`❌ Attempt ${attempt} failed:`, error?.message);
      
      const isNetworkError = 
        error?.message?.includes('Failed to fetch') || 
        error?.message?.includes('Network request failed') ||
        error?.message?.includes('network') ||
        error?.message?.includes('timeout');
      
      if (isNetworkError && attempt < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY}ms...`);
        await delay(RETRY_DELAY);
        return attemptProfileCreation(attempt + 1);
      }
      
      throw error;
    }
  }, [params.email, params.phone, name, selectedType, login]);

  const handleComplete = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter your full name');
      return;
    }

    if (!selectedType) {
      Alert.alert('Select Account Type', 'Please select whether you want to be a runner or requester');
      return;
    }

    setIsLoading(true);
    setLastError(null);
    setRetryCount(0);

    try {
      await attemptProfileCreation(1);
    } catch (error: any) {
      console.error('❌ Complete profile error:', error);
      console.error('❌ Error name:', error?.name);
      console.error('❌ Error message:', error?.message);
      
      let errorMessage = 'Failed to complete profile setup';
      
      if (error?.message?.includes('JSON Parse error') || error?.message?.includes('Unexpected character')) {
        errorMessage = 'Server returned an invalid response. Please wait a moment and try again.';
      } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network request failed')) {
        errorMessage = 'Unable to connect to server. The server may be starting up - please wait and try again.';
      } else if (error?.message?.includes('database') || error?.message?.includes('Database')) {
        errorMessage = 'Database connection issue. Please wait a moment and try again.';
      } else if (error?.message?.includes('timeout') || error?.message?.includes('Timeout')) {
        errorMessage = 'Connection timed out. Please try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }
      
      setLastError(errorMessage);
      setRetryCount(prev => prev + 1);
      console.error('💡 User-facing error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>
                Tell us a bit about yourself to get started
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>What&apos;s your name?</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#6B7280"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>What brings you to Kutuma?</Text>
              <Text style={styles.description}>
                You can always change this later in settings
              </Text>

              <TouchableOpacity
                style={[
                  styles.typeCard,
                  selectedType === 'runner' && styles.typeCardSelected,
                ]}
                onPress={() => setSelectedType('runner')}
              >
                <View style={styles.typeIcon}>
                  <Briefcase 
                    size={32} 
                    color={selectedType === 'runner' ? '#FF6B4A' : '#FFFFFF'}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.typeContent}>
                  <Text style={styles.typeTitle}>I&apos;m a Runner</Text>
                  <Text style={styles.typeText}>
                    I want to offer my services and complete tasks for others
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    selectedType === 'runner' && styles.radioSelected,
                  ]}
                >
                  {selectedType === 'runner' && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeCard,
                  selectedType === 'requester' && styles.typeCardSelected,
                ]}
                onPress={() => setSelectedType('requester')}
              >
                <View style={styles.typeIcon}>
                  <User 
                    size={32} 
                    color={selectedType === 'requester' ? '#FF6B4A' : '#FFFFFF'}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.typeContent}>
                  <Text style={styles.typeTitle}>I&apos;m Looking for Help</Text>
                  <Text style={styles.typeText}>
                    I want to post tasks and find people to help me
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    selectedType === 'requester' && styles.radioSelected,
                  ]}
                >
                  {selectedType === 'requester' && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            </View>

            {lastError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{lastError}</Text>
                {retryCount > 0 && (
                  <Text style={styles.retryHint}>
                    Tap the button below to try again. If the problem persists, the server may be temporarily unavailable.
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                (!name.trim() || !selectedType || isLoading) && styles.buttonDisabled,
                lastError ? styles.buttonRetry : null,
              ]}
              onPress={handleComplete}
              disabled={!name.trim() || !selectedType || isLoading}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text style={styles.buttonText}>Connecting...</Text>
                </>
              ) : lastError ? (
                <>
                  <RefreshCw size={20} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Try Again</Text>
                </>
              ) : (
                <>
                  <Text style={styles.buttonText}>Continue</Text>
                  <ArrowRight size={20} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  typeCardSelected: {
    borderColor: '#FF6B4A',
    backgroundColor: '#1F2937',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  typeText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioSelected: {
    borderColor: '#FF6B4A',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B4A',
  },
  button: {
    backgroundColor: '#FF6B4A',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 'auto' as const,
  },
  buttonDisabled: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  buttonRetry: {
    backgroundColor: '#3B82F6',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center' as const,
  },
  retryHint: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center' as const,
    marginTop: 8,
  },
});
