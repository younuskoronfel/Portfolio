// Appearance applies before the page is parsed to avoid a theme flash.
const appearanceDefaults = { mode: 'system', brightness: 100, reduceMotion: false };
const systemColorScheme = matchMedia('(prefers-color-scheme: dark)');
let appearance = { ...appearanceDefaults };
try {
  const saved = JSON.parse(localStorage.getItem('younus-appearance') || '{}');
  if (['system', 'light', 'dark', 'midnight'].includes(saved.mode)) appearance.mode = saved.mode;
  if (Number.isFinite(saved.brightness)) appearance.brightness = Math.max(60, Math.min(120, saved.brightness));
  appearance.reduceMotion = saved.reduceMotion === true;
} catch { /* Storage may be unavailable in private browsing. */ }
function applyAppearance() {
  const theme = appearance.mode === 'system' ? (systemColorScheme.matches ? 'dark' : 'light') : appearance.mode;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.reduceMotion = String(appearance.reduceMotion);
  document.documentElement.style.setProperty('--brightness', appearance.brightness / 100);
  try { localStorage.setItem('younus-appearance', JSON.stringify(appearance)); } catch {}
}
applyAppearance();
systemColorScheme.addEventListener('change', () => { if (appearance.mode === 'system') applyAppearance(); });

