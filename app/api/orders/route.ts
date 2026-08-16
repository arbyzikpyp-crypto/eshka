import { NextResponse } from "next/server";
import { business } from "../../../data/business";
import { products } from "../../../data/menu";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.customer?.name?.trim() || !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(body?.customer?.phone) || !Array.isArray(body?.items) || !body.items.length) return NextResponse.json({ message: "Проверьте данные заказа." }, { status: 400 });
    if (body?.fulfillment?.type !== "pickup" && body?.fulfillment?.type !== "delivery") return NextResponse.json({ message: "Выберите способ получения." }, { status: 400 });
    if (body.fulfillment.type === "delivery" && (!business.delivery.enabled || !body.fulfillment.address?.street?.trim())) return NextResponse.json({ message: "Укажите улицу и дом для доставки." }, { status: 400 });
    const items = body.items.filter((item: { productId: string; quantity: number }) => products.some(p => p.id === item.productId && p.available) && Number.isInteger(Number(item.quantity)) && Number(item.quantity) > 0);
    if (!items.length) return NextResponse.json({ message: "В заказе нет доступных позиций." }, { status: 400 });
    const total = items.reduce((sum: number, item: { productId: string; quantity: number }) => sum + (products.find(p => p.id === item.productId)?.price ?? 0) * Number(item.quantity), 0);
    return NextResponse.json({ id: `E-${Date.now().toString().slice(-6)}`, total }, { status: 201 });
  } catch { return NextResponse.json({ message: "Не удалось обработать заказ." }, { status: 400 }); }
}
