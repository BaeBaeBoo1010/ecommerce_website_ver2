import { NextResponse } from "next/server";
import { calculateShippingFee, getAvailableServices } from "@/lib/ghn";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { toDistrictId, toWardCode, weight, insuranceValue } = body;

    if (!toDistrictId || !toWardCode || !weight) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Get available services
    // Standard ID usually 53320 or 53321 depending on region, but better to fetch
    const services = await getAvailableServices(toDistrictId);

    if (!services || services.length === 0) {
      return NextResponse.json(
        { error: "No shipping services available" },
        { status: 404 },
      );
    }

    // Prefer "Chuẩn" (Standard) or the first one available
    // Common service_type_id for standard is 2
    const service =
      services.find((s) => s.service_type_id === 2) || services[0];

    // 2. Calculate fee
    const feeResult = await calculateShippingFee({
      serviceId: service.service_id,
      toDistrictId,
      toWardCode,
      weight,
      insuranceValue: insuranceValue || 0,
    });

    return NextResponse.json({
      fee: feeResult.total,
      serviceName: service.short_name,
      messages: "Success",
    });
  } catch (error: any) {
    console.error("Calculate Fee Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
