# Story 2.10: Implement Voice Control Integration

**Epic:** [Epic 2: Dashboard Core Functionality & Dynamic AG-UI Experience](../epic-2.md)

**Status:** To Do

**Priority:** Medium

**Estimated Effort:** 8 Story Points (2 weeks)

## User Story

**As a** trader or analyst
**I want** to control my dashboard and interact with charts using voice commands
**So that** I can maintain hands-free operation while multitasking, especially during active trading sessions or when reviewing multiple data streams simultaneously

## Description

Implement comprehensive voice control capabilities that allow users to navigate the dashboard, manipulate charts, query data, and execute commands through natural speech. This feature will support both desktop and mobile environments, with particular focus on noisy trading floor conditions and hands-free operation scenarios.

## Acceptance Criteria

1. **Voice Recognition & Processing**

   - [ ] Support natural language commands for chart manipulation
   - [ ] Recognize financial terminology and trading jargon
   - [ ] Handle background noise and multiple speaker environments
   - [ ] Support multiple languages (English, Spanish, French, German, Japanese)
   - [ ] Provide real-time speech-to-text feedback

2. **Dashboard Navigation Commands**

   - [ ] Voice navigation between dashboard sections ("Go to portfolio", "Show alerts")
   - [ ] Tab switching and workspace management ("Switch to technical analysis")
   - [ ] Layout manipulation ("Maximize chart", "Show sidebar")
   - [ ] Application-level commands ("Save workspace", "Export data")
   - [ ] Quick access to frequently used features

3. **Chart Interaction Commands**

   - [ ] Timeframe adjustment ("Change to 1 hour", "Show daily chart")
   - [ ] Symbol switching ("Show AAPL", "Load Tesla chart")
   - [ ] Indicator management ("Add RSI", "Remove moving average")
   - [ ] Zoom and pan controls ("Zoom in", "Pan to yesterday")
   - [ ] Drawing tool activation ("Draw trend line", "Add support level")

4. **Data Query Commands**

   - [ ] Price and volume queries ("What's Apple's current price?")
   - [ ] Performance questions ("How is my portfolio doing?")
   - [ ] Comparison requests ("Compare AAPL to MSFT")
   - [ ] Alert setup ("Alert me when AAPL hits 200")
   - [ ] Historical data requests ("Show last week's performance")

5. **Accessibility & Feedback**

   - [ ] Visual feedback for voice commands (microphone status, command recognition)
   - [ ] Audio confirmation for executed commands
   - [ ] Voice error handling and correction suggestions
   - [ ] Keyboard shortcuts fallback when voice fails
   - [ ] Customizable wake words and command phrases

6. **Performance & Reliability**
   - [ ] Sub-500ms command recognition and processing
   - [ ] Offline capability for core commands
   - [ ] Graceful degradation when voice services unavailable
   - [ ] Battery optimization for mobile devices
   - [ ] Privacy controls for voice data handling

## Technical Specifications

### Voice Control Architecture

```typescript
interface VoiceCommand {
  id: string;
  phrase: string;
  variations: string[];
  category: "navigation" | "chart" | "data" | "system";
  handler: string;
  parameters?: VoiceParameter[];
  confirmation?: boolean;
  accessibility?: boolean;
}

interface VoiceParameter {
  name: string;
  type: "symbol" | "timeframe" | "indicator" | "number" | "date";
  required: boolean;
  validation?: string;
  extraction?: string; // Regex or NLP pattern
}

interface VoiceSession {
  id: string;
  userId: string;
  startTime: number;
  isActive: boolean;
  currentContext?: DashboardContext;
  confidenceThreshold: number;
  customCommands?: VoiceCommand[];
  preferences: VoicePreferences;
}

interface VoicePreferences {
  language: string;
  wakeWord: string;
  confirmationLevel: "none" | "critical" | "all";
  noiseSuppressionLevel: number;
  voiceFeedback: boolean;
  privacyMode: boolean;
  ttsConfig: ChatterboxTTSConfig; // New: Chatterbox-specific configuration
}

interface ChatterboxTTSConfig {
  emotionLevel: number; // 0.0-1.0 for base emotion
  voiceModel: string; // Pre-trained voice identity
  adaptiveEmotion: boolean; // Auto-adjust based on market conditions
  watermarkAudio: boolean; // Enable Resemble AI watermarking
  preferredSpeed: number; // Default speaking rate
}
```

