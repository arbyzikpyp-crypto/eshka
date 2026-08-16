"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { business } from "../data/business";
import { products } from "../data/menu";

const money = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11), x = d.slice(1);
  return `+7${x.length ? " (" + x.slice(0, 3) : ""}${x.length >= 3 ? ") " : ""}${x.length > 3 ? x.slice(3, 6) : ""}${x.length >= 6 ? "-" + x.slice(6, 8) : ""}${x.length >= 8 ? "-" + x.slice(8, 10) : ""}`;
};

type Delivery = { street: string; apartment: string; entrance: string; floor: string; intercom: string };

export function Checkout() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState<Delivery>({ street: "", apartment: "", entrance: "", floor: "", intercom: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => { const stored = localStorage.getItem("eshka-cart"); if (stored) setCart(JSON.parse(stored)); }, []);
  const entries = useMemo(() => products.filter(p => cart[p.id]).map(p => ({ p, q: cart[p.id] })), [cart]);
  const total = entries.reduce((sum, item) => sum + item.p.price * item.q, 0);
  const update = (key: keyof Delivery, value: string) => setAddress(current => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!name.trim() || !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(phone)) { setError("Укажите имя и телефон в формате +7 (999) 123-45-67."); return; }
    if (fulfillment === "delivery" && !address.street.trim()) { setError("Укажите улицу и дом для доставки."); return; }
    if (!entries.length) { setError("Корзина пуста."); return; }
    setLoading(true);
    try {
      if (isDemo) { localStorage.removeItem("eshka-cart"); setSuccess("demo"); return; }
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer: { name, phone }, fulfillment: fulfillment === "pickup" ? { type: "pickup" } : { type: "delivery", address }, items: entries.map(item => ({ productId: item.p.id, quantity: item.q })), comment }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      localStorage.removeItem("eshka-cart"); setSuccess(data.id);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Не удалось отправить заказ."); }
    finally { setLoading(false); }
  }

  if (success) return <main className="success"><p className="eyebrow">Ешь!ка</p><h1>{isDemo ? "Демо-заказ оформлен" : "Заказ принят"}</h1><p>{isDemo ? "Это демонстрационная версия сайта. Реальная отправка заказа будет подключена после запуска." : "Мы получили вашу заявку."}</p>{!isDemo && <p className="order-id">Номер заказа: {success}</p>}<div className="actions"><Link className="primary" href="/">Вернуться в меню</Link><a className="secondary" href={`tel:${business.phoneHref}`}>Позвонить в кафе</a></div></main>;

  return <main className="checkout-page"><Link className="back" href="/">← Вернуться в меню</Link><div className="checkout-grid"><form onSubmit={submit}><p className="eyebrow">Оформление</p><h1>Ваш заказ</h1><label>Имя<input value={name} onChange={event => setName(event.target.value)} autoComplete="name" required /></label><label>Телефон<input type="tel" inputMode="tel" value={phone} onChange={event => setPhone(formatPhone(event.target.value))} placeholder="+7 (999) 123-45-67" autoComplete="tel" required /></label><fieldset className="fulfillment"><legend>Способ получения</legend><div>{(["pickup", "delivery"] as const).map(type => <button type="button" key={type} className={fulfillment === type ? "selected" : ""} onClick={() => setFulfillment(type)}>{type === "pickup" ? "Самовывоз" : "Доставка"}</button>)}</div></fieldset>{fulfillment === "pickup" ? <p className="pickup"><b>Ешь!ка</b><br />{business.address}</p> : <div className="delivery-fields"><p className="delivery-note">Стоимость и возможность доставки уточняются при оформлении заказа.</p><label>Улица и дом *<input value={address.street} onChange={event => update("street", event.target.value)} required /></label><div className="address-grid"><label>Квартира / офис<input value={address.apartment} onChange={event => update("apartment", event.target.value)} /></label><label>Подъезд<input value={address.entrance} onChange={event => update("entrance", event.target.value)} /></label><label>Этаж<input value={address.floor} onChange={event => update("floor", event.target.value)} /></label><label>Домофон<input value={address.intercom} onChange={event => update("intercom", event.target.value)} /></label></div></div>}<label>Комментарий к заказу<textarea value={comment} onChange={event => setComment(event.target.value)} placeholder="Например: без лука" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary submit" disabled={loading || !entries.length}>{loading ? "Отправляем…" : "Оформить заказ"}</button></form><aside className="order-summary"><h2>Состав заказа</h2>{entries.length ? entries.map(({ p, q }) => <div key={p.id}><span>{p.name} × {q}</span><b>{money(p.price * q)}</b></div>) : <p>В корзине пока пусто.</p>}<hr /><div className="summary-total"><span>Итого</span><b>{money(total)}</b></div></aside></div></main>;
}
