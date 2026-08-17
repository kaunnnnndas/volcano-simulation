// Simulation state management
export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  time: number;
  eruptionIntensity: number;
  eruptionStage: EruptionStage;
  simulationSpeed: number;
  windSpeed: number;
  windDirection: number;
  temperature: number;
  particleCount: number;
  soundEnabled: boolean;
  timeOfDay: 'day' | 'sunset' | 'night';
  fogDensity: number;
  qualityLevel: 'low' | 'medium' | 'high' | 'ultra';
  educationalMode: boolean;
}

export enum EruptionStage {
  DORMANT = 'Dormant',
  AWAKENING = 'Awakening',
  STROMBOLIAN = 'Strombolian',
  MAJOR = 'Major',
  PEAK = 'Peak',
  DECLINING = 'Declining'
}

export class SimulationManager {
  private state: SimulationState;
  private listeners: Map<string, Set<(state: SimulationState) => void>>;

  constructor() {
    this.state = {
      isRunning: false,
      isPaused: false,
      time: 0,
      eruptionIntensity: 0,
      eruptionStage: EruptionStage.DORMANT,
      simulationSpeed: 1,
      windSpeed: 5,
      windDirection: 0,
      temperature: 0,
      particleCount: 0,
      soundEnabled: true,
      timeOfDay: 'day',
      fogDensity: 0.5,
      qualityLevel: 'medium',
      educationalMode: false
    };
    this.listeners = new Map();
  }

  getState(): SimulationState {
    return { ...this.state };
  }

  setState(updates: Partial<SimulationState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  subscribe(event: string, callback: (state: SimulationState) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private notifyListeners(): void {
    for (const callbacks of this.listeners.values()) {
      callbacks.forEach(callback => callback(this.state));
    }
  }

  start(): void {
    this.setState({ isRunning: true, isPaused: false, time: 0 });
  }

  pause(): void {
    this.setState({ isPaused: true });
  }

  resume(): void {
    this.setState({ isPaused: false });
  }

  reset(): void {
    this.setState({
      isRunning: false,
      isPaused: false,
      time: 0,
      eruptionIntensity: 0,
      eruptionStage: EruptionStage.DORMANT,
      temperature: 0,
      particleCount: 0
    });
  }

  update(deltaTime: number): void {
    if (!this.state.isRunning || this.state.isPaused) return;

    const adjustedDelta = deltaTime * this.state.simulationSpeed;
    const newTime = this.state.time + adjustedDelta;

    let newIntensity = this.state.eruptionIntensity;
    let newStage = this.state.eruptionStage;
    let newTemperature = this.state.temperature;

    // Eruption progression based on time
    if (newTime < 2) {
      newStage = EruptionStage.DORMANT;
      newIntensity = 0;
      newTemperature = 300;
    } else if (newTime < 5) {
      newStage = EruptionStage.AWAKENING;
      const progress = (newTime - 2) / 3;
      newIntensity = progress * 30;
      newTemperature = 300 + progress * 400;
    } else if (newTime < 10) {
      newStage = EruptionStage.STROMBOLIAN;
      const progress = (newTime - 5) / 5;
      newIntensity = 30 + progress * 20;
      newTemperature = 700 + progress * 300;
    } else if (newTime < 20) {
      newStage = EruptionStage.MAJOR;
      const progress = (newTime - 10) / 10;
      newIntensity = 50 + progress * 30;
      newTemperature = 1000 + progress * 300;
    } else if (newTime < 30) {
      newStage = EruptionStage.PEAK;
      const progress = (newTime - 20) / 10;
      newIntensity = 80 + progress * 20;
      newTemperature = 1300;
    } else if (newTime < 45) {
      newStage = EruptionStage.DECLINING;
      const progress = (newTime - 30) / 15;
      newIntensity = Math.max(0, 100 - progress * 100);
      newTemperature = 1300 - progress * 1000;
    } else {
      newStage = EruptionStage.DORMANT;
      newIntensity = 0;
      newTemperature = 300;
    }

    this.setState({
      time: newTime,
      eruptionIntensity: Math.max(0, Math.min(100, newIntensity)),
      eruptionStage: newStage,
      temperature: Math.max(300, newTemperature)
    });
  }
}

export default SimulationManager;
