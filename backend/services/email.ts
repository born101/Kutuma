export const emailService = {
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    console.log(`📧 Verification code for ${email}: ${code}`);
    console.log(`📧 In production, this would be sent via email service`);
  }
};
