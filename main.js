// main.js — global logger
window.IMPERIUM_LOG = function (msg) {
  const logBox = document.getElementById("event-log");
  if (logBox) {
    const now = new Date();
    const timestamp = now.toLocaleTimeString();
    logBox.textContent += `\n[${timestamp}] ${msg}`;
    logBox.scrollTop = logBox.scrollHeight;
  }
  console.log(msg);
};
