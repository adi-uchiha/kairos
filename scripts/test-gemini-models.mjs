#!/usr/bin/env node
/**
 * Gemini Model Discovery Script
 * Tests which Gemini models work with the given API key.
 * Run: node scripts/test-gemini-models.mjs
 */

const API_KEY = process.env.GEMINI_KEY_1 || process.env.GEMINI_API_KEY || '';
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Candidate model names to test — from newest to oldest
const MODELS_TO_TEST = [
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview',
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

const REQUEST_BODY = JSON.stringify({
  contents: [{ role: 'user', parts: [{ text: 'Say "OK" and nothing else.' }] }],
  generationConfig: { maxOutputTokens: 5, temperature: 0 },
});

async function listAvailableModels() {
  console.log('\n── Available Models from API ──────────────────────');
  try {
    const res = await fetch(`${BASE}/models?key=${API_KEY}&pageSize=50`);
    const json = await res.json();
    if (json.models) {
      json.models
        .filter((m) => m.name.includes('gemini'))
        .forEach((m) => console.log(`  ${m.name}  —  ${m.displayName ?? ''}`));
    } else {
      console.log('  (could not list models)', JSON.stringify(json).slice(0, 200));
    }
  } catch (e) {
    console.error('  Error listing models:', e.message);
  }
  console.log('────────────────────────────────────────────────\n');
}

async function testModel(modelName) {
  const url = `${BASE}/models/${modelName}:generateContent?key=${API_KEY}`;
  try {
    const start = Date.now();
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: REQUEST_BODY,
    });

    const elapsed = Date.now() - start;
    const body = await res.json();

    if (res.status === 200) {
      const text = body?.candidates?.[0]?.content?.parts?.[0]?.text ?? '(no text)';
      console.log(`  ✅ ${modelName.padEnd(40)} ${res.status}  ${elapsed}ms  → "${text.trim()}"`);
      return true;
    } else if (res.status === 429) {
      const msg = body?.error?.message ?? '';
      const limit = msg.match(/limit: (\d+)/)?.[1] ?? '?';
      console.log(
        `  ⚠️  ${modelName.padEnd(40)} 429  limit=${limit}  (rate limited or free-tier limit=0)`
      );
      return false;
    } else if (res.status === 404) {
      console.log(`  ❌ ${modelName.padEnd(40)} 404  (model not found)`);
      return false;
    } else {
      const msg = body?.error?.message?.slice(0, 80) ?? `HTTP ${res.status}`;
      console.log(`  ❌ ${modelName.padEnd(40)} ${res.status}  ${msg}`);
      return false;
    }
  } catch (e) {
    console.log(`  💥 ${modelName.padEnd(40)} EXCEPTION  ${e.message}`);
    return false;
  }
}

async function testStreamModel(modelName) {
  const url = `${BASE}/models/${modelName}:streamGenerateContent?alt=sse&key=${API_KEY}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: REQUEST_BODY,
    });

    if (res.status === 200) {
      // Read just the first chunk
      const reader = res.body.getReader();
      const { value } = await reader.read();
      reader.cancel();
      const text = new TextDecoder().decode(value);
      console.log(
        `  🌊 ${modelName.padEnd(40)} STREAM OK  first chunk: ${text.slice(0, 60).replace(/\n/g, '\\n')}`
      );
      return true;
    } else {
      const body = await res.text();
      const limit = body.match(/limit: (\d+)/)?.[1] ?? '?';
      console.log(`  🌊 ${modelName.padEnd(40)} STREAM ${res.status}  limit=${limit}`);
      return false;
    }
  } catch (e) {
    console.log(`  🌊 ${modelName.padEnd(40)} STREAM EXCEPTION  ${e.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n🔍 Testing Gemini API with key: ${API_KEY.slice(0, 12)}...`);

  await listAvailableModels();

  console.log('── generateContent test ──────────────────────────');
  const working = [];
  for (const model of MODELS_TO_TEST) {
    const ok = await testModel(model);
    if (ok) working.push(model);
  }

  console.log('\n── streamGenerateContent test (for working models) ──');
  const workingStream = [];
  for (const model of working.length > 0 ? working : MODELS_TO_TEST.slice(0, 5)) {
    const ok = await testStreamModel(model);
    if (ok) workingStream.push(model);
  }

  console.log('\n── SUMMARY ───────────────────────────────────────────');
  if (workingStream.length > 0) {
    console.log('✅ Working streaming models:');
    workingStream.forEach((m) => console.log(`   → ${m}`));
    console.log(`\n💡 Recommended: ${workingStream[0]}`);
  } else if (working.length > 0) {
    console.log('✅ Working non-streaming models:');
    working.forEach((m) => console.log(`   → ${m}`));
    console.log('\n⚠️  Streaming not working. This key may need billing enabled.');
  } else {
    console.log('❌ No working models found with this key.');
    console.log('   This likely means the free-tier quota is exhausted (limit: 0).');
    console.log('   Solutions:');
    console.log('   1. Enable billing on the Google Cloud project');
    console.log('   2. Wait until the daily quota resets (midnight PST)');
    console.log('   3. Use a key from a different Google account');
  }
  console.log('──────────────────────────────────────────────────\n');
}

main().catch(console.error);
