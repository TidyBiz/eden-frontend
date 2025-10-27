"use client"
import RoleRedirect from "../role-redirect";
import DeliveryOrderList from "@/components/cashier/delivery/DeliveryOrderList";

export default function CashierPage() {
  return (
    <RoleRedirect>
      <DeliveryOrderList />
    </RoleRedirect>
  );
}
