import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const IST = "Asia/Kolkata";

export function toIST(date: string | Date) {
  return dayjs(date).tz(IST);
}

export function nowIST() {
  return dayjs().tz(IST);
}