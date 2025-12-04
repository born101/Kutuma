import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Phone, Mail, ArrowRight } from 'lucide-react-native';

type AuthMethod = 'email' | 'phone';
type Step = 'method' | 'input';

export default function LoginScreen() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [step, setStep] = useState<Step>('method');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})$/);
    
    if (match) {
      const parts = [match[1], match[2], match[3]].filter(Boolean);
      return parts.join('-');
    }
    
    return text;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    if (formatted.replace(/\D/g, '').length <= 9) {
      setPhone(formatted);
    }
  };

  const handleContinue = async () => {
    if (authMethod === 'email') {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }
      
      router.push({
        pathname: '/profile-setup',
        params: { email }
      });
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 9) {
        Alert.alert('Invalid Phone', 'Please enter a valid 9-digit Zimbabwean phone number');
        return;
      }
      
      const fullPhone = `+263${phone.replace(/\D/g, '')}`;
      router.push({
        pathname: '/profile-setup',
        params: { phone: fullPhone }
      });
    }
  };

  const renderMethodSelection = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Kutuma</Text>
          <Text style={styles.subtitle}>
            Zimbabwe&apos;s Task Marketplace. Connect with trusted local runners ready to help with your errands, deliveries, and tasks.
          </Text>
        </View>

        <View style={styles.methodSection}>
          <Text style={styles.label}>How would you like to sign in?</Text>
          
          <TouchableOpacity
            style={[
              styles.methodCard,
              authMethod === 'email' && styles.methodCardSelected,
            ]}
            onPress={() => setAuthMethod('email')}
          >
            <View style={styles.methodIcon}>
              <Mail 
                size={24} 
                color={authMethod === 'email' ? '#FF6B4A' : '#FFFFFF'}
                strokeWidth={2}
              />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Email Address</Text>
              <Text style={styles.methodText}>Sign in with your email</Text>
            </View>
            <View
              style={[
                styles.radio,
                authMethod === 'email' && styles.radioSelected,
              ]}
            >
              {authMethod === 'email' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              authMethod === 'phone' && styles.methodCardSelected,
            ]}
            onPress={() => setAuthMethod('phone')}
          >
            <View style={styles.methodIcon}>
              <Phone 
                size={24} 
                color={authMethod === 'phone' ? '#FF6B4A' : '#FFFFFF'}
                strokeWidth={2}
              />
            </View>
            <View style={styles.methodContent}>
              <Text style={styles.methodTitle}>Phone Number</Text>
              <Text style={styles.methodText}>Sign in with SMS verification</Text>
            </View>
            <View
              style={[
                styles.radio,
                authMethod === 'phone' && styles.radioSelected,
              ]}
            >
              {authMethod === 'phone' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setStep('input')}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderInput = () => (
    <>
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          {authMethod === 'email' ? (
            <Mail size={48} color="#FF6B4A" strokeWidth={2} />
          ) : (
            <Phone size={48} color="#FF6B4A" strokeWidth={2} />
          )}
        </View>
      </View>

      <Text style={styles.title}>
        {authMethod === 'email' ? 'Enter Your Email' : 'Enter Your Phone'}
      </Text>
      <Text style={styles.subtitle}>
        Create your account to get started
      </Text>

      {authMethod === 'email' ? (
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          placeholderTextColor="#6B7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
        />
      ) : (
        <View style={styles.inputContainer}>
          <View style={styles.phonePrefix}>
            <Text style={styles.phonePrefixText}>+263</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="712-345-678"
            placeholderTextColor="#6B7280"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            autoFocus
            maxLength={11}
          />
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          ((!email && authMethod === 'email') || (!phone && authMethod === 'phone')) && 
            styles.buttonDisabled
        ]}
        onPress={handleContinue}
        disabled={(!email && authMethod === 'email') || (!phone && authMethod === 'phone')}
      >
        <Text style={styles.buttonText}>Continue</Text>
        <ArrowRight size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('method')}
      >
        <Text style={styles.backText}>← Back to methods</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {step === 'method' ? (
          renderMethodSelection()
        ) : (
          <View style={styles.content}>
            {renderInput()}
          </View>
        )}
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
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  methodSection: {
    marginBottom: 40,
  },
  label: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  methodCardSelected: {
    borderColor: '#FF6B4A',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  methodText: {
    fontSize: 14,
    color: '#9CA3AF',
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  phonePrefix: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phonePrefixText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500' as const,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500' as const,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF6B4A',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#374151',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
});
