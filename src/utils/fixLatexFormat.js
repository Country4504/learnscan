    // 修复LaTeX格式的函数
    const fixLatexFormat = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const processed = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          // 先将所有多余的斜杠归一为单斜杠（如 \\\\frac -> \\frac -> \frac）
          let fixed = value.replace(/\\+/g, '\\');
          // 将\(...\)格式转换为$...$格式
          fixed = fixed.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
          // 检查是否包含LaTeX公式但没有数学符号包围
          if (fixed.match(/\\frac|\\sqrt|\\sum|\\int|\\lim|\\sin|\\cos|\\tan|\\log/)) {
            // 如果包含LaTeX公式但没有$包围，则添加$
            if (!fixed.includes('$')) {
              fixed = `$${fixed}$`;
            }
          }
          const original = value;
          processed[key] = fixed;
          if (original !== processed[key]) {
            console.log(`LaTeX修复 - ${key}: "${original}" -> "${processed[key]}"`);
          }
        } else if (Array.isArray(value)) {
          processed[key] = value.map(item => {
            if (typeof item === 'string') {
              const original = item;
              let fixed = item.replace(/\\+/g, '\\');
              // 将\(...\)格式转换为$...$格式
              fixed = fixed.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
              if (fixed.match(/\\frac|\\sqrt|\\sum|\\int|\\lim|\\sin|\\cos|\\tan|\\log/)) {
                if (!fixed.includes('$')) {
                  fixed = `$${fixed}$`;
                }
              }
              if (original !== fixed) {
                console.log(`LaTeX修复 - 数组项: "${original}" -> "${fixed}"`);
              }
              return fixed;
            }
            return item;
          });
        } else if (typeof value === 'object' && value !== null) {
          processed[key] = fixLatexFormat(value);
        } else {
          processed[key] = value;
        }
      }
      return processed;
    };

module.exports = fixLatexFormat;