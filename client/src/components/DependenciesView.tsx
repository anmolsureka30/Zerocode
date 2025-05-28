import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dependency } from "@/lib/types";

interface DependenciesViewProps {
  dependencies: Dependency[];
  devDependencies: Dependency[];
}

export default function DependenciesView({
  dependencies = [],
  devDependencies = [],
}: DependenciesViewProps) {
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      Core: "green",
      Routing: "blue",
      Styling: "indigo",
      "State Management": "purple",
      "Build Tool": "amber",
      UI: "pink",
      Visualization: "purple",
      Utility: "gray",
      Testing: "red",
      Linting: "pink",
      "CSS Processing": "indigo",
    };
    return categoryColors[category] || "gray";
  };

  const renderDependencyList = (deps: Dependency[]) => {
    return (
      <ul className="space-y-4 text-sm">
        {deps.map((dep) => (
          <li key={dep.name} className="flex justify-between items-center">
            <div>
              <span className="font-medium">{dep.name}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                {dep.version}
              </span>
            </div>
            <Badge variant="outline" className={`bg-${getCategoryColor(dep.category)}-100 dark:bg-${getCategoryColor(dep.category)}-800 text-${getCategoryColor(dep.category)}-800 dark:text-${getCategoryColor(dep.category)}-100`}>
              {dep.category}
            </Badge>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Package Dependencies</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg leading-6 font-medium">Main Dependencies</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Core packages required for this application
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {dependencies.length > 0 ? (
            renderDependencyList(dependencies)
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No dependencies found. Generate an app to see the dependencies.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg leading-6 font-medium">Dev Dependencies</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Packages used for development and building
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {devDependencies.length > 0 ? (
            renderDependencyList(devDependencies)
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No dev dependencies found. Generate an app to see the dev dependencies.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button>Edit Dependencies</Button>
      </div>
    </div>
  );
}
