import { INGREDIENTS } from "@/lib/ingredients";
import { IngredientList } from "@/components/ingredients/IngredientList";

export default function IngredientsPage() {
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">食材辞書</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          保存方法・調理のコツを確認できます 📖
        </p>
      </div>
      <IngredientList ingredients={INGREDIENTS} />
    </div>
  );
}