### Implementation Components

1. **Voice Processing Engine**

   - `src/services/voice/VoiceRecognitionService.ts` - Speech-to-text processing
   - `src/services/voice/CommandParser.ts` - Natural language understanding
   - `src/services/voice/VoiceCommandExecutor.ts` - Command execution logic
   - `src/services/voice/VoiceFeedbackService.ts` - **Enhanced with Chatterbox TTS**
   - `src/services/voice/ChatterboxIntegration.ts` - **New: Chatterbox TTS wrapper**

2. **Voice UI Components**

   - `src/components/voice/VoiceControlButton.tsx` - Microphone toggle and status
   - `src/components/voice/VoiceCommandOverlay.tsx` - Visual command feedback
   - `src/components/voice/VoiceSettingsPanel.tsx` - Voice preferences with TTS options
   - `src/components/voice/VoiceHelpModal.tsx` - Available commands guide

3. **Enhanced Command Definitions with Voice Feedback**

   ```typescript
   const chartCommands: VoiceCommand[] = [
     {
       id: "change-timeframe",
       phrase: "change to {timeframe}",
       variations: [
         "switch to {timeframe}",
         "show {timeframe} chart",
         "set timeframe to {timeframe}",
       ],
       category: "chart",
       handler: "changeTimeframe",
       parameters: [
         {
           name: "timeframe",
           type: "timeframe",
           required: true,
           validation: "^(1m|5m|15m|30m|1h|4h|1d|1w|1M)$",
         },
       ],
       confirmation: true, // Voice confirmation with Chatterbox
       voiceFeedback: {
         success: "Chart timeframe changed to {timeframe}",
         emotionLevel: 0.3, // Calm confirmation
         urgency: "low",
       },
     },
     {
       id: "price-alert",
       phrase: "alert me when {symbol} hits {price}",
       variations: [
         "notify me if {symbol} reaches {price}",
         "set alert for {symbol} at {price}",
       ],
       category: "data",
       handler: "createPriceAlert",
       parameters: [
         { name: "symbol", type: "symbol", required: true },
         { name: "price", type: "number", required: true },
       ],
       confirmation: true,
       voiceFeedback: {
         success: "Price alert set for {symbol} at ${price}",
         emotionLevel: 0.5, // Confident confirmation
         urgency: "medium",
       },
     },
   ];
   ```

4. **Chatterbox TTS Integration Service**

   ```typescript
   // Enhanced Chatterbox TTS Service for Voice Commands
   export class ChatterboxVoiceService {
     private ttsModel: ChatterboxTTS;
     private audioContext: AudioContext;

     async initialize(config: ChatterboxTTSConfig) {
       this.ttsModel = await ChatterboxTTS.from_pretrained({
         device: "cuda",
         watermark: config.watermarkAudio,
       });
       this.audioContext = new AudioContext();
     }

     async provideFeedback(
       message: string,
       context: VoiceCommandContext,
       urgency: "low" | "medium" | "high" = "low",
     ): Promise<void> {
       const emotionLevel = this.calculateCommandEmotion(context, urgency);

       const audioData = await this.ttsModel.generate(message, {
         emotion_level: emotionLevel,
         speaking_rate: this.getSpeedForUrgency(urgency),
         cfg_weight: urgency === "high" ? 0.3 : 0.5, // Faster for urgent messages
       });

       await this.playAudio(audioData);
     }

     private calculateCommandEmotion(
       context: VoiceCommandContext,
       urgency: string,
     ): number {
       let baseEmotion = 0.3; // Calm default for commands

       // Increase emotion for alerts and urgent situations
       if (context.commandType === "alert") baseEmotion += 0.4;
       if (urgency === "high") baseEmotion += 0.3;
       if (context.marketVolatility > 0.4) baseEmotion += 0.2;

       return Math.min(1.0, baseEmotion);
     }

     private getSpeedForUrgency(urgency: string): number {
       switch (urgency) {
         case "high":
           return 1.2; // Faster for urgent alerts
         case "medium":
           return 1.0; // Normal speed
         case "low":
           return 0.9; // Slightly slower for calm confirmations
         default:
           return 1.0;
       }
     }

     async playAudio(audioData: Float32Array): Promise<void> {
       const audioBuffer = this.audioContext.createBuffer(
         1,
         audioData.length,
         22050, // Chatterbox sample rate
       );

       audioBuffer.copyToChannel(audioData, 0);

       const source = this.audioContext.createBufferSource();
       source.buffer = audioBuffer;
       source.connect(this.audioContext.destination);
       source.start();
     }
   }
   ```

