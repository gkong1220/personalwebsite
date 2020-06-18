fetch('https://www.nytimes.com/section/todayspaper?redirect_uri=https%3A%2F%2Fwww.nytimes.com%2F', {mode: 'cors'})
  .then(response => response.json())
  .then(data => console.log(data));