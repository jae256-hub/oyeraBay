//technicianLogin.html
let form = document.getElementById('form3');
form.addEventListener('submit',function(event){
    event.preventDefault();//important to prevent default behaviour of form submission.
    //getting the values of input fields.
const technicianNameInput = document.getElementById('exampleInputName').value.trim();
const emailInput = document.getElementById('exampleInputEmail').value.trim();
const employeeNumberInput = document.getElementById('exampleInputNumber').value.trim();
const passwordInput = document.getElementById('exampleInputPassword').value.trim();
const message = document.getElementById('messageOutput');//Selecting the message paragraph.



//validation.
    if(technicianNameInput ===""){
               message.textContent = "Customer name required";
               message.className = "text-danger";
               return;
    }
    if(emailInput ===""){
        message.textContent = "Email required";
        message.className = "text-danger";
        return;
    }
    if(employeeNumberInput ===""){
        message.textContent = "Telephone number required";
        message.className = "text-danger";
        return;
    }
    if(passwordInput ===""){
        message.textContent = "Number plate required";
        message.className = "text-danger";
        return;
    }
    if(!emailRegex.test(email)=== false){
        message.textContent = "Invalid email format";
        message.className = "text-danger";
        return;
    }
    //Success 
    message.textContent = "Customer registered successfully";
    message.className = "text-success";


});
form.style.marginLeft = '40px'; 
form.style.marginRight = '40px';
