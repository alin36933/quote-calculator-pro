const { execSync } = require('child_process');
process.env.EXPO_TOKEN = 'P1TtQuLR5mP4w1Q1QRatgGkh_h6mA5cU0YLnpo0L';
process.env.EAS_NO_VCS = '1';
try {
  const out = execSync('eas build --platform ios --profile production --non-interactive', {
    encoding: 'utf8',
    cwd: 'c:\\Users\\凌霄\\WorkBuddy\\20260422095526\\quote-calculator-pro',
    stdio: 'pipe',
    timeout: 600000
  });
  console.log('SUCCESS:', out.slice(-3000));
} catch (e) {
  console.log('STDOUT:', (e.stdout || '').slice(-3000));
  console.log('STDERR:', (e.stderr || '').slice(-3000));
  console.log('MSG:', e.message);
}
