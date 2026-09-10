/** Story sections: native controls, readable mobile flow, owned observers. */
const cleanups = new WeakMap();
export function disposeStory(root) {
  for (const node of root.children) cleanups.get(node)?.();
}
function node(tag, className, text) {
  const value = document.createElement(tag);
  value.className = className;
  if (text) value.textContent = text;
  return value;
}
function picture(image, className = '') {
  const img = node('img', className);
  img.src = image.src; img.alt = image.alt || '';
  img.width = image.width || 1600; img.height = image.height || 1200;
  img.loading = 'lazy';
  return img;
}
function shell(section, family) {
  const root = node('section', `story-section ${family}`);
  root.dataset.family = family;
  if (section.id) root.id = section.id;
  if (section.headline) root.append(node('h2', 'story-title', section.headline));
  if (section.body) root.append(node('p', 'story-lead', section.body));
  return root;
}
export function renderChapters(section) {
  const root = shell(section, 'visual-chapters');
  const layout = node('div', 'chapters-layout');
  const visual = node('div', 'chapters-visual'); visual.setAttribute('aria-hidden', 'true');
  const copy = node('div', 'chapters-copy');
  const images = [], articles = [];
  for (const [i, chapter] of (section.chapters || []).entries()) {
    const img = picture(chapter.image); img.alt = ''; img.classList.toggle('is-current', i === 0);
    images.push(img); visual.append(img);
    const article = node('article', 'chapter');
    article.append(node('span', 'story-number', String(i + 1).padStart(2, '0')),
      node('h3', '', chapter.title), node('p', '', chapter.body), picture(chapter.image, 'chapter-mobile'));
    articles.push(article); copy.append(article);
  }
  layout.append(visual, copy); root.append(layout);
  // Observe a reading band rather than making the reader chase a moving caption.
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      const index = articles.indexOf(entry.target);
      images.forEach((img, i) => img.classList.toggle('is-current', i === index));
    }
  }, { rootMargin: '-20% 0px -45% 0px' });
  articles.forEach(article => observer.observe(article));
  cleanups.set(root, () => observer.disconnect());
  return root;
}
export function renderExpand(section) {
  const root = shell(section, 'expanding-image');
  const frame = node('figure', 'expand-frame');
  frame.append(picture(section.image));
  if (section.caption) frame.append(node('figcaption', '', section.caption));
  root.append(frame);
  // CSS scroll timelines enhance this; unsupported browsers retain a full image.
  return root;
}
export function renderProjectIndex(section) {
  const root = shell(section, 'project-index');
  const layout = node('div', 'project-layout');
  const preview = node('figure', 'project-preview');
  const list = node('div', 'project-list');
  const projects = section.projects || [];
  const buttons = [];
  const image = projects[0] ? picture(projects[0].image) : null;
  const caption = node('figcaption', '');
  const link = node('a', 'project-visit', 'Open study ↗');
  if (image) preview.append(image, caption, link);
  function select(i) {
    const project = projects[i];
    image.src = project.image.src; image.alt = project.image.alt || '';
    caption.textContent = project.body || project.title;
    link.href = project.href || '#';
    link.hidden = !project.href;
    link.setAttribute('aria-label', `Open ${project.title} study`);
    buttons.forEach((button, index) => button.setAttribute('aria-pressed', String(index === i)));
  }
  for (const [i, project] of projects.entries()) {
    const button = node('button', 'project-row'); button.type = 'button';
    button.append(node('span', 'story-number', String(i + 1).padStart(2, '0')),
      node('span', 'project-name', project.title), node('span', 'project-discipline', project.discipline));
    button.addEventListener('click', () => select(i));
    button.addEventListener('focus', () => select(i));
    button.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') select(i); });
    buttons.push(button); list.append(button);
  }
  if (projects.length) select(0);
  layout.append(list, preview); root.append(layout);
  return root;
}
export function renderComparison(section) {
  const root = shell(section, 'image-comparison');
  const frame = node('div', 'comparison-frame');
  frame.append(picture(section.before.image, 'comparison-before'), picture(section.after.image, 'comparison-after'));
  const labels = node('div', 'comparison-labels');
  labels.append(node('span', '', section.after.label), node('span', '', section.before.label));
  const label = node('label', 'comparison-control', 'Move to compare');
  const input = document.createElement('input'); input.type = 'range'; input.min = '0'; input.max = '100'; input.value = '50';
  input.setAttribute('aria-label', `Compare ${section.before.label} and ${section.after.label}`);
  const update = () => {
    frame.style.setProperty('--comparison', `${input.value}%`);
    input.setAttribute('aria-valuetext', `${input.value}% ${section.after.label}`);
  };
  input.addEventListener('input', update); update();
  label.append(input); root.append(frame, labels, label);
  return root;
}
