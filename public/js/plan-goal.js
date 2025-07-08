document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('goalForm');
  const resultDiv = document.getElementById('goalAnalysisResult');
  const feasibilityDiv = document.getElementById('goalFeasibility');
  const breakdownUl = document.getElementById('goalBreakdown');
  const priorityDiv = document.getElementById('goalPriorityResult');
  const priorityUl = document.getElementById('goalPriorityList');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    resultDiv.style.display = 'none';
    priorityDiv.style.display = 'none';
    feasibilityDiv.textContent = 'AI解析中，请稍候...';
    breakdownUl.innerHTML = '';
    priorityUl.innerHTML = '';
    // 显示加载动画并禁用按钮
    submitBtn.disabled = true;
    const oldBtnHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>解析中...';

    const goalType = form.goalType.value;
    const goalContent = form.goalContent.value;
    try {
      const res = await fetch('/plan/goal-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalType, goalContent })
      });
      const data = await res.json();
      console.log('AI返回数据:', data);
      if (data.error) throw new Error(data.error);
      // 展示AI结果
      feasibilityDiv.textContent = data.feasibility || '无';
      (data.breakdown || []).forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = item.replace(/^小目标\d+：?/, ''); // 去除AI返回的小目标序号
        breakdownUl.appendChild(li);
      });
      (data.priority || []).forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = item.replace(/^优先事项\d+：/, ''); // 去除AI返回的序号
        priorityUl.appendChild(li);
      });
      resultDiv.style.display = '';
      priorityDiv.style.display = '';
    } catch (err) {
      feasibilityDiv.textContent = 'AI解析失败：' + err.message;
      resultDiv.style.display = '';
    }
    // 恢复按钮
    submitBtn.disabled = false;
    submitBtn.innerHTML = oldBtnHtml;
  });

  // 个性化学习路径生成
  const pathForm = document.getElementById('pathInfoForm');
  const pathResultDiv = document.getElementById('pathResult');
  const pathOptionsDiv = document.getElementById('pathOptions');
  const planScheduleDiv = document.getElementById('planSchedule');
  if (pathForm) {
    const pathBtn = pathForm.querySelector('button[type="submit"]');
    pathForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      pathResultDiv.style.display = 'none';
      pathOptionsDiv.innerHTML = '';
      planScheduleDiv.innerHTML = '';
      // 显示加载动画并禁用按钮
      pathBtn.disabled = true;
      const oldBtnHtml = pathBtn.innerHTML;
      pathBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>生成中...';

      // 收集表单数据
      const styleType = pathForm.styleType.value;
      const levelMath = pathForm.levelMath.value;
      const levelChinese = pathForm.levelChinese.value;
      const studyTime = pathForm.studyTime.value;
      const studyPreferenceSel = pathForm.studyPreference;
      const studyPreference = Array.from(studyPreferenceSel.selectedOptions).map(opt => opt.value);
      try {
        const res = await fetch('/plan/path-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ styleType, levelMath, levelChinese, studyTime, studyPreference })
        });
        const data = await res.json();
        console.log('AI返回数据:', data);
        if (data.error) throw new Error(data.error);
        // 渲染路径方案（兼容字符串数组和对象数组）
        (data.options || []).forEach((item, idx) => {
          const card = document.createElement('div');
          card.className = 'card mb-3';
          if (typeof item === 'string') {
            card.innerHTML = `<div class="card-body"><h6 class="card-title">方案${idx+1}</h6><p class="card-text">${item.replace(/^路径方案\d+：?/, '')}</p></div>`;
          } else if (typeof item === 'object' && item !== null) {
            card.innerHTML = `<div class="card-body"><h6 class="card-title">${item.name || '方案'+(idx+1)}</h6><p class="card-text">${item.description || ''}</p></div>`;
          }
          pathOptionsDiv.appendChild(card);
        });
        // 渲染详细计划（兼容对象数组结构）
        (data.schedule || []).forEach((schObj, idx) => {
          if (typeof schObj === 'string') {
            // 兼容老格式
            const sch = document.createElement('div');
            sch.className = 'alert alert-info';
            sch.innerHTML = `<b>计划${idx+1}：</b>${schObj.replace(/^详细计划\d+：?/, '')}`;
            planScheduleDiv.appendChild(sch);
          } else if (typeof schObj === 'object' && schObj !== null) {
            const sch = document.createElement('div');
            sch.className = 'alert alert-info mb-2';
            let html = `<b>${schObj.name || '详细计划'+(idx+1)}</b>`;
            if (schObj.weekly && typeof schObj.weekly === 'object') {
              html += '<div class="mt-2"><b>每周安排：</b><ul style="margin-bottom:0;">';
              Object.entries(schObj.weekly).forEach(([day, val]) => {
                html += `<li><b>${day}：</b>${val}</li>`;
              });
              html += '</ul></div>';
            }
            if (Array.isArray(schObj.monthly)) {
              html += '<div class="mt-2"><b>每月安排：</b><ul style="margin-bottom:0;">';
              schObj.monthly.forEach(item => {
                html += `<li>${item}</li>`;
              });
              html += '</ul></div>';
            }
            sch.innerHTML = html;
            planScheduleDiv.appendChild(sch);
          }
        });
        // 展示补充说明（如有）
        if (data['补充说明']) {
          const extra = document.createElement('div');
          extra.className = 'alert alert-secondary mt-3';
          extra.innerHTML = `<b>补充说明：</b><ul style="margin-bottom:0;">${data['补充说明'].map(item => `<li>${item}</li>`).join('')}</ul>`;
          planScheduleDiv.appendChild(extra);
        }
        pathResultDiv.style.display = '';
      } catch (err) {
        pathOptionsDiv.innerHTML = '<div class="alert alert-danger">AI路径生成失败：' + err.message + '</div>';
        pathResultDiv.style.display = '';
      }
      // 恢复按钮
      pathBtn.disabled = false;
      pathBtn.innerHTML = oldBtnHtml;
    });
  }
});

function renderGuidance(data) {
  console.log('renderGuidance data:', data);
  let content = data.content || '';
  // 直接使用后端返回的格式，不需要额外处理
  return `<div><b>${data.step || ''}：</b>${content}</div>`;
}
 