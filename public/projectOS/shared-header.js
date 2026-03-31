(function () {
  var current = (window.location.pathname.split("/").pop() || "").toLowerCase();
  var isDashboard = current === "dashboard.html";
  var isCreate = current === "create-project.html";

  var host = document.getElementById("projectos-header");
  if (!host) return;

  host.innerHTML =
    '<nav class="bg-white border-b border-slate-200 sticky top-0 z-40">' +
    '  <div class="max-w-screen-xl mx-auto px-4 flex items-center h-14 gap-4">' +
    '    <a href="dashboard.html" class="flex items-center gap-2 font-bold text-blue-600 text-lg tracking-tight hover:opacity-80">' +
    '      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/></svg>' +
    "      ProjectOS" +
    "    </a>" +
    '    <span class="text-xs text-slate-300 hidden sm:inline">AI Decision OS</span>' +
    "    <div class=\"flex-1\"></div>" +
    '    <a href="dashboard.html" class="' +
    (isDashboard
      ? "text-sm text-blue-600 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition"
      : "text-sm text-slate-600 px-2 py-1 rounded-md hover:bg-slate-100 transition") +
    '">專案面板</a>' +
    '    <a href="create-project.html" class="' +
    (isCreate
      ? "text-sm text-blue-600 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition"
      : "text-sm text-slate-600 px-2 py-1 rounded-md hover:bg-slate-100 transition") +
    '">建立新專案</a>' +
    '    <a id="navUserAvatar" href="#" class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-blue-300 transition shrink-0" title="使用者">?</a>' +
    '    <button id="navLogoutBtn" class="text-sm text-slate-600 px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-100 transition">登出</button>' +
    "  </div>" +
    "</nav>";

  var btn = document.getElementById("navLogoutBtn");
  if (btn) {
    btn.addEventListener("click", function () {
      localStorage.removeItem("backendToken");
      localStorage.removeItem("adminID");
      localStorage.removeItem("adminName");
      localStorage.removeItem("userData");
      localStorage.removeItem("projectAID");
      sessionStorage.removeItem("backendToken");
      sessionStorage.removeItem("adminID");
      sessionStorage.removeItem("adminName");
      window.location.href = "/projectOS/index.html";
    });
  }
})();
