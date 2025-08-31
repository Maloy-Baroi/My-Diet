import moment from 'moment';

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return moment(date).format(format);
};

export const formatDateDisplay = (date: string | Date): string => {
  return moment(date).format('MMM DD, YYYY');
};

export const formatTime = (date: string | Date): string => {
  return moment(date).format('HH:mm');
};

export const formatDateTime = (date: string | Date): string => {
  return moment(date).format('MMM DD, YYYY HH:mm');
};

export const getRelativeTime = (date: string | Date): string => {
  return moment(date).fromNow();
};

export const isToday = (date: string | Date): boolean => {
  return moment(date).isSame(moment(), 'day');
};

export const isYesterday = (date: string | Date): boolean => {
  return moment(date).isSame(moment().subtract(1, 'day'), 'day');
};

export const getDaysInWeek = (startOfWeek?: Date): Date[] => {
  const start = startOfWeek ? moment(startOfWeek) : moment().startOf('week');
  const days: Date[] = [];
  
  for (let i = 0; i < 7; i++) {
    days.push(start.clone().add(i, 'day').toDate());
  }
  
  return days;
};

export const getDaysInMonth = (date?: Date): Date[] => {
  const start = date ? moment(date) : moment();
  const daysInMonth = start.daysInMonth();
  const days: Date[] = [];
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(start.clone().date(i).toDate());
  }
  
  return days;
};

export const getWeekNumber = (date?: Date): number => {
  return moment(date).week();
};

export const addDays = (date: Date, days: number): Date => {
  return moment(date).add(days, 'days').toDate();
};

export const subtractDays = (date: Date, days: number): Date => {
  return moment(date).subtract(days, 'days').toDate();
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return moment(date1).isSame(moment(date2), 'day');
};

export const isBefore = (date1: Date, date2: Date): boolean => {
  return moment(date1).isBefore(moment(date2));
};

export const isAfter = (date1: Date, date2: Date): boolean => {
  return moment(date1).isAfter(moment(date2));
};

export const getAge = (birthDate: string | Date): number => {
  return moment().diff(moment(birthDate), 'years');
};
