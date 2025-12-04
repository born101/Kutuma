export class OTPService {
  private otpStore: Map<string, { code: string; expiresAt: Date }> = new Map();

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phone: string): Promise<{ code: string; expiresAt: Date }> {
    const code = this.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    this.otpStore.set(phone, { code, expiresAt });

    console.log(`📱 OTP for ${phone}: ${code} (expires at ${expiresAt.toISOString()})`);

    if (process.env.NODE_ENV === 'production') {
      await this.sendSMS(phone, code);
    }

    return { code, expiresAt };
  }

  private async sendSMS(phone: string, code: string): Promise<void> {
    console.log(`📤 Sending SMS to ${phone}: Your Tuma verification code is ${code}`);
  }

  verifyOTP(phone: string, code: string): boolean {
    const stored = this.otpStore.get(phone);

    if (!stored) {
      console.log(`❌ No OTP found for ${phone}`);
      return false;
    }

    if (new Date() > stored.expiresAt) {
      console.log(`❌ OTP expired for ${phone}`);
      this.otpStore.delete(phone);
      return false;
    }

    if (stored.code !== code) {
      console.log(`❌ Invalid OTP for ${phone}`);
      return false;
    }

    this.otpStore.delete(phone);
    console.log(`✅ OTP verified for ${phone}`);
    return true;
  }
}

export const otpService = new OTPService();
