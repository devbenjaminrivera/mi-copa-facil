const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  content = content.replace(/green-500/g, 'orange-500');
  content = content.replace(/green-400/g, 'orange-400');
  content = content.replace(/green-600/g, 'orange-600');
  
  // Replace RGB/RGBA values of Tailwind green colors with Tailwind orange colors
  // green-500: rgb(34, 197, 94) -> orange-500: rgb(249, 115, 22)
  content = content.replace(/rgba\(34,\s*197,\s*94/g, 'rgba(249, 115, 22'); 
  // green-400: rgb(74, 222, 128) -> orange-400: rgb(251, 146, 60)
  content = content.replace(/rgba\(74,\s*222,\s*128/g, 'rgba(251, 146, 60'); 
  
  // Hex values
  content = content.replace(/#22c55e/g, '#f97316');
  
  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walkSync(dirFile, filelist);
      }
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.css') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
}

const files = walkSync('./app').concat(walkSync('./components'));
files.forEach(f => {
  replaceInFile(f);
});
console.log('Finished.');
