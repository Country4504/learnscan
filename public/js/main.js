/**
 * LearnScan 青少年学习风格诊断系统
 * 主JavaScript文件
 */

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化Bootstrap提示工具
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // 初始化问卷表单验证
  initFormValidation();
  
  // 初始化学习风格报告图表
  initReportCharts();
  
  // 初始化问卷进度跟踪
  initSurveyProgress();
});

/**
 * 初始化表单验证
 */
function initFormValidation() {
  const forms = document.querySelectorAll('.needs-validation');
  
  // 阻止表单提交并执行验证
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });
}

/**
 * 初始化学习风格报告图表
 */
function initReportCharts() {
  // 检查是否在报告页面
  const perceptionChartEl = document.getElementById('perceptionChart');
  if (!perceptionChartEl) return;
  
  // 感知偏好雷达图
  const perceptionCtx = perceptionChartEl.getContext('2d');
  new Chart(perceptionCtx, {
    type: 'radar',
    data: {
      labels: ['视觉型', '听觉型', '动觉型'],
      datasets: [{
        label: '感知偏好百分比',
        data: [
          perceptionChartEl.dataset.visual || 0,
          perceptionChartEl.dataset.auditory || 0,
          perceptionChartEl.dataset.kinesthetic || 0
        ],
        backgroundColor: 'rgba(78, 115, 223, 0.2)',
        borderColor: 'rgba(78, 115, 223, 1)',
        pointBackgroundColor: 'rgba(78, 115, 223, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(78, 115, 223, 1)'
      }]
    },
    options: {
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 100
        }
      }
    }
  });
  
  // 其他维度图表（处理方式、环境偏好、思维模式、时间管理）
  const dimensionsChartEl = document.getElementById('dimensionsChart');
  if (!dimensionsChartEl) return;
  
  const dimensionsCtx = dimensionsChartEl.getContext('2d');
  new Chart(dimensionsCtx, {
    type: 'bar',
    data: {
      labels: ['信息处理', '学习环境', '思维模式', '时间管理'],
      datasets: [{
        label: '第一类型',
        data: [
          dimensionsChartEl.dataset.systematic || 0,
          dimensionsChartEl.dataset.structured || 0,
          dimensionsChartEl.dataset.analytical || 0,
          dimensionsChartEl.dataset.planned || 0
        ],
        backgroundColor: 'rgba(78, 115, 223, 0.8)'
      }, {
        label: '第二类型',
        data: [
          dimensionsChartEl.dataset.global || 0,
          dimensionsChartEl.dataset.flexible || 0,
          dimensionsChartEl.dataset.creative || 0,
          dimensionsChartEl.dataset.adaptive || 0
        ],
        backgroundColor: 'rgba(28, 200, 138, 0.8)'
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

/**
 * 初始化问卷进度跟踪
 */
function initSurveyProgress() {
  const surveyForm = document.getElementById('surveyForm');
  if (!surveyForm) return;
  
  const progressBar = document.getElementById('surveyProgress');
  const questionGroups = document.querySelectorAll('.question-group');
  const totalGroups = questionGroups.length;
  
  // 更新进度条
  function updateProgress() {
    let answered = 0;
    
    questionGroups.forEach(group => {
      const inputs = group.querySelectorAll('input[type="radio"]:checked');
      if (inputs.length > 0) {
        answered++;
      }
    });
    
    const percentage = Math.round((answered / totalGroups) * 100);
    progressBar.style.width = percentage + '%';
    progressBar.setAttribute('aria-valuenow', percentage);
    progressBar.textContent = percentage + '%';
  }
  
  // 为问卷选项添加事件监听
  const radioInputs = surveyForm.querySelectorAll('input[type="radio"]');
  radioInputs.forEach(input => {
    input.addEventListener('change', updateProgress);
  });
  
  // 初始化进度
  updateProgress();
}

/**
 * 平滑滚动到页面指定位置
 * @param {string} elementId - 目标元素ID
 */
function scrollToElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

/**
 * 切换问题组的可见性
 * @param {string} groupId - 问题组ID
 */
function toggleQuestionGroup(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    const isVisible = group.classList.contains('d-none');
    
    // 隐藏所有问题组
    document.querySelectorAll('.question-group').forEach(g => {
      g.classList.add('d-none');
    });
    
    // 显示目标问题组
    if (isVisible) {
      group.classList.remove('d-none');
    }
    
    // 滚动到顶部
    window.scrollTo(0, 0);
  }
} 