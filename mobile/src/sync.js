/**
 * Coyote Mobile Sync Client for OnePlus Android
 * Connects to Mac host over Wi-Fi / Hotspot on port 3335
 */

export class SyncClient {
  constructor(hostIp = '192.168.1.100', port = 3335, deviceId = 'oneplus-client') {
    this.hostIp = hostIp;
    this.port = port;
    this.deviceId = deviceId;
  }

  getBaseUrl() {
    return `http://${this.hostIp}:${this.port}/api`;
  }

  async checkHostHealth() {
    const res = await fetch(`${this.getBaseUrl()}/health`, { timeout: 3000 });
    if (!res.ok) throw new Error(`Host returned status ${res.status}`);
    return res.json();
  }

  async pullUpdates(since = null) {
    const url = since 
      ? `${this.getBaseUrl()}/sync/pull?since=${encodeURIComponent(since)}`
      : `${this.getBaseUrl()}/sync/pull`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to pull updates from Mac');
    return res.json();
  }

  async pushUpdates(tasks = [], notes = []) {
    const res = await fetch(`${this.getBaseUrl()}/sync/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: this.deviceId,
        tasks,
        notes
      })
    });
    if (!res.ok) throw new Error('Failed to push updates to Mac');
    return res.json();
  }
}
