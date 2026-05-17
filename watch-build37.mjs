// Auto-monitor Build #37 and submit when done
import https from 'https';
import fs from 'fs';
import { execSync } from 'child_process';

const state = JSON.parse(fs.readFileSync('C:/Users/凌霄/.expo/state.json', 'utf8'));
const sessionSecret = state.auth.sessionSecret;
const BUILD_ID = '07e7ff19-07d4-4eea-ad97-1da2757de903';

function query(q) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: q });
    const options = {
      hostname: 'api.expo.dev',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'expo-session': sessionSecret,
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve({ raw: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function checkBuild() {
  const res = await query(`query {
    builds {
      byId(buildId: "${BUILD_ID}") {
        id
        status
        appBuildVersion
        artifacts { buildUrl }
        error { message }
      }
    }
  }`);
  return res.data?.builds?.byId;
}

const startTime = Date.now();
console.log(`\n🚀 TradeCalc Pro Build #37 监控器启动`);
console.log(`Build ID: ${BUILD_ID}`);
console.log(`查看进度: https://expo.dev/accounts/alin369/projects/quote-calculator-pro/builds/${BUILD_ID}\n`);

async function poll() {
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const build = await checkBuild();

  if (!build) {
    console.log(`[${elapsed}s] ⚠️  无法获取构建状态`);
    return false;
  }

  const status = build.status;
  console.log(`[${elapsed}s] 状态: ${status} | Build #${build.appBuildVersion}`);

  if (status === 'FINISHED') {
    console.log(`\n✅ BUILD #37 构建完成！`);
    console.log(`📦 IPA URL: ${build.artifacts?.buildUrl}`);
    console.log(`\n🚀 开始自动提交审核...`);
    return 'DONE';
  }

  if (status === 'ERRORED' || status === 'CANCELLED') {
    console.log(`\n❌ 构建失败: ${status}`);
    if (build.error) console.log(`错误: ${build.error.message}`);
    return 'FAILED';
  }

  return false;
}

// Poll every 60 seconds
let result = false;
while (!result) {
  result = await poll();
  if (result === 'DONE') {
    // Auto-submit
    try {
      console.log('\n▶ 执行: eas submit --platform ios --latest --non-interactive');
      process.chdir('c:/Users/凌霄/WorkBuddy/20260422095526/quote-calculator-pro');
      const output = execSync('npx eas-cli@latest submit --platform ios --latest --non-interactive 2>&1', {
        encoding: 'utf8',
        timeout: 300000
      });
      console.log(output);
      console.log('\n🎉 提交成功！等待 Apple 审核...');
    } catch(e) {
      console.error('提交错误:', e.message);
      console.error(e.stdout);
    }
    break;
  }
  if (result === 'FAILED') break;
  if (!result) await new Promise(r => setTimeout(r, 60000)); // wait 60s
}
