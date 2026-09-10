/** Docs chrome stays independent of the config-only frame template. */
for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    const text = document.getElementById(button.dataset.copy).textContent;
    const status = document.querySelector('.copy-status');
    try { await navigator.clipboard.writeText(text); status.textContent = 'Commands copied.'; }
    catch { status.textContent = 'Select the commands above to copy them.'; }
  });
}