// Small, browser-local demonstrations use fictional data, never client records.
const formatMoney = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
function projectDemoMarkup(index) {
  const note = '<p class="demo-disclosure">Interactive demonstration · Fictional sample data, inspired by the project.</p>';
  if (index === 0) return `${note}<div class="demo-heading"><h3>Follow an order</h3><p>See how one order connects to a menu, a recipe, and inventory.</p></div><label class="demo-range-label" for="pizza-quantity">Pizzas ordered <output id="pizza-quantity-value" for="pizza-quantity">1</output></label><input class="demo-range" id="pizza-quantity" type="range" min="1" max="10" value="1"><div class="order-steps" role="group" aria-label="Explore database relationships">${['Order', 'Menu item', 'Recipe', 'Inventory'].map((name, i) => `<button data-order-step="${i}" aria-pressed="${i === 0}"><small>0${i + 1}</small>${name}<span aria-hidden="true">${i < 3 ? '→' : '↗'}</span></button>`).join('')}</div><div class="order-record"><div><span id="record-label" class="demo-kicker"></span><h3 id="record-title"></h3><p id="record-description"></p></div><pre id="record-code" aria-label="Illustrative database record"></pre></div><p class="demo-live" id="order-insight" aria-live="polite"></p>`;
  if (index === 1) return `${note}<div class="demo-heading"><h3>What would you change?</h3><p>Run a fictional restaurant. Move a variable and watch the model respond.</p></div><div class="profit-demo"><div class="demo-inputs"><label class="demo-range-label" for="demo-orders">Monthly orders <output id="demo-orders-value" for="demo-orders">1,000</output></label><input class="demo-range" id="demo-orders" type="range" min="500" max="2000" step="50" value="1000"><label class="demo-range-label" for="demo-cost">Ingredient cost per order <output id="demo-cost-value" for="demo-cost">$6.00</output></label><input class="demo-range" id="demo-cost" type="range" min="3" max="10" step="0.25" value="6"><label class="demo-range-label" for="demo-waste">Ingredient waste <output id="demo-waste-value" for="demo-waste">10%</output></label><input class="demo-range" id="demo-waste" type="range" min="0" max="30" value="10"><button class="demo-reset" id="reset-profit">↺ Reset experiment</button></div><div class="profit-results"><span class="demo-kicker">SIMULATED MONTHLY PROFIT</span><output class="profit-total" id="demo-profit">$3,400</output><p id="profit-change" aria-live="polite">Starting scenario</p><div class="cost-bars"><div><span>Revenue</span><b id="demo-revenue"></b><i id="demo-revenue-bar"></i></div><div><span>Ingredients + waste</span><b id="demo-ingredients"></b><i id="demo-ingredients-bar"></i></div><div><span>Fixed costs</span><b>$5,000</b><i id="demo-fixed-bar"></i></div></div><p id="waste-insight"></p></div></div><details class="demo-assumptions"><summary>Assumptions & math</summary><p>Price: $15 per order. Fixed costs: $5,000 per month. Profit = orders × $15 − orders × ingredient cost × (1 + waste rate) − $5,000. Waste is an added ingredient cost. This simplified example excludes taxes, variable labor, fees, and other costs. These are not Red Pepper’s figures or actual results.</p></details>`;
  return `${note}<div class="demo-heading"><h3>Explore the sales dashboard</h3><p>Switch the measure and date range to find a different view of the same data.</p></div><div class="sales-controls"><div class="metric-buttons" role="group" aria-label="Sales measure"><button data-sales-metric="revenue" aria-pressed="true">Revenue</button><button data-sales-metric="orders" aria-pressed="false">Orders</button></div><label for="sales-period">Date range <select id="sales-period"><option value="6">All six months</option><option value="3">Last three months</option></select></label></div><div class="sales-kpis" aria-live="polite"><div><span id="sales-total-label">Total revenue</span><output id="sales-total"></output></div><div><span>Average order value</span><output id="sales-average"></output></div></div><div id="sales-chart" class="sales-chart" role="img" aria-label="Monthly sample revenue chart"></div><details class="demo-assumptions"><summary>View sample data</summary><div class="sample-table-wrap"><table class="sample-table"><caption>Fictional monthly sales, not Habibi Tacos business data</caption><thead><tr><th scope="col">Month</th><th scope="col">Revenue</th><th scope="col">Orders</th></tr></thead><tbody id="sales-data"></tbody></table></div></details>`;
}
function mountProjectDemo(index, root) {
  const find = selector => root.querySelector(selector);
  if (index === 0) {
    let step = 0;
    const renderOrder = () => {
      const quantity = Number(find('#pizza-quantity').value);
      find('#pizza-quantity-value').textContent = quantity;
      const records = [
        ['TRANSACTION', 'It starts with a customer.', 'An order-item record links this transaction to a specific menu item.', `order_id: 1042\nmenu_item_id: P01\nquantity: ${quantity}\norder_total: ${formatMoney(quantity * 15)}`],
        ['CATALOG', 'Give every item an identity.', 'The menu identifier connects the order to a named item, its price, and its recipe.', 'menu_item_id: P01\nname: Margherita pizza\nunit_price: $15.00\nrecipe_id: R01'],
        ['RECIPE', 'Translate the sale into ingredients.', 'Recipe quantities multiply with the order. Move the slider to see the expected ingredient requirements.', `recipe_id: R01\npizzas: ${quantity}\nflour: ${quantity * 250} g\ntomato: ${quantity * 80} g\nmozzarella: ${quantity * 100} g`],
        ['INVENTORY', 'Compare expected use with stock.', 'Expected usage can be compared with recorded stock changes to frame questions about portioning or waste.', `ingredient: mozzarella\nstarting_stock: 5,000 g\nexpected_usage: ${quantity * 100} g\nexpected_remaining: ${(5000 - quantity * 100).toLocaleString()} g`]
      ];
      ['record-label', 'record-title', 'record-description', 'record-code'].forEach((id, i) => find('#' + id).textContent = records[step][i]);
      find('#order-insight').textContent = `${quantity} ${quantity === 1 ? 'pizza connects' : 'pizzas connect'} ${formatMoney(quantity * 15)} in revenue to ${quantity * 100} g of expected mozzarella usage.`;
    };
    root.querySelectorAll('[data-order-step]').forEach(button => button.addEventListener('click', () => {
      step = Number(button.dataset.orderStep);
      root.querySelectorAll('[data-order-step]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      renderOrder();
    }));
    find('#pizza-quantity').addEventListener('input', renderOrder); renderOrder();
  } else if (index === 1) {
    const calculate = () => {
      const orders = Number(find('#demo-orders').value), cost = Number(find('#demo-cost').value), waste = Number(find('#demo-waste').value);
      const revenue = orders * 15, ingredients = orders * cost * (1 + waste / 100), profit = revenue - ingredients - 5000, difference = profit - 3400;
      find('#demo-orders-value').textContent = orders.toLocaleString(); find('#demo-cost-value').textContent = '$' + cost.toFixed(2); find('#demo-waste-value').textContent = waste + '%';
      find('#demo-profit').textContent = formatMoney(profit);
      find('#profit-change').textContent = Math.abs(difference) < .01 ? 'Starting scenario' : `${difference >= 0 ? '↑' : '↓'} ${formatMoney(Math.abs(difference))} ${difference >= 0 ? 'above' : 'below'} the starting scenario`;
      find('#demo-revenue').textContent = formatMoney(revenue); find('#demo-ingredients').textContent = formatMoney(ingredients);
      const max = Math.max(revenue, ingredients, 5000);
      [['revenue', revenue], ['ingredients', ingredients], ['fixed', 5000]].forEach(([key, value]) => find('#demo-' + key + '-bar').style.width = value / max * 100 + '%');
      find('#waste-insight').textContent = `One percentage point of waste costs ${formatMoney(orders * cost / 100)} per month in this scenario.`;
    };
    ['orders', 'cost', 'waste'].forEach(key => find('#demo-' + key).addEventListener('input', calculate));
    find('#reset-profit').addEventListener('click', () => { find('#demo-orders').value = 1000; find('#demo-cost').value = 6; find('#demo-waste').value = 10; calculate(); });
    calculate();
  } else {
    const sample = [{month:'Jan',revenue:8400,orders:700},{month:'Feb',revenue:9600,orders:800},{month:'Mar',revenue:9000,orders:750},{month:'Apr',revenue:11400,orders:950},{month:'May',revenue:10800,orders:900},{month:'Jun',revenue:12600,orders:1050}];
    let metric = 'revenue';
    const renderSales = () => {
      const rows = sample.slice(-Number(find('#sales-period').value));
      const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0), totalOrders = rows.reduce((sum, row) => sum + row.orders, 0);
      const formatValue = value => metric === 'revenue' ? formatMoney(value) : value.toLocaleString();
      find('#sales-total-label').textContent = metric === 'revenue' ? 'Total revenue' : 'Total orders';
      find('#sales-total').textContent = formatValue(metric === 'revenue' ? totalRevenue : totalOrders);
      find('#sales-average').textContent = formatMoney(totalRevenue / totalOrders);
      const max = Math.max(...rows.map(row => row[metric]));
      find('#sales-chart').innerHTML = rows.map(row => `<div class="sales-column"><span>${formatValue(row[metric])}</span><i style="height:${row[metric] / max * 130}px"></i><b>${row.month}</b></div>`).join('');
      find('#sales-chart').setAttribute('aria-label', `Fictional monthly ${metric}: ` + rows.map(row => `${row.month} ${formatValue(row[metric])}`).join(', '));
      find('#sales-data').innerHTML = rows.map(row => `<tr><th scope="row">${row.month}</th><td>${formatMoney(row.revenue)}</td><td>${row.orders.toLocaleString()}</td></tr>`).join('');
    };
    root.querySelectorAll('[data-sales-metric]').forEach(button => button.addEventListener('click', () => {
      metric = button.dataset.salesMetric;
      root.querySelectorAll('[data-sales-metric]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      renderSales();
    }));
    find('#sales-period').addEventListener('change', renderSales); renderSales();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const appearancePanel = document.querySelector('#appearance-panel');
  const appearanceToggle = document.querySelector('#appearance-toggle');
  const syncAppearanceControls = () => {
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === appearance.mode)));
    document.querySelector('#brightness').value = appearance.brightness;
    document.querySelector('#brightness-value').textContent = appearance.brightness + '%';
    document.querySelector('#reduce-motion').checked = appearance.reduceMotion;
    appearanceToggle.textContent = document.documentElement.dataset.theme === 'light' ? '☼' : '☾';
  };
  function setAppearanceOpen(open, restoreFocus = false) {
    appearancePanel.hidden = !open;
    appearanceToggle.setAttribute('aria-expanded', String(open));
    if (open) appearancePanel.querySelector('#appearance-close').focus();
    else if (restoreFocus) appearanceToggle.focus();
  }
  appearanceToggle.addEventListener('click', () => setAppearanceOpen(appearancePanel.hidden));
  document.querySelector('#appearance-close').addEventListener('click', () => setAppearanceOpen(false, true));
  document.addEventListener('click', event => {
    if (!appearancePanel.hidden && !appearancePanel.contains(event.target) && !appearanceToggle.contains(event.target)) setAppearanceOpen(false);
  });
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => {
    appearance.mode = button.dataset.mode;
    applyAppearance(); syncAppearanceControls();
  }));
  document.querySelector('#brightness').addEventListener('input', event => {
    appearance.brightness = Number(event.target.value);
    applyAppearance(); syncAppearanceControls();
  });
  document.querySelector('#reduce-motion').addEventListener('change', event => {
    appearance.reduceMotion = event.target.checked; applyAppearance();
  });
  document.querySelector('#reset-settings').addEventListener('click', () => {
    appearance = { ...appearanceDefaults }; applyAppearance(); syncAppearanceControls();
  });
  syncAppearanceControls();

  const resumePreview = document.querySelector('#resume-preview');
  const resumePdf = document.querySelector('#resume-pdf');
  const previewButton = document.querySelector('#resume-preview-button');
  const pdfButton = document.querySelector('#resume-pdf-button');
  function setResumeViewer(usePdf) {
    if (usePdf && !resumePdf.hasAttribute('src')) resumePdf.src = resumePdf.dataset.src;
    resumePdf.hidden = !usePdf;
    resumePreview.hidden = usePdf;
    previewButton.setAttribute('aria-pressed', String(!usePdf));
    pdfButton.setAttribute('aria-pressed', String(usePdf));
  }
  previewButton.addEventListener('click', () => setResumeViewer(false));
  pdfButton.addEventListener('click', () => setResumeViewer(true));

  const navigation = document.querySelector('#navigation');
  const menuToggle = document.querySelector('#menu-toggle');
  function closeMenu() {
    navigation.classList.remove('open'); menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation'); menuToggle.textContent = '☰';
  }
  menuToggle.addEventListener('click', () => {
    const open = navigation.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menuToggle.textContent = open ? '×' : '☰';
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setAppearanceOpen(false); closeMenu(); }
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) navigation.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id));
    });
  }, { rootMargin: '-15% 0px -65% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));

  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    document.querySelectorAll('[data-category]').forEach(card => card.hidden = button.dataset.filter !== 'all' && button.dataset.filter !== card.dataset.category);
  }));
  // Every project is playable immediately, without opening a dialog or tab.
  document.querySelectorAll('[data-demo]').forEach(root => {
    const index = Number(root.dataset.demo);
    root.innerHTML = projectDemoMarkup(index);
    mountProjectDemo(index, root);
  });

  document.querySelector('#copy-email').addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText('younus.koronfel622@gmail.com'); status.textContent = 'Email copied.';
    } catch { status.textContent = 'Copy this address: younus.koronfel622@gmail.com'; }
  });
  document.querySelector('#contact-form').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent('Portfolio inquiry from ' + String(data.get('name')).trim());
    const body = encodeURIComponent(String(data.get('message')).trim() + '\n\nFrom: ' + data.get('name') + '\nEmail: ' + data.get('email'));
    location.href = `mailto:younus.koronfel622@gmail.com?subject=${subject}&body=${body}`;
  });
});
