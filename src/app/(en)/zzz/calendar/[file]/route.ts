import { calendarResponse, calendarStaticParams } from "@/lib/calendar";

// The zzz calendar feeds, one per server (src/lib/calendar.ts), built ahead of time; others are 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return calendarStaticParams();
}

export async function GET(_request: Request, { params }: RouteContext<"/zzz/calendar/[file]">) {
  const { file } = await params;
  return calendarResponse("zzz", file);
}
