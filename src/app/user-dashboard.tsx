<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <p className="text-sm text-gray-500">Membership</p>
    <p className="font-medium">
      {userData?.role === "admin" ? "Admin Account" : "Level 3"}
    </p>
  </div>
  <div>
    <p className="text-sm text-gray-500">Sessions This Month</p>
    <p className="font-medium">8 / 12</p>
  </div>
</div> 