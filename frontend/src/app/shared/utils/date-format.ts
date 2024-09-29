export class DateFormat {
  static getNextWeekdayDate(weekday: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + ((7 + weekday - date.getDay()) % 7));
    return date;
  }
}
