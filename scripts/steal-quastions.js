(async function extractQuestions() {
  const questionItems = document.querySelectorAll('ul[data-testid="accordion-list"] > li');
  if (questionItems.length === 0) {
    console.log('❌ No questions found on the page.');
    return { questions: [] };
  }
  
  const allQuestions = [];
  
  
  for (let i = 0; i < questionItems.length; i++) {
    const item = questionItems[i];
    
    
    const titleElement = item.querySelector('h3');
    const title = titleElement ? titleElement.innerText.trim() : 'Unknown Question';
    
    
    const levelElement = item.querySelector('div[class*="rounded-md border"]');
    const level = levelElement ? levelElement.innerText.trim() : 'Unknown';
    
    
    const lockIcon = item.querySelector('svg[class*="text-gray-400"]');
    const isPremium = lockIcon !== null;
    
    console.log(`Processing ${i + 1}/${questionItems.length}: ${title.substring(0, 50)}...`);
    
    let answer = null;
    if (!isPremium) {
      
      const clickableArea = item.querySelector('.noselect');
      if (clickableArea) {
        clickableArea.click();
        
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        
        const answerContainer = item.querySelector('.ReactCollapse--content');
        if (answerContainer) {
          answer = answerContainer.innerText.trim();
        }
        
        
        clickableArea.click();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } else {
      answer = "Premium content - answer locked";
    }
    
    
    allQuestions.push({
      id: i + 1,
      level: level,
      title: title,
      answer: answer,
      isPremium: isPremium
    });
  }

  const result = {
    totalQuestions: allQuestions.length,
    extractedAt: new Date().toISOString(),
    questions: allQuestions
  };
  
  console.log(JSON.stringify(result, null, 2));
  
  
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    } catch (err) {
      console.log('ZAJEBANO PYTANIA SUCCESSFULLY');
    }
  }
  
  return result;
})();