import { NextResponse } from "next/server";
import { getProvinces, getDistricts, getWards } from "@/lib/ghn";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "provinces") {
      const data = await getProvinces();
      return NextResponse.json(data);
    }

    if (type === "districts") {
      const provinceId = searchParams.get("province_id");
      if (!provinceId)
        return NextResponse.json(
          { error: "Missing province_id" },
          { status: 400 },
        );
      const data = await getDistricts(parseInt(provinceId));
      return NextResponse.json(data);
    }

    if (type === "wards") {
      const districtId = searchParams.get("district_id");
      if (!districtId)
        return NextResponse.json(
          { error: "Missing district_id" },
          { status: 400 },
        );
      const data = await getWards(parseInt(districtId));
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    console.error("GHN API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
