import { calendarResponse, calendarStaticParams } from "@/lib/calendar";

// The genshin calendar feeds, one per server (src/lib/calendar.ts), built ahead of time; others are 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return calendarStaticParams();
}

export async function GET(_request: Request, { params }: RouteContext<"/genshin/calendar/[file]">) {
  const { file } = await params;
  return calendarResponse("genshin", file);
}
