export class UIController {
  private state: any;
  private simulationManager: any;

  constructor(simulationManager: any) {
    this.simulationManager = simulationManager;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Control buttons
    document.getElementById('startBtn')?.addEventListener('click', () => {
      this.simulationManager.start();
    });

    document.getElementById('pauseBtn')?.addEventListener('click', () => {
      this.simulationManager.pause();
    });

    document.getElementById('resumeBtn')?.addEventListener('click', () => {
      this.simulationManager.resume();
    });

    document.getElementById('resetBtn')?.addEventListener('click', () => {
      this.simulationManager.reset();
    });

    // Sliders
    document.getElementById('intensitySlider')?.addEventListener('input', (e: any) => {
      const value = parseInt(e.target.value);
      this.simulationManager.setState({ eruptionIntensity: value });
      document.getElementById('intensityValue')!.textContent = value + '%';
    });

    document.getElementById('speedSelect')?.addEventListener('change', (e: any) => {
      this.simulationManager.setState({ simulationSpeed: parseFloat(e.target.value) });
    });

    document.getElementById('windSpeedSlider')?.addEventListener('input', (e: any) => {
      const value = parseInt(e.target.value);
      this.simulationManager.setState({ windSpeed: value });
      document.getElementById('windSpeedValue')!.textContent = value.toString();
    });

    document.getElementById('windDirSlider')?.addEventListener('input', (e: any) => {
      const value = parseInt(e.target.value);
      this.simulationManager.setState({ windDirection: value });
      document.getElementById('windDirValue')!.textContent = value + '°';
    });

    document.getElementById('fogSlider')?.addEventListener('input', (e: any) => {
      const value = parseFloat(e.target.value);
      this.simulationManager.setState({ fogDensity: value });
      document.getElementById('fogValue')!.textContent = value.toFixed(1);
    });

    document.getElementById('timeOfDay')?.addEventListener('change', (e: any) => {
      this.simulationManager.setState({ timeOfDay: e.target.value });
    });

    document.getElementById('cameraMode')?.addEventListener('change', (e: any) => {
      if ((window as any).cameraController) {
        (window as any).cameraController.setMode(e.target.value);
      }
    });

    document.getElementById('cinematicPlayBtn')?.addEventListener('click', () => {
      if ((window as any).cameraController) {
        (window as any).cameraController.playCinematic();
      }
    });

    document.getElementById('educationalToggle')?.addEventListener('click', () => {
      const panel = document.getElementById('educationalPanel');
      panel?.classList.toggle('active');
    });

    document.getElementById('volumeToggle')?.addEventListener('click', (e: any) => {
      const btn = e.target as HTMLButtonElement;
      const audioManager = (window as any).audioManager;
      if (audioManager) {
        const newState = !audioManager.isEnabled();
        audioManager.setEnabled(newState);
        btn.textContent = newState ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      }
    });

    document.getElementById('qualityPreset')?.addEventListener('change', (e: any) => {
      this.simulationManager.setState({ qualityLevel: e.target.value });
    });
  }

  updateInfoPanel(state: any): void {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}m ${secs}s`;
    };

    document.getElementById('simTime')!.textContent = formatTime(state.time);
    document.getElementById('eruptionStage')!.textContent = state.eruptionStage;
    document.getElementById('intensity')!.textContent = Math.round(state.eruptionIntensity) + '%';
    document.getElementById('temperature')!.textContent = Math.round(state.temperature) + '°C';
    document.getElementById('particleCount')!.textContent = state.particleCount?.toString() || '0';

    const indicator = document.getElementById('statusIndicator');
    if (state.isRunning) {
      indicator?.classList.add('active');
      document.getElementById('status')!.textContent = state.isPaused ? 'Paused' : 'Running';
    } else {
      indicator?.classList.remove('active');
      document.getElementById('status')!.textContent = 'Ready';
    }
  }

  updateFPS(fps: number): void {
    document.getElementById('fps')!.textContent = Math.round(fps).toString();
  }
}

export default UIController;