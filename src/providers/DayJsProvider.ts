import dayjs from 'dayjs';

export class DayjsDateProvider {
  compareInSeconds(startDate: Date, endDate: Date): number {
    return dayjs(startDate).diff(endDate, 'seconds');
  }

  compareInHours(startDate: Date, endDate: Date): number {
    return dayjs(startDate).diff(endDate, 'hours');
  }

  dateNow(): Date {
    return dayjs().toDate();
  }

  compareInDays(startDate: Date, endDate: Date): number {
    return dayjs(startDate).diff(endDate, 'days');
  }

  addDays(days: number): Date {
    return dayjs().add(days, 'days').toDate();
  }

  addHours(hours: number): Date {
    return dayjs().add(hours, 'hour').toDate();
  }

  compareIfBefore(startDate: Date, endDate: Date): boolean {
    return dayjs(startDate).isBefore(endDate);
  }

  compareIfAfter(startDate: Date, endDate: Date): boolean {
    return dayjs(startDate).isAfter(endDate);
  }
}
