export class BrowserNotifier {
  get isSupported(): boolean {
    return typeof Notification !== 'undefined'
  }

  get permission(): NotificationPermission | 'unsupported' {
    return this.isSupported ? Notification.permission : 'unsupported'
  }

  async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    return this.isSupported ? Notification.requestPermission() : 'unsupported'
  }

  async notify(title: string, body: string): Promise<void> {
    if (!this.isSupported || Notification.permission !== 'granted') return
    var options: NotificationOptions = { body, icon: '/icon.svg', dir: 'rtl', lang: 'fa' }
    var registration = await navigator.serviceWorker?.getRegistration()
    if (registration) await registration.showNotification(title, options)
    else new Notification(title, options)
  }
}
