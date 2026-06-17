type StatsCardProps = {
  title: string;
  value: string | number;
  icon?: string;
  trend?: { value: number; positive: boolean };
};

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {icon && (
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-lg">
              {icon}
            </div>
          )}
          <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs font-medium text-gray-500">{title}</p>
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              trend.positive
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span aria-hidden="true">{trend.positive ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
