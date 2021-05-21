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
        }else if(request.status >= 400){
            let textarea = document.querySelector("body > div.signbox > form > div:nth-child(6)");
            let text = document.createTextNode("帳號或密碼錯誤請重新輸入");
            if(textarea.childNodes[0]){
                textarea.removeChild(textarea.childNodes[0]);
            };
            textarea.appendChild(text);
        }
    };
};

function signUp(){
    let position = document.getElementsByClassName("signupform")[0];
    let data = getform(position);
    let data_to_python = JSON.stringify(data);

    let requestURL = "http://52.76.36.230:3000/api/user";
    let request = new XMLHttpRequest();
    request.open("POST" , requestURL , true);
    request.setRequestHeader('content-type', 'application/json');
    request.send(data_to_python);
    
    request.onload = function(){
        if (request.status >= 200 && request.status < 400){
            let textarea = document.querySelector("body > div.signupbox > form > div:nth-child(7)");
            let text = document.createTextNode("註冊成功，請點擊<點此登入>進行登入");
            if(textarea.childNodes[0]){
                textarea.removeChild(textarea.childNodes[0]);
            };
            textarea.appendChild(text);

        }else if(request.status >= 400){
            
            let json = JSON.parse(request.responseText);
            let textarea = document.querySelector("body > div.signupbox > form > div:nth-child(7)");
            let text = document.createTextNode(json.message);
            if(textarea.childNodes[0]){
                textarea.removeChild(textarea.childNodes[0]);
            };
            textarea.appendChild(text);
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

    let requestURL = "http://127.0.0.1:3000/api/user";
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


