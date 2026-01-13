export const GHN_API_TOKEN = process.env.GHN_API_TOKEN!;
export const GHN_SHOP_ID = process.env.GHN_SHOP_ID
  ? parseInt(process.env.GHN_SHOP_ID)
  : undefined;
export const GHN_FROM_DISTRICT_ID = process.env.GHN_FROM_DISTRICT_ID
  ? parseInt(process.env.GHN_FROM_DISTRICT_ID)
  : undefined;

const GHN_API_URL = "https://online-gateway.ghn.vn/shiip/public-api";

interface GHNResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface Province {
  ProvinceID: number;
  ProvinceName: string;
  Code: string;
}

export interface District {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code: string;
}

export interface Ward {
  WardCode: string;
  DistrictID: number;
  WardName: string;
}

export interface Service {
  service_id: number;
  short_name: string;
  service_type_id: number;
}

export interface FeeResult {
  total: number;
  service_fee: number;
  insurance_fee: number;
  pick_station_fee: number;
  coupon_value: number;
  r2s_fee: number;
}

async function ghnFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    Token: GHN_API_TOKEN || "",
    ...(options.headers || {}),
  };

  if (GHN_SHOP_ID) {
    // @ts-ignore
    headers["ShopId"] = GHN_SHOP_ID.toString();
  }

  const res = await fetch(`${GHN_API_URL}${endpoint}`, {
    ...options,
    headers,
    next: { revalidate: 3600 }, // Cache master data for 1 hour by default
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `GHN API Error: ${res.status} ${res.statusText} - ${errorBody}`,
    );
  }

  const json: GHNResponse<T> = await res.json();

  if (json.code !== 200) {
    throw new Error(`GHN API Error: ${json.message}`);
  }

  return json.data;
}

export async function getProvinces() {
  return ghnFetch<Province[]>("/master-data/province");
}

export async function getDistricts(provinceId: number) {
  return ghnFetch<District[]>("/master-data/district", {
    method: "POST",
    body: JSON.stringify({ province_id: provinceId }),
  });
}

export async function getWards(districtId: number) {
  return ghnFetch<Ward[]>("/master-data/ward", {
    method: "POST",
    body: JSON.stringify({ district_id: districtId }),
  });
}

export async function getAvailableServices(toDistrictId: number) {
  if (!GHN_FROM_DISTRICT_ID) {
    throw new Error("GHN_FROM_DISTRICT_ID is not configured");
  }
  return ghnFetch<Service[]>("/v2/shipping-order/available-services", {
    method: "POST",
    body: JSON.stringify({
      shop_id: GHN_SHOP_ID,
      from_district: GHN_FROM_DISTRICT_ID,
      to_district: toDistrictId,
    }),
    cache: "no-store",
  });
}

export async function calculateShippingFee({
  serviceId,
  toDistrictId,
  toWardCode,
  weight,
  insuranceValue,
}: {
  serviceId: number;
  toDistrictId: number;
  toWardCode: string;
  weight: number;
  insuranceValue: number;
}) {
  if (!GHN_FROM_DISTRICT_ID) {
    throw new Error("GHN_FROM_DISTRICT_ID is not configured");
  }

  return ghnFetch<FeeResult>("/v2/shipping-order/fee", {
    method: "POST",
    body: JSON.stringify({
      from_district_id: GHN_FROM_DISTRICT_ID,
      service_id: serviceId,
      to_district_id: toDistrictId,
      to_ward_code: toWardCode,
      weight: weight,
      insurance_value: insuranceValue,
      coupon: null,
    }),
    cache: "no-store",
  });
}
