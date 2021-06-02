function getform(position){
    let form = new FormData(position);
    let obj = {};
    for (let key of form.keys() ) {
		obj[key] = form.get(key);
	}
	return obj;
};

function SignInPage(){
    let sign = document.getElementsByClassName("signbox");
    let background = document.getElementsByClassName("background_layer");
    sign[0].style.display = "block";
    background[0].style.display = "block";  
}

function SignUpPage(){
    let signup = document.getElementsByClassName("signupbox");
    let sign = document.getElementsByClassName("signbox");
    if(sign[0].style.display == "block"){
        signup[0].style.display = "block";
        sign[0].style.display = "none";
    }
}

function BackToSign(){
    let signup = document.getElementsByClassName("signupbox");
    let sign = document.getElementsByClassName("signbox");
    if(signup[0].style.display == "block"){
        signup[0].style.display = "none";
        sign[0].style.display = "block";
    }
}

function closeJump(){
    let signup = document.getElementsByClassName("signupbox");
    let sign = document.getElementsByClassName("signbox");
    let background = document.getElementsByClassName("background_layer");
    signup[0].style.display = "none";
    sign[0].style.display = "none";
    background[0].style.display = "none";
}

function signIn(){
    let position = document.getElementsByClassName("signform")[0];
    let data = getform(position);
    let data_to_python = JSON.stringify(data);

    var requestURL = "http://52.76.36.230:3000/api/user";
    var request = new XMLHttpRequest();

    request.open("patch" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
    
    request.onload = function(){
        if (request.status >= 200 && request.status < 400){
            closeJump();
            let button = document.querySelector("#signin");
            button.removeAttribute("onclick");
            button.addEventListener("click", signOut, true);
            let text = document.createTextNode("歡迎光臨 / 登出");
            button.removeChild(button.childNodes[0]);
            button.appendChild(text);

            window.location = window.location;

            let orderlist = document.querySelector("#orderlist");
            orderlist.style.display = "block";
            orderlist.addEventListener("click", () => {
                window.open("http://52.76.36.230:3000/thankyou");
            })
        }else if(request.status >= 400){

            let signform = document.querySelector("body > div.signbox > form");
            signform.style.height="285px";
            let signbox = document.querySelector("body > div.signbox");
            signbox.style.height = "320px";
            let emailbox = document.querySelector("body > div.signbox > form > input.emailbox");
            let password = document.querySelector("body > div.signbox > form > div.input_box > input");
            emailbox.style.border ="1px solid rgb(224, 138, 138)"
            password.style.border ="1px solid rgb(224, 138, 138)"
            let textarea = document.querySelector("body > div.signbox > form > div.input_box > div");
            let text = document.createTextNode("帳號或密碼錯誤請重新輸入");
            if(textarea.childNodes[2]){
                textarea.removeChild(textarea.childNodes[2]);
            };
            textarea.appendChild(text);
            textarea.style.display="block";
        }
    };
};

function signUp(){
    let position = document.getElementsByClassName("signupform")[0];
    let data = getform(position);
    let data_to_python = JSON.stringify(data);

    let requestURL = "http://52.76.36.230:3000/api/user";
    let request = new XMLHttpRequest();

    let signIn = document.querySelector("body > div.signbox > form > div.notification > span");
    signIn.addEventListener("click", () => {
        signupformRecovery();
    })

    request.open("POST" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
    
    request.onload = function(){
        if (request.status >= 200 && request.status < 400){
            signupformRecovery();
            let success =document.querySelector("body > div.signupbox > form > div.notification > div");
            let signup = document.querySelector("body > div.signupbox");
            signup.style.height = "410px";
            success.style.display = "block";
        }else if(request.status >= 400){
            signupformRecovery();
            let json = JSON.parse(request.responseText);
            let message = json.message;
            let emailbox = document.querySelector("body > div.signupbox > form > div:nth-child(2) > input");
            let password = document.querySelector("body > div.signupbox > form > div:nth-child(3) > input");
            let username = document.querySelector("body > div.signupbox > form > div:nth-child(4) > input");
            let email_error = document.querySelector("body > div.signupbox > form > div:nth-child(2) > div");
            let username_error = document.querySelector("body > div.signupbox > form > div:nth-child(4) > div");
            if(message == "每個欄位皆須填寫"){
                emailbox.style.border = "1px solid rgb(224, 138, 138)";
                password.style.border = "1px solid rgb(224, 138, 138)";
                username.style.border = "1px solid rgb(224, 138, 138)";
                let signup = document.querySelector("body > div.signupbox");
                signup.style.height = "410px";
                let text = document.createTextNode(message);
                if(username_error.childNodes[2]){
                    username_error.removeChild(username_error.childNodes[2]);
                };
                username_error.appendChild(text);
                username_error.style.display = "block";
            }else if(message == "Email已有人使用"){
                emailbox.style.border = "1px solid rgb(224, 138, 138)";
                let signup = document.querySelector("body > div.signupbox");
                signup.style.height = "410px";
                let text = document.createTextNode(message);
                if(email_error.childNodes[2]){
                    email_error.removeChild(email_error.childNodes[2]);
                };
                email_error.appendChild(text);
                email_error.style.display = "block";
            }else if(message == "使用者名稱已有人使用"){
                username.style.border = "1px solid rgb(224, 138, 138)";
                let signup = document.querySelector("body > div.signupbox");
                signup.style.height = "410px";
                let text = document.createTextNode(message);
                if(username_error.childNodes[2]){
                    username_error.removeChild(username_error.childNodes[2]);
                };
                username_error.appendChild(text);
                username_error.style.display = "block";
            }
        }
    };
}

function signOut(){

    let requestURL = "http://52.76.36.230:3000/api/user";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if (request.status >= 200){
            let button = document.querySelector("#signin");
            let text = document.createTextNode("登入/註冊");
            button.removeChild(button.childNodes[0]);
            button.appendChild(text);
            button.removeEventListener("click", signOut, true);
            button.addEventListener("click", SignInPage, true);
            window.location = window.location;
        };
    };
    request.open("DELETE" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
};

function signCheck(){

    let requestURL = "http://52.76.36.230:3000/api/user";
    let request = new XMLHttpRequest();
    request.onload = function(){
        if (request.status >= 200){
            let json = JSON.parse(request.responseText);
            if(json.data){

                let button = document.querySelector("#signin");
                button.removeAttribute("onclick");
                button.addEventListener("click", signOut, true);
                let text = document.createTextNode("歡迎光臨 / 登出");
                button.removeChild(button.childNodes[0]);
                button.appendChild(text);
                
                let orderlist = document.querySelector("#orderlist");
                orderlist.style.display = "block";
                orderlist.addEventListener("click", () => {
                    window.open("http://52.76.36.230:3000/thankyou");
                })
            }
        };
    };
    request.open("GET" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send();
}

function BookingPage(){
    let but = document.querySelector("#order");
    
    but.addEventListener("click", () => {
        let requestURL = "http://52.76.36.230:3000/api/user";
        let request = new XMLHttpRequest();
        request.onload = function(){
            if (request.status >= 200){
                let json = JSON.parse(request.responseText);
                if(json.data){
                    
                    window.open("http://52.76.36.230:3000/booking");

                }else if(json.data == null){
                    
                    alert("請先登入");
                    
                    return false;
                }
            };
        };
        request.open("GET" , requestURL , true);
        request.setRequestHeader('content-type', 'application/json');
        request.send();
    })
};

function signupformRecovery(){
    let email = document.querySelector("body > div.signupbox > form > div:nth-child(2) > input");
    let password = document.querySelector("body > div.signupbox > form > div:nth-child(3) > input");
    let username = document.querySelector("body > div.signupbox > form > div:nth-child(4) > input");
    let email_error = document.querySelector("body > div.signupbox > form > div:nth-child(2) > div");
    let username_error = document.querySelector("body > div.signupbox > form > div:nth-child(4) > div");
    let success = document.querySelector("body > div.signupbox > form > div.notification > div");
    email.style.border = "1px solid #CCCCCC";
    password.style.border = "1px solid #CCCCCC";
    password.value = "";
    username.style.border = "1px solid #CCCCCC";
    email_error.style.display ="none";
    username_error.style.display ="none";
    success.style.display="none";
    let signup = document.querySelector("body > div.signupbox");
    signup.style.height = "380px";
};