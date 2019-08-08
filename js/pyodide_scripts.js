function py(code) {
  return pyodide.runPython(code);
}
const editor = document.querySelector('.editor');
const templateEditor = document.querySelector('.template-editor');
const result = document.getElementById('result');
const runButton = document.getElementById('run');
const loader = document.querySelector('.loader');

function getTextFromEditor(element, isTemplate = false) {
  const text = element.innerText.replace(/\xA0/g, ' ');
  // return element.innerText;
  return isTemplate ? text.replace(/\n/g, '') : text;
}
function runPythonText() {
  const text = getTextFromEditor(editor);
  pyodide.runPython(text);
}
function hightLightPythonCode(block = editor) {
  hljs.highlightBlock(block);
}
hightLightPythonCode();
languagePluginLoader.then(async () => {
  await pyodide.loadPackage(['jinja2', 'markupsafe']);
  console.log('jinja2 is ready');
  loader.style.display = 'none';
  // Настраиваем env для jinja2
  py('from jinja2 import Template, BaseLoader, Environment');
  py('from js import document');
  py('def load_template(): return document.querySelector(\'.template-editor\').value.replace(\'\\n\', \'\')');
  py('def set_template(t): document.getElementById("result").innerHTML = t');
  py('env = Environment(loader=BaseLoader())');

  function loadTemplate() {
    const template = templateEditor.value.replace(/\n/g, '');
    py('t = env.from_string(load_template())');
    py('set_template(t.render(locals()))');
  }
  editor.addEventListener('input', () => {
    try {
      runPythonText();
      editor.classList.remove('error');
    } catch (e) {
      editor.classList.add('error');
    }
  });
  runButton.addEventListener('click', () => {
    hightLightPythonCode();
    runPythonText();
    loadTemplate();
  });
});
