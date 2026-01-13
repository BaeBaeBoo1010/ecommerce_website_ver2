"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getFreshCartProducts } from "@/app/actions/cart";
import { Product } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Province {
  ProvinceID: number;
  ProvinceName: string;
}

interface District {
  DistrictID: number;
  DistrictName: string;
}

interface Ward {
  WardCode: string;
  WardName: string;
}

export default function CheckoutClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { items: cartItems, isLoaded: isCartLoaded } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Location State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null,
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null,
  );
  const [selectedWardCode, setSelectedWardCode] = useState<string | null>(null);

  const [openProvince, setOpenProvince] = useState(false);
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openWard, setOpenWard] = useState(false);

  const [shippingFee, setShippingFee] = useState<number>(0);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    note: "",
  });

  const productIds = useMemo(() => {
    const ids = searchParams.get("ids");
    return ids ? ids.split(",") : [];
  }, [searchParams]);

  // Map product details with correct quantity from context
  const checkoutItems = useMemo(() => {
    if (products.length === 0 || cartItems.length === 0) return [];

    return products.map((product) => {
      const cartItem = cartItems.find((ci) => ci.product.id === product.id);
      return {
        product,
        quantity: cartItem ? cartItem.quantity : 1, // Fallback to 1 if not in context
      };
    });
  }, [products, cartItems]);

  const totalPrice = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  }, [checkoutItems]);

  const totalOriginalPrice = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) =>
        sum +
        (item.product.originalPrice || item.product.price) * item.quantity,
      0,
    );
  }, [checkoutItems]);

  const totalSavings = useMemo(() => {
    return checkoutItems.reduce((sum, item) => {
      const originalPrice = item.product.originalPrice || item.product.price;
      const savings = Math.max(0, originalPrice - item.product.price);
      return sum + savings * item.quantity;
    }, 0);
  }, [checkoutItems]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      if (productIds.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const data = await getFreshCartProducts(productIds);
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch checkout products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [productIds]);

  const totalWithShipping = useMemo(() => {
    return totalPrice + shippingFee;
  }, [totalPrice, shippingFee]);

  // Fetch Provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch("/api/ghn/locations?type=provinces");
        const data = await response.json();
        if (Array.isArray(data)) {
          setProvinces(data);
        }
      } catch (error) {
        console.error("Failed to fetch provinces", error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch Districts when Province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedProvinceId) {
        setDistricts([]);
        return;
      }
      try {
        const response = await fetch(
          `/api/ghn/locations?type=districts&province_id=${selectedProvinceId}`,
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setDistricts(data);
        }
      } catch (error) {
        console.error("Failed to fetch districts", error);
        setDistricts([]);
      }
    };
    fetchDistricts();
  }, [selectedProvinceId]);

  // Fetch Wards when District changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedDistrictId) {
        setWards([]);
        return;
      }
      try {
        const response = await fetch(
          `/api/ghn/locations?type=wards&district_id=${selectedDistrictId}`,
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setWards(data);
        }
      } catch (error) {
        console.error("Failed to fetch wards", error);
        setWards([]);
      }
    };
    fetchWards();
  }, [selectedDistrictId]);

  // Calculate Shipping Fee
  useEffect(() => {
    const calculateFee = async () => {
      if (
        !selectedDistrictId ||
        !selectedWardCode ||
        checkoutItems.length === 0
      ) {
        setShippingFee(0);
        return;
      }

      setIsCalculatingFee(true);
      try {
        // Calculate total weight (assuming 1kg per item for now if not specified)
        // Ideally product should have weight field
        const totalWeight = checkoutItems.reduce(
          (acc, item) => acc + item.quantity * 700,
          0,
        ); // Grams

        const response = await fetch("/api/ghn/calculate-fee", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toDistrictId: selectedDistrictId,
            toWardCode: selectedWardCode,
            weight: totalWeight, // In grams
            insuranceValue: totalPrice, // Use total order value for insurance
          }),
        });

        const data = await response.json();

        if (response.ok && data.fee) {
          setShippingFee(data.fee);
        } else {
          console.error("Fee calculation failed:", data.error);
          setShippingFee(0);
        }
      } catch (error) {
        console.error("Failed to calculate shipping fee", error);
      } finally {
        setIsCalculatingFee(false);
      }
    };

    calculateFee(); // Debounce could be added here if needed
  }, [selectedDistrictId, selectedWardCode, checkoutItems, totalPrice]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    // Allow only numbers for phone number
    if (name === "phoneNumber" && value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.province || !formData.district || !formData.ward) {
      alert("Vui lòng chọn đầy đủ địa chỉ giao hàng");
      return;
    }
    console.log("Order Data:", {
      ...formData,
      items: checkoutItems,
      total: totalWithShipping,
      shippingFee,
      totalSavings,
    });
    alert(
      "Chức năng đặt hàng đang được phát triển! Xem console để kiểm tra dữ liệu.",
    );
  };

  if (loading || !isCartLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Không có sản phẩm nào để thanh toán
        </h1>
        <Button asChild onClick={() => router.push("/cart")}>
          <Link href="/cart">Quay lại giỏ hàng</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 text-lg font-bold text-gray-800">
                Thông tin giao hàng
              </h2>
              <form
                id="checkout-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Nhập họ tên của bạn"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      Số điện thoại <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="Nhập số điện thoại"
                      required
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Tùy chọn)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Nhập email để nhận thông báo đơn hàng"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col space-y-2">
                    <Label className="mb-2">
                      Tỉnh / Thành phố <span className="text-red-500">*</span>
                    </Label>
                    <Popover open={openProvince} onOpenChange={setOpenProvince}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openProvince}
                          className="w-full justify-between font-normal"
                        >
                          {formData.province
                            ? formData.province
                            : "Chọn Tỉnh / Thành phố..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Tìm tỉnh thành..." />
                          <CommandList>
                            <CommandEmpty>
                              Không tìm thấy tỉnh thành.
                            </CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                              {provinces.map((province) => (
                                <CommandItem
                                  key={province.ProvinceID}
                                  value={province.ProvinceName}
                                  onSelect={() => {
                                    setSelectedProvinceId(province.ProvinceID);
                                    setFormData((prev) => ({
                                      ...prev,
                                      province: province.ProvinceName,
                                      district: "",
                                      ward: "",
                                    }));
                                    setSelectedDistrictId(null);
                                    setSelectedWardCode(null);
                                    setOpenProvince(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedProvinceId === province.ProvinceID
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {province.ProvinceName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label className="mb-2">
                      Quận / Huyện <span className="text-red-500">*</span>
                    </Label>
                    <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openDistrict}
                          className="w-full justify-between font-normal"
                          disabled={!selectedProvinceId}
                        >
                          {formData.district
                            ? formData.district
                            : "Chọn Quận / Huyện..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Tìm quận huyện..." />
                          <CommandList>
                            <CommandEmpty>
                              Không tìm thấy quận huyện.
                            </CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                              {districts.map((district) => (
                                <CommandItem
                                  key={district.DistrictID}
                                  value={district.DistrictName}
                                  onSelect={() => {
                                    setSelectedDistrictId(district.DistrictID);
                                    setFormData((prev) => ({
                                      ...prev,
                                      district: district.DistrictName,
                                      ward: "",
                                    }));
                                    setSelectedWardCode(null);
                                    setOpenDistrict(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedDistrictId === district.DistrictID
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {district.DistrictName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label className="mb-2">
                      Phường / Xã <span className="text-red-500">*</span>
                    </Label>
                    <Popover open={openWard} onOpenChange={setOpenWard}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openWard}
                          className="w-full justify-between font-normal"
                          disabled={!selectedDistrictId}
                        >
                          {formData.ward
                            ? formData.ward
                            : "Chọn Phường / Xã..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Tìm phường xã..." />
                          <CommandList>
                            <CommandEmpty>
                              Không tìm thấy phường xã.
                            </CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                              {wards.map((ward) => (
                                <CommandItem
                                  key={ward.WardCode}
                                  value={ward.WardName}
                                  onSelect={() => {
                                    setSelectedWardCode(ward.WardCode);
                                    setFormData((prev) => ({
                                      ...prev,
                                      ward: ward.WardName,
                                    }));
                                    setOpenWard(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedWardCode === ward.WardCode
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {ward.WardName}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Số nhà, tên đường, khu dân cư..."
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú đơn hàng (Tùy chọn)</Label>
                  <Textarea
                    id="note"
                    name="note"
                    placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
                    value={formData.note}
                    onChange={handleInputChange}
                    className="resize-none"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800">
                Đơn hàng của bạn
              </h2>

              {/* Product List */}
              <div className="custom-scrollbar max-h-[400px] space-y-4 overflow-y-auto pr-2">
                {checkoutItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-100">
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between gap-2">
                        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-sm font-semibold text-[#EE4D2D]">
                            {product.price.toLocaleString("vi-VN")} ₫
                          </p>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <p className="text-xs text-gray-500 line-through">
                                {product.originalPrice.toLocaleString("vi-VN")}{" "}
                                ₫
                              </p>
                            )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Số lượng:{" "}
                        <span className="font-medium text-gray-900">
                          {quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gray-100" />

              <div className="space-y-2">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Tổng tiền hàng</span>
                  <span className="text-sm font-medium text-gray-500">
                    {totalOriginalPrice.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">
                    Tổng tiền phí vận chuyển
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    {isCalculatingFee ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : shippingFee > 0 ? (
                      `${shippingFee.toLocaleString("vi-VN")} ₫`
                    ) : (
                      "Tính sau khi chọn địa chỉ"
                    )}
                  </span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Tổng giảm giá sản phẩm</span>
                    <span>-{totalSavings.toLocaleString("vi-VN")} ₫</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-lg font-bold">
                  <span>Thành tiền</span>
                  <span className="text-[#EE4D2D]">
                    {totalWithShipping.toLocaleString("vi-VN")} ₫
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                form="checkout-form"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 py-6 text-lg font-bold shadow-md hover:from-blue-700 hover:to-indigo-600"
              >
                Đặt hàng
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
