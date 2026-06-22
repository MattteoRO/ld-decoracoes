import { isAuthenticated } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllReservations } from "@/lib/reservations";
import ReservationsClient from "./ReservationsClient";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  if (!(await isAuthenticated())) {
    redirect("/admin");
  }
  const reservations = await getAllReservations();
  return <ReservationsClient initialReservations={reservations} />;
}
