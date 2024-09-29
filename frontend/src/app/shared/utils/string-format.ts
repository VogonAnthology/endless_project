export class StringFormat {
  static formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  static getDurationToString(
    time: number,
    milliseconds: boolean = false
  ): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const millis = milliseconds
      ? `.${Math.floor((time % 1) * 100)
          .toString()
          .padStart(2, '0')}`
      : '';
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}${millis}`;
  }

  static getDurationToNumber(time: string): number {
    const minutes = parseInt(time.substring(0, 2), 10);
    const seconds = parseInt(time.substring(2, 4), 10);
    const milliseconds = parseInt(time.substring(4, 6), 10);
    const totalSeconds = minutes * 60 + seconds + milliseconds / 100;
    return totalSeconds;
  }

  static getNumberSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return 'st';
    }
    if (j === 2 && k !== 12) {
      return 'nd';
    }
    if (j === 3 && k !== 13) {
      return 'rd';
    }
    return 'th';
  }

  static getTimeSinceString(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
      return interval + ' years ago';
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + ' months ago';
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + ' days ago';
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + ' hours ago';
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + ' minutes ago';
    }
    return Math.floor(seconds) + ' seconds ago';
  }
}
