import { IngredientsTabView } from "@/components/ingredients/IngredientsTabView";

export default function IngredientsPage() {
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">食材・用語辞書</h1>
        <p className="text-xs text-gray-500 mt-0.5">
          食材の保存法・調理用語・スターターキットを確認できます 📖
        </p>
      </div>
      <IngredientsTabView />
    </div>
  );
}
