import { CONFIG } from './config';

export function generateTimeBlocks(): string[] {
  const blocks: string[] = [];
  const { START_HOUR, END_HOUR, TIME_BLOCK_MINUTES } = CONFIG;

  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += TIME_BLOCK_MINUTES) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      const endMinute = minute + TIME_BLOCK_MINUTES;
      const endHour = endMinute >= 60 ? hour + 1 : hour;
      const adjustedMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
      const endTime = `${endHour.toString().padStart(2, '0')}:${adjustedMinute
        .toString()
        .padStart(2, '0')}`;
      blocks.push(`${startTime}-${endTime}`);
    }
  }

  return blocks;
}

export function generateDates(startDate: Date, count: number): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);

  for (let i = 0; i < count; i++) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatTimeBlock(timeBlock: string): string {
  const [start] = timeBlock.split('-');
  const [hour, minute] = start.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = hourNum % 12 || 12;
  
  return `${hour12}:${minute} ${ampm}`;
}
