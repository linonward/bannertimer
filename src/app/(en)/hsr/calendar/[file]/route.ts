import { calendarResponse, calendarStaticParams } from "@/lib/calendar";

// The hsr calendar feeds, one per server (src/lib/calendar.ts), built ahead of time; others are 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return calendarStaticParams();
}

export async function GET(_request: Request, { params }: RouteContext<"/hsr/calendar/[file]">) {
  const { file } = await params;
  return calendarResponse("hsr", file);
}
