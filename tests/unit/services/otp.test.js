const { OTPService } = require('../../../src/services');

describe('OTPService', () => {
  describe('Generate OTP', () => {
    it('should generate OTP', () => {
      const otp = OTPService.generateCode();
      expect(otp).toHaveLength(6);
      expect(otp).toMatch(/^[0-9]{6}$/);
    });
  });

  describe('Generate and Save User OTP', () => {
    it('should save an OTP for a user', async () => {
      const user = 'admin@test.com';
      const response = await OTPService.generateOTP(user);
      expect(response.email).toBe(user);
    });
  });
});