5. **Market-Aware Voice Responses**
   ```typescript
   // Context-aware voice feedback based on market conditions
   const marketAwareResponses = {
     priceAlert: {
       bullish: "Great news! {symbol} has reached your target of ${price}",
       bearish: "Alert: {symbol} has dropped to ${price}",
       volatile: "Attention: {symbol} hit ${price} amid high volatility",
     },
     portfolioUpdate: {
       positive: "Your portfolio is up {percentage}% today",
       negative: "Your portfolio is down {percentage}% today",
       neutral: "Your portfolio is relatively flat today",
     },
   };
   ```

## Dependencies

- Story 2.7: Dynamic AG-UI Widget Framework (Foundation)
- Story 2.8: Conversational Dashboard Interface (Integration)
- Web Speech API or cloud speech service (Azure/Google/AWS)
- **Chatterbox TTS (Resemble AI)** - SoTA open-source TTS with sub-200ms latency
- Natural language processing library
- Audio processing for noise cancellation
- Secure voice data handling infrastructure

## Testing Requirements

1. **Voice Recognition Tests**

   - Accuracy testing with financial terminology
   - Performance testing in noisy environments
   - Multi-accent and language support validation
   - Edge case handling (unclear speech, interruptions)

2. **Command Execution Tests**

   - End-to-end voice command workflows
   - Context switching and state management
   - Error handling and recovery scenarios
   - Integration with existing dashboard features

3. **Accessibility Tests**

   - Screen reader compatibility
   - Voice-only navigation completeness
   - Alternative input method fallbacks
   - Compliance with accessibility standards

4. **Performance Tests**
   - Voice processing latency and throughput
   - Battery usage on mobile devices
   - Memory usage during extended sessions
   - Network usage for cloud-based processing

## Mockups / UI Design

1. **Voice Control Interface**

   - Floating microphone button with status indicators
   - Visual waveform during active listening
   - Command recognition feedback overlay
   - Voice settings panel with customization options

2. **Visual Feedback System**

   - Real-time transcription display
   - Command confidence indicators
   - Success/error status animations
   - Context-aware command suggestions

3. **Help and Onboarding**
   - Interactive voice command tutorial
   - Context-sensitive help tooltips
   - Available commands reference card
   - Voice training and calibration flow

## Definition of Done

- [ ] Voice recognition accurately processes financial commands (>90% accuracy)
- [ ] Chart manipulation via voice commands functional
- [ ] Dashboard navigation through voice working
- [ ] Data queries return correct responses
- [ ] Noise cancellation effective in trading environments
- [ ] Multi-language support implemented and tested
- [ ] Accessibility compliance verified
- [ ] Performance benchmarks met (sub-500ms response)
- [ ] Privacy and security controls implemented
- [ ] Unit test coverage > 80%
- [ ] Integration tests passing with real voice input
- [ ] User documentation and tutorials complete
- [ ] Feature flag implemented for gradual rollout

## Security & Privacy Considerations

1. **Data Protection**

   - Voice data encryption in transit and at rest
   - Option for local-only processing
   - Automatic voice data deletion after processing
   - User consent for voice data usage

2. **Access Control**
   - Voice authentication for sensitive commands
   - Command authorization based on user permissions
   - Session management and timeout controls
   - Audit logging for voice-triggered actions

## Notes

- Prioritize core trading commands over advanced features initially
- Consider integration with existing accessibility tools
- Plan for future voice-based AI agent interactions
- Test extensively in real trading environments
- Ensure compliance with financial industry voice recording regulations
- Consider voice biometrics for enhanced security in future iterations

---

**Created:** 2024-01-XX
**Updated:** 2024-01-XX
**Version:** 1.0
