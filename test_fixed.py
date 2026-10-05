import subprocess
import pypdf

html = """<!DOCTYPE html>
<html>
<head>
<style>
@page { size: A4; margin: 0; }
body { margin: 0; font-family: sans-serif; }
.fixed-footer {
  position: fixed;
  bottom: 20px;
  left: 20px;
}
.page-num::after {
  content: 'Page ' counter(page) ' of 3';
}
.page-break {
  height: 1000px;
  page-break-after: always;
}
</style>
</head>
<body>
<div class="fixed-footer"><span class="page-num"></span></div>
<div class="page-break">Content page 1</div>
<div class="page-break">Content page 2</div>
<div>Content page 3</div>
</body>
</html>"""

with open('test_fixed.html', 'w') as f:
    f.write(html)

chrome = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
subprocess.run([chrome, '--headless=new', '--disable-gpu', '--print-to-pdf=test_fixed.pdf', 'test_fixed.html'])

reader = pypdf.PdfReader('test_fixed.pdf')
for i, page in enumerate(reader.pages):
    print(f'Page {i+1}:', repr(page.extract_text()))
