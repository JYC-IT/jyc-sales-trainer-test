/**
 * Voice Provider Interface (IVoiceProvider)
 * Decouples speech synthesis and conversational AI agents from specific third-party providers (ElevenLabs, OpenAI Realtime, WebRTC, Mocks).
 */

export interface VoiceSessionConfig {
  agentId?: string;
  signedUrl?: string;
  language: 'es' | 'en';
  firstMessage?: string;
  voiceId?: string;
  dynamicVariables?: Record<string, any>;
  clientTools?: Record<string, (...args: any[]) => any>;
}

export interface VoiceProviderEvents {
  onConnect?: (data: { conversationId?: string }) => void;
  onDisconnect?: () => void;
  onMessage?: (message: { role: 'user' | 'agent'; text: string }) => void;
  onError?: (error: Error | any) => void;
  onModeChange?: (mode: { mode: 'speaking' | 'listening' }) => void;
  onStatusChange?: (status: 'disconnected' | 'connecting' | 'connected') => void;
}

export interface IVoiceProvider {
  readonly id: string;
  readonly name: string;
  
  /**
   * Initializes or binds listener callbacks
   */
  setCallbacks(events: VoiceSessionConfig & VoiceProviderEvents): void;

  /**
   * Connects to the voice provider and begins real-time audio streaming
   */
  startSession(config: VoiceSessionConfig): Promise<void>;

  /**
   * Gracefully hangs up or ends the live session
   */
  endSession(): Promise<void>;

  /**
   * Adjusts AI output playback volume (0 to 1)
   */
  setVolume(options: { volume: number }): void;

  /**
   * Checks if session is active
   */
  isConnected(): boolean;
}

/**
 * Mock Voice Provider for automated tests, offline training, or simulated browser runs.
 */
export class MockVoiceProvider implements IVoiceProvider {
  readonly id = 'mock';
  readonly name = 'Simulador Local de Prueba';
  private connected = false;
  private events: VoiceProviderEvents = {};
  private mockInterval: any = null;

  setCallbacks(events: VoiceProviderEvents) {
    this.events = events;
  }

  async startSession(config: VoiceSessionConfig): Promise<void> {
    this.connected = true;
    this.events.onStatusChange?.('connecting');
    await new Promise(r => setTimeout(r, 600));
    this.events.onStatusChange?.('connected');
    this.events.onConnect?.({ conversationId: 'mock_conv_' + Date.now() });

    if (config.firstMessage) {
      setTimeout(() => {
        this.events.onMessage?.({ role: 'agent', text: config.firstMessage! });
      }, 400);
    }
  }

  async endSession(): Promise<void> {
    this.connected = false;
    if (this.mockInterval) clearInterval(this.mockInterval);
    this.events.onStatusChange?.('disconnected');
    this.events.onDisconnect?.();
  }

  setVolume(_options: { volume: number }): void {
    // No-op for mock
  }

  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Adapter wrapper that exposes ElevenLabs conversation hook through the IVoiceProvider contract.
 */
export class ElevenLabsVoiceProviderAdapter implements IVoiceProvider {
  readonly id = 'elevenlabs';
  readonly name = 'ElevenLabs Conversational AI';
  private conversationInstance: any;

  constructor(conversationInstance: any) {
    this.conversationInstance = conversationInstance;
  }

  setCallbacks(_events: VoiceProviderEvents): void {
    // Callbacks are mapped directly to useConversation hook options
  }

  async startSession(config: VoiceSessionConfig): Promise<void> {
    if (!this.conversationInstance?.startSession) {
      throw new Error("ElevenLabs conversation instance not available.");
    }
    await this.conversationInstance.startSession(config);
  }

  async endSession(): Promise<void> {
    if (this.conversationInstance?.endSession) {
      await this.conversationInstance.endSession();
    }
  }

  setVolume(options: { volume: number }): void {
    try {
      this.conversationInstance?.setVolume?.(options);
    } catch {}
  }

  isConnected(): boolean {
    return this.conversationInstance?.status === 'connected';
  }
}
