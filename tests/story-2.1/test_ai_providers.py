"""
AI Provider API Key Validation Tests
Tests AI provider API keys against their endpoints.
"""
import asyncio
import os
import sys

# Add the backend app to the path
sys.path.append("../../services/backend")

from app.services.api_keys import APIKeyValidator

# Real AI API keys provided by the user
AI_API_KEYS = {
    "openai": os.getenv("OPENAI_API_KEY", "sk-test-openai-key-placeholder"),
    "gemini": os.getenv("GOOGLE_API_KEY", "test-gemini-key-placeholder"),
}


async def test_ai_provider_validation():
    """Test AI provider API key validation."""
    validator = APIKeyValidator()

    print("🤖 Testing AI Provider API Keys for Story 2.1\n")

    results = {}

    for provider, api_key in AI_API_KEYS.items():
        print(f"📡 Testing {provider.upper()} API key...")

        try:
            result = await validator.validate_key(provider_id=provider, api_key=api_key)

            results[provider] = result

            if result.is_valid:
                print(f"✅ {provider.upper()}: Valid")
                print(f"   ⏱️  Response time: {result.response_time_ms}ms")
                if result.rate_limit_remaining:
                    print(f"   📊 Rate limit remaining: {result.rate_limit_remaining}")
                if result.rate_limit_reset:
                    print(f"   🔄 Rate limit resets: {result.rate_limit_reset}")
            else:
                print(f"❌ {provider.upper()}: Invalid")
                print(f"   ❗ Error: {result.error_message}")

        except Exception as e:
            print(f"💥 {provider.upper()}: Exception during validation")
            print(f"   ❗ Error: {e}")

        print()

    return results


async def run_ai_tests():
    """Run AI provider tests and generate report."""
    try:
        results = await test_ai_provider_validation()

        # Generate summary
        valid_count = sum(1 for result in results.values() if result.is_valid)
        total_count = len(results)

        print("📊 AI Provider Validation Summary:")
        print("=" * 50)
        print(f"Total providers tested: {total_count}")
        print(f"Valid keys: {valid_count}")
        print(f"Invalid keys: {total_count - valid_count}")
        print(f"Success rate: {(valid_count/total_count)*100:.1f}%")

        print("\n🎯 Story 2.1 AI Integration Status:")
        for provider, result in results.items():
            status = "✅ READY" if result.is_valid else "❌ NEEDS ATTENTION"
            print(f"   {provider.upper()}: {status}")

        if valid_count == total_count:
            print("\n🎉 All AI providers are ready for Story 2.1 portfolio analysis!")
        else:
            print(f"\n⚠️  {total_count - valid_count} AI provider(s) need attention")

        return results

    except Exception as e:
        print(f"💥 AI provider tests failed: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(run_ai_tests())
