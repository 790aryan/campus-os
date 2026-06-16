export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-black">{value ?? 0}</p>
        </div>
        {Icon && <Icon className="text-brand" size={28} />}
      </div>
    </div>
  );
}
