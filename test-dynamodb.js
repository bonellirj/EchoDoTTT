import { loadSystemPrompt } from './src/utils/loadPrompt.js';

/**
 * Test script to verify DynamoDB connection and prompt loading
 */
async function testDynamoDBConnection() {
  console.log('🧪 Testing DynamoDB connection and prompt loading...\n');
  
  try {
    console.log('📥 Loading system prompt from DynamoDB...');
    const prompt = await loadSystemPrompt();
    
    console.log('✅ Success! Prompt loaded successfully.');
    console.log(`📏 Prompt length: ${prompt.length} characters`);
    console.log('\n📄 First 200 characters of the prompt:');
    console.log('─'.repeat(50));
    console.log(prompt.substring(0, 200) + '...');
    console.log('─'.repeat(50));
    
    // Test cache functionality
    console.log('\n🔄 Testing cache functionality...');
    const startTime = Date.now();
    const cachedPrompt = await loadSystemPrompt();
    const endTime = Date.now();
    
    console.log(`⏱️  Cache test completed in ${endTime - startTime}ms`);
    console.log(`📏 Cached prompt length: ${cachedPrompt.length} characters`);
    console.log(`✅ Cache working: ${prompt === cachedPrompt ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('❌ Error loading prompt from DynamoDB:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check if the DynamoDB table "EchoDo-Prompt-Configuration" exists');
    console.error('2. Verify the item with prompt_id="text_to_task" exists');
    console.error('3. Ensure AWS credentials are properly configured');
    console.error('4. Check IAM permissions for DynamoDB access');
    console.error('5. Verify the AWS region matches between Lambda and DynamoDB');
    
    process.exit(1);
  }
}

// Run the test
testDynamoDBConnection(); 