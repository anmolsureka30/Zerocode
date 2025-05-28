// Intentional error - Using undeclared variable
document.addEventListener('DOMContentLoaded', function() {
  const app = document.getElementById('app');
  
  // Error: using 'message' without declaring it
  app.innerHTML = message;
  
  // This would be the correct code:
  // const message = "Hello World!";
  // app.innerHTML = message;
});
