import { CartList } from "@/components/cart/CartList";

export default function CartPage() {
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">買い物リスト</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          チェックしながら買い物しましょう 🛒
        </p>
      </div>
      <CartList />
    </div>
  );
}
